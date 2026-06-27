from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest


def register_user(db: Session, data: RegisterRequest) -> User:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    import string
    import random
    
    # Generate unique 6 char code
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if not db.query(User).filter(User.referral_code == code).first():
            break

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        tz_offset_minutes=data.tz_offset_minutes,
        referral_code=code,
    )
    
    # Handle referral
    if data.referral_code:
        referrer = db.query(User).filter(User.referral_code == data.referral_code).first()
        if referrer:
            referrer.coins += 500
            user.coins += 500
            
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, data: LoginRequest) -> User:
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    return user


def create_token_for_user(user: User) -> str:
    return create_access_token(data={"sub": str(user.id)})
