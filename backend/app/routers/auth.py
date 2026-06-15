from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.audit import write_audit_log
from app.config import get_settings
from app.database import get_db
from app.models import User
from app.rate_limit import limiter
from app.schemas import LoginRequest, Token, UserCreate, UserRead
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
@limiter.limit(get_settings().rate_limit_auth)
def register(request: Request, payload: UserCreate, db: Session = Depends(get_db)) -> User:
    existing = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")

    user = User(email=payload.email.lower(), hashed_password=hash_password(payload.password))
    db.add(user)
    db.flush()
    write_audit_log(db, "auth.register", user_id=user.id)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
@limiter.limit(get_settings().rate_limit_auth)
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    write_audit_log(db, "auth.login", user_id=user.id)
    db.commit()
    return Token(access_token=create_access_token(str(user.id)))
