from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.security import authenticate_user, create_access_token
from app.database.session import get_db
from app.schemas.schemas import LoginIn, Token, UserOut


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return Token(access_token=token, user=user)


@router.get("/me", response_model=UserOut)
def me(user=Depends(get_current_user)):
    return user
