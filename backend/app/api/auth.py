from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.services.auth_service import register_user, authenticate_user, create_token_for_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(db, data)
    token = create_token_for_user(user)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, data)
    token = create_token_for_user(user)
    return TokenResponse(access_token=token)


@router.post("/demo", response_model=TokenResponse)
def create_demo_user(db: Session = Depends(get_db)):
    """Feature 8: Create a demo user for quick showcase."""
    import string
    import random
    from app.models.user import User
    from app.core.security import hash_password
    
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    demo_email = f"demo_{code.lower()}@streakforge.app"
    
    user = User(
        name="Demo User",
        email=demo_email,
        password_hash=hash_password("demopassword123"),
        tz_offset_minutes=0,
        referral_code=code,
        is_demo=True,
        user_persona="study", # default persona
        coins=100,
        xp=50,
        level=2,
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_token_for_user(user)
    return TokenResponse(access_token=token)
