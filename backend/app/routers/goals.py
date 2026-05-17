from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_user, require_roles
from app.database.session import get_db
from app.models.models import Goal, GoalStatus, Role, SharedGoal, User
from app.schemas.schemas import GoalCreate, GoalOut, GoalUpdate, ReviewIn, SharedGoalIn
from app.services.audit import audit, notify


router = APIRouter(prefix="/goals", tags=["goals"])


def _visible_goals(db: Session, user: User):
    query = db.query(Goal).options(joinedload(Goal.employee))
    if user.role == Role.employee:
        return query.filter(Goal.employee_id == user.id)
    if user.role == Role.manager:
        team_ids = [member.id for member in user.team_members]
        return query.filter(Goal.employee_id.in_(team_ids))
    return query


def _validate_goal_sheet(db: Session, employee_id: int, next_weight: float | None = None, exclude_goal_id: int | None = None):
    goals = db.query(Goal).filter(Goal.employee_id == employee_id, Goal.id != exclude_goal_id).all()
    if len(goals) >= 8 and next_weight is not None:
        raise HTTPException(422, "Maximum 8 goals are allowed per employee.")
    weights = [g.weightage for g in goals]
    if next_weight is not None:
        weights.append(next_weight)
    if any(weight < 10 for weight in weights):
        raise HTTPException(422, "Each goal must carry at least 10% weightage.")


@router.get("", response_model=list[GoalOut])
def list_goals(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _visible_goals(db, user).order_by(Goal.updated_at.desc()).all()


@router.post("", response_model=GoalOut)
def create_goal(payload: GoalCreate, db: Session = Depends(get_db), user: User = Depends(require_roles(Role.employee, Role.admin))):
    owner_id = user.id if user.role == Role.employee else user.id
    _validate_goal_sheet(db, owner_id, payload.weightage)
    goal = Goal(employee_id=owner_id, **payload.model_dump())
    db.add(goal)
    audit(db, "Goal created", user.id, None, payload.model_dump_json())
    db.commit()
    db.refresh(goal)
    return goal


@router.patch("/{goal_id}", response_model=GoalOut)
def update_goal(goal_id: int, payload: GoalUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    goal = db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(404, "Goal not found.")
    if goal.locked and user.role != Role.admin:
        raise HTTPException(423, "Approved goals are locked. Ask HR to unlock this goal.")
    if user.role == Role.employee and goal.employee_id != user.id:
        raise HTTPException(403, "You can only edit your own goals.")
    before = f"{goal.title}|{goal.target}|{goal.weightage}|{goal.status}"
    update = payload.model_dump(exclude_unset=True)
    if "weightage" in update:
        _validate_goal_sheet(db, goal.employee_id, update["weightage"], goal.id)
    for key, value in update.items():
        setattr(goal, key, value)
    audit(db, "Goal updated", user.id, before, str(update))
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db), user: User = Depends(require_roles(Role.employee, Role.admin))):
    goal = db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(404, "Goal not found.")
    if goal.locked or goal.status != GoalStatus.draft:
        raise HTTPException(422, "Only draft, unlocked goals can be deleted.")
    if user.role == Role.employee and goal.employee_id != user.id:
        raise HTTPException(403, "You can only delete your own goals.")
    db.delete(goal)
    audit(db, "Goal deleted", user.id, str(goal_id), None)
    db.commit()
    return {"ok": True}


@router.post("/submit")
def submit_goal_sheet(db: Session = Depends(get_db), user: User = Depends(require_roles(Role.employee))):
    goals = db.query(Goal).filter(Goal.employee_id == user.id).all()
    total = round(sum(goal.weightage for goal in goals), 2)
    if not goals:
        raise HTTPException(422, "Create at least one goal before submitting your goal sheet.")
    if total != 100:
        raise HTTPException(422, f"Total weightage must equal 100%. Current total is {total}%.")
    for goal in goals:
        if not goal.locked:
            goal.status = GoalStatus.submitted
    if user.manager_id:
        notify(db, user.manager_id, "Goal sheet submitted", f"{user.name} submitted goals for approval.")
    audit(db, "Goal sheet submitted", user.id, None, f"{len(goals)} goals")
    db.commit()
    return {"message": "Goal sheet submitted successfully."}


@router.post("/{goal_id}/review", response_model=GoalOut)
def review_goal(goal_id: int, payload: ReviewIn, db: Session = Depends(get_db), user: User = Depends(require_roles(Role.manager, Role.admin))):
    goal = db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(404, "Goal not found.")
    if user.role == Role.manager and goal.employee.manager_id != user.id:
        raise HTTPException(403, "You can only review direct team goals.")
    before = f"{goal.status}|{goal.target}|{goal.weightage}"
    if payload.target:
        goal.target = payload.target
    if payload.weightage:
        _validate_goal_sheet(db, goal.employee_id, payload.weightage, goal.id)
        goal.weightage = payload.weightage
    goal.manager_comment = payload.manager_comment
    action = payload.action.lower()
    if action == "approve":
        goal.status = GoalStatus.approved
        goal.approved = True
        goal.locked = True
        notify(db, goal.employee_id, "Goal approved", f"{goal.title} has been approved and locked.")
    elif action == "reject":
        goal.status = GoalStatus.rejected
        notify(db, goal.employee_id, "Goal rejected", payload.manager_comment or "Your goal was rejected.")
    elif action == "return":
        goal.status = GoalStatus.returned
        notify(db, goal.employee_id, "Goal returned for rework", payload.manager_comment or "Please update and resubmit.")
    else:
        raise HTTPException(422, "Action must be approve, reject, or return.")
    audit(db, f"Goal {action}", user.id, before, f"{goal.status}|{goal.target}|{goal.weightage}")
    db.commit()
    db.refresh(goal)
    return goal


@router.post("/{goal_id}/unlock", response_model=GoalOut)
def unlock_goal(goal_id: int, db: Session = Depends(get_db), user: User = Depends(require_roles(Role.admin))):
    goal = db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(404, "Goal not found.")
    before = f"locked={goal.locked}"
    goal.locked = False
    goal.status = GoalStatus.returned
    audit(db, "Goal unlocked by HR", user.id, before, "locked=False")
    notify(db, goal.employee_id, "Goal unlocked", "HR has unlocked a goal for controlled edits.")
    db.commit()
    db.refresh(goal)
    return goal


@router.post("/shared")
def create_shared_goal(payload: SharedGoalIn, db: Session = Depends(get_db), user: User = Depends(require_roles(Role.manager, Role.admin))):
    source = db.get(Goal, payload.goal_id)
    if not source:
        raise HTTPException(404, "Source goal not found.")
    created = []
    for employee_id in payload.linked_employee_ids:
        clone = Goal(
            employee_id=employee_id,
            thrust_area=source.thrust_area,
            title=source.title,
            description=source.description,
            uom_type=source.uom_type,
            target=source.target,
            weightage=10,
            status=GoalStatus.draft,
            direction=source.direction,
        )
        db.add(clone)
        db.flush()
        db.add(SharedGoal(primary_owner_id=payload.primary_owner_id, linked_employee_id=employee_id, goal_id=clone.id))
        created.append(clone.id)
    audit(db, "Shared goals assigned", user.id, str(payload.goal_id), str(created))
    db.commit()
    return {"created_goal_ids": created, "message": "Shared departmental goals assigned."}
