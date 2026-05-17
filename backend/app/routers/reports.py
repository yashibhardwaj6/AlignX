from io import BytesIO, StringIO
import csv

from fastapi import APIRouter, Depends, Response
from openpyxl import Workbook
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.models import CheckIn, Goal, Role, User


router = APIRouter(prefix="/reports", tags=["reports"])


def _report_rows(db: Session, user: User):
    query = db.query(CheckIn).join(Goal)
    if user.role == Role.employee:
        query = query.filter(Goal.employee_id == user.id)
    elif user.role == Role.manager:
        query = query.filter(Goal.employee_id.in_([member.id for member in user.team_members]))
    rows = []
    for item in query.all():
        rows.append([
            item.goal.employee.name,
            item.goal.title,
            item.planned_target,
            item.actual_achievement,
            item.progress_status.value,
            item.progress_percent,
        ])
    return rows


@router.get("/{report_type}.csv")
def csv_report(report_type: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Employee name", "Goal title", "Planned target", "Actual achievement", "Status", "Completion percentage"])
    writer.writerows(_report_rows(db, user))
    return Response(output.getvalue(), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={report_type}.csv"})


@router.get("/{report_type}.xlsx")
def excel_report(report_type: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    wb = Workbook()
    ws = wb.active
    ws.title = "AlignX Report"
    ws.append(["Employee name", "Goal title", "Planned target", "Actual achievement", "Status", "Completion percentage"])
    for row in _report_rows(db, user):
        ws.append(row)
    stream = BytesIO()
    wb.save(stream)
    return Response(
        stream.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={report_type}.xlsx"},
    )
