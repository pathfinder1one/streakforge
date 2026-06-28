from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    # UTC offset in minutes, e.g. India = 330. Needed so "daily" streak
    # resets align with the user's actual day, not server UTC day.
    tz_offset_minutes = Column(Integer, default=330, nullable=False)

    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    streak_freezes = Column(Integer, default=0, nullable=False)
    
    # Gamification Phase 1
    xp = Column(Integer, default=0, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    coins = Column(Integer, default=0, nullable=False)
    
    avatar_url = Column(String, nullable=True)
    last_monthly_reward_claim = Column(DateTime, nullable=True)
    last_spin_date = Column(DateTime, nullable=True)
    referral_code = Column(String, unique=True, index=True, nullable=True)

    # Feature 9: Onboarding persona
    user_persona = Column(String, nullable=True)  # study|fitness|coding|growth|habits

    # Feature 8: Demo mode flag
    is_demo = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    targets = relationship("Target", back_populates="owner", cascade="all, delete-orphan")
    daily_history = relationship("DailyHistory", back_populates="user", cascade="all, delete-orphan")
    mood_logs = relationship("MoodLog", back_populates="user", cascade="all, delete-orphan")


class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mood = Column(String, nullable=False) # e.g., "Great", "Good", "Okay", "Bad", "Awful"
    note = Column(String, nullable=True)
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="mood_logs")
