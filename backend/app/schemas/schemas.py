from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

from app.models.models import GoalStatus, ProgressStatus, Role, UomType


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: Role
    manager_id: int | None
    department: str

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = "AlignX@123"
    role: Role
    manager_id: int | None = None
    department: str


class GoalBase(BaseModel):
    thrust_area: str
    title: str
    description: str
    uom_type: UomType
    target: str
    weightage: float = Field(ge=10, le=100)
    direction: str = "min"


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    thrust_area: str | None = None
    title: str | None = None
    description: str | None = None
    uom_type: UomType | None = None
    target: str | None = None
    weightage: float | None = Field(default=None, ge=10, le=100)
    direction: str | None = None


class GoalOut(GoalBase):
    id: int
    employee_id: int
    status: GoalStatus
    approved: bool
    locked: bool
    manager_comment: str | None
    created_at: datetime
    updated_at: datetime
    employee: UserOut | None = None

    class Config:
        from_attributes = True


class ReviewIn(BaseModel):
    action: str
    manager_comment: str | None = None
    target: str | None = None
    weightage: float | None = Field(default=None, ge=10, le=100)


class CheckInIn(BaseModel):
    goal_id: int
    quarter: str
    planned_target: str
    actual_achievement: str
    progress_status: ProgressStatus


class CheckInOut(CheckInIn):
    id: int
    manager_comment: str | None
    progress_percent: float
    checkin_date: datetime

    class Config:
        from_attributes = True


class SharedGoalIn(BaseModel):
    primary_owner_id: int
    linked_employee_ids: list[int]
    goal_id: int


class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    read_status: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CycleIn(BaseModel):
    name: str
    month_window: str
    active: bool = True


class AuditOut(BaseModel):
    id: int
    action: str
    changed_by: int
    timestamp: datetime
    previous_value: str | None
    updated_value: str | None

    class Config:
        from_attributes = True
