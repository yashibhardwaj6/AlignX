from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_roles
from app.database.session import get_db
from app.models.models import CheckIn, Goal, ProgressStatus, Role, User
from app.schemas.schemas import CheckInIn, CheckInOut
from app.services.audit import audit, notify
from app.services.progress import calculate_progress


router = APIRouter(prefix="/checkins", tags=["checkins"])


@router.get("", response_model=list[CheckInOut])
def list_checkins(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(CheckIn).join(Goal)
    if user.role == Role.employee:
        query = query.filter(Goal.employee_id == user.id)
    elif user.role == Role.manager:
        query = query.filter(Goal.employee_id.in_([member.id for member in user.team_members]))
    return query.order_by(CheckIn.checkin_date.desc()).all()


@router.post("", response_model=CheckInOut)
def submit_checkin(payload: CheckInIn, db: Session = Depends(get_db), user: User = Depends(require_roles(Role.employee, Role.admin))):
    goal = db.get(Goal, payload.goal_id)
    if not goal:
        raise HTTPException(404, "Goal not found.")
    if user.role == Role.employee and goal.employee_id != user.id:
        raise HTTPException(403, "You can only update your own check-ins.")
    percent = 100.0 if payload.progress_status == ProgressStatus.completed else calculate_progress(goal.uom_type.value, goal.target, payload.actual_achievement, goal.direction)
    checkin = CheckIn(**payload.model_dump(), progress_percent=percent)
    db.add(checkin)
    if goal.employee.manager_id:
        notify(db, goal.employee.manager_id, f"{payload.quarter} check-in submitted", f"{goal.employee.name} updated {goal.title}.")
    audit(db, "Quarterly check-in submitted", user.id, None, payload.model_dump_json())
    db.commit()
    db.refresh(checkin)
    return checkin


@router.patch("/{checkin_id}/comment", response_model=CheckInOut)
def manager_comment(checkin_id: int, manager_comment: str, db: Session = Depends(get_db), user: User = Depends(require_roles(Role.manager, Role.admin))):
    checkin = db.get(CheckIn, checkin_id)
    if not checkin:
        raise HTTPException(404, "Check-in not found.")
    if user.role == Role.manager and checkin.goal.employee.manager_id != user.id:
        raise HTTPException(403, "You can only comment on your team check-ins.")
    checkin.manager_comment = manager_comment
    audit(db, "Manager check-in comment", user.id, None, manager_comment)
    db.commit()
    db.refresh(checkin)
    return checkin
