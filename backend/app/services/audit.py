from sqlalchemy.orm import Session

from app.models.models import AuditLog, Notification


def audit(db: Session, action: str, changed_by: int, previous_value: str | None = None, updated_value: str | None = None):
    db.add(AuditLog(action=action, changed_by=changed_by, previous_value=previous_value, updated_value=updated_value))


def notify(db: Session, user_id: int, title: str, message: str):
    db.add(Notification(user_id=user_id, title=title, message=message))
