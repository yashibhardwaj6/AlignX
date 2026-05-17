from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, DateTime, Enum as SqlEnum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Role(str, Enum):
    employee = "employee"
    manager = "manager"
    admin = "admin"


class GoalStatus(str, Enum):
    draft = "Draft"
    submitted = "Submitted"
    approved = "Approved"
    returned = "Returned"
    rejected = "Rejected"


class ProgressStatus(str, Enum):
    not_started = "Not Started"
    on_track = "On Track"
    completed = "Completed"


class UomType(str, Enum):
    numeric = "Numeric"
    percentage = "Percentage"
    timeline = "Timeline"
    zero_based = "Zero-based"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(SqlEnum(Role), default=Role.employee)
    manager_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    department: Mapped[str] = mapped_column(String(120), default="Corporate")

    manager: Mapped["User"] = relationship(remote_side=[id], backref="team_members")
    goals: Mapped[list["Goal"]] = relationship(back_populates="employee")


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    thrust_area: Mapped[str] = mapped_column(String(160))
    title: Mapped[str] = mapped_column(String(240))
    description: Mapped[str] = mapped_column(Text)
    uom_type: Mapped[UomType] = mapped_column(SqlEnum(UomType))
    target: Mapped[str] = mapped_column(String(120))
    weightage: Mapped[float] = mapped_column(Float)
    status: Mapped[GoalStatus] = mapped_column(SqlEnum(GoalStatus), default=GoalStatus.draft)
    approved: Mapped[bool] = mapped_column(Boolean, default=False)
    locked: Mapped[bool] = mapped_column(Boolean, default=False)
    manager_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    direction: Mapped[str] = mapped_column(String(16), default="min")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee: Mapped[User] = relationship(back_populates="goals")
    checkins: Mapped[list["CheckIn"]] = relationship(back_populates="goal", cascade="all, delete-orphan")


class CheckIn(Base):
    __tablename__ = "checkins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    goal_id: Mapped[int] = mapped_column(ForeignKey("goals.id"), index=True)
    quarter: Mapped[str] = mapped_column(String(8))
    planned_target: Mapped[str] = mapped_column(String(120))
    actual_achievement: Mapped[str] = mapped_column(String(120))
    progress_status: Mapped[ProgressStatus] = mapped_column(SqlEnum(ProgressStatus))
    manager_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    progress_percent: Mapped[float] = mapped_column(Float, default=0)
    checkin_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    goal: Mapped[Goal] = relationship(back_populates="checkins")


class SharedGoal(Base):
    __tablename__ = "shared_goals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    primary_owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    linked_employee_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    goal_id: Mapped[int] = mapped_column(ForeignKey("goals.id"))


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    action: Mapped[str] = mapped_column(String(200))
    changed_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    previous_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_value: Mapped[str | None] = mapped_column(Text, nullable=True)


class Escalation(Base):
    __tablename__ = "escalations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    escalation_type: Mapped[str] = mapped_column(String(120))
    escalation_level: Mapped[str] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(160))
    message: Mapped[str] = mapped_column(Text)
    read_status: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CycleWindow(Base):
    __tablename__ = "cycle_windows"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    month_window: Mapped[str] = mapped_column(String(120))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
