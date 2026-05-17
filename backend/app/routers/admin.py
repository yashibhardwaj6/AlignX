from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import require_roles
from app.auth.security import hash_password
from app.database.session import get_db
from app.models.models import AuditLog, CycleWindow, Escalation, Role, User
from app.schemas.schemas import AuditOut, CycleIn, UserCreate, UserOut
from app.services.audit import audit


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserOut])
def users(db: Session = Depends(get_db), _=Depends(require_roles(Role.admin, Role.manager))):
    return db.query(User).order_by(User.name).all()


@router.post("/users", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db), actor: User = Depends(require_roles(Role.admin))):
    user = User(**payload.model_dump(exclude={"password"}), password=hash_password(payload.password))
    db.add(user)
    db.flush()
    audit(db, "User created", actor.id, None, payload.email)
    db.commit()
    db.refresh(user)
    return user


@router.get("/audits", response_model=list[AuditOut])
def audits(db: Session = Depends(get_db), _=Depends(require_roles(Role.admin))):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(200).all()


@router.get("/escalations")
def escalations(db: Session = Depends(get_db), _=Depends(require_roles(Role.admin, Role.manager))):
    rows = db.query(Escalation).order_by(Escalation.created_at.desc()).all()
    return rows


@router.get("/cycles")
def cycles(db: Session = Depends(get_db), _=Depends(require_roles(Role.admin, Role.manager, Role.employee))):
    return db.query(CycleWindow).order_by(CycleWindow.id).all()


@router.post("/cycles")
def upsert_cycle(payload: CycleIn, db: Session = Depends(get_db), actor: User = Depends(require_roles(Role.admin))):
    cycle = CycleWindow(**payload.model_dump())
    db.add(cycle)
    audit(db, "Cycle window created", actor.id, None, payload.model_dump_json())
    db.commit()
    db.refresh(cycle)
    return cycle
