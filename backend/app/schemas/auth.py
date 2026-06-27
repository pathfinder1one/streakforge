from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    tz_offset_minutes: int = 330  # default to IST; frontend should send actual offset
    referral_code: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: int
    name: str
    email: EmailStr
    current_streak: int
    longest_streak: int
    streak_freezes: int
    xp: int
    level: int
    coins: int
    avatar_url: str | None = None
    last_monthly_reward_claim: datetime | None = None
    referral_code: str | None = None
    tz_offset_minutes: int

    class Config:
        from_attributes = True
