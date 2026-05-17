from collections import Counter, defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.models import CheckIn, Escalation, Goal, Role, User


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    goals_query = db.query(Goal)
    if user.role == Role.employee:
        goals_query = goals_query.filter(Goal.employee_id == user.id)
    elif user.role == Role.manager:
        goals_query = goals_query.filter(Goal.employee_id.in_([member.id for member in user.team_members]))
    goals = goals_query.all()
    checkins = db.query(CheckIn).filter(CheckIn.goal_id.in_([g.id for g in goals])).all() if goals else []
    users = db.query(User).all()

    status_counts = Counter(goal.status.value for goal in goals)
    dept_scores = defaultdict(list)
    for checkin in checkins:
        dept_scores[checkin.goal.employee.department].append(checkin.progress_percent)
    department_performance = [
        {"department": dept, "score": round(sum(scores) / len(scores), 1)}
        for dept, scores in dept_scores.items()
    ]
    quarters = ["Q1", "Q2", "Q3", "Q4"]
    quarterly_trend = []
    for quarter in quarters:
        values = [c.progress_percent for c in checkins if c.quarter == quarter]
        quarterly_trend.append({"quarter": quarter, "progress": round(sum(values) / len(values), 1) if values else 0})

    return {
        "kpis": {
            "goals": len(goals),
            "approved": status_counts.get("Approved", 0),
            "pending": status_counts.get("Submitted", 0),
            "avgProgress": round(sum(c.progress_percent for c in checkins) / len(checkins), 1) if checkins else 0,
            "users": len(users),
            "escalations": db.query(Escalation).filter(Escalation.resolved.is_(False)).count(),
        },
        "statusBreakdown": [{"name": key, "value": value} for key, value in status_counts.items()],
        "quarterlyTrend": quarterly_trend,
        "departmentPerformance": department_performance,
        "goalDistribution": [{"name": key, "value": value} for key, value in Counter(g.thrust_area for g in goals).items()],
        "teamAchievement": [
            {"name": employee.name, "goals": len(employee.goals), "progress": round(sum(c.progress_percent for g in employee.goals for c in g.checkins) / max(1, sum(len(g.checkins) for g in employee.goals)), 1)}
            for employee in users if employee.role == Role.employee
        ],
    }
