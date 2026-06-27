from datetime import datetime, timezone, date

from sqlalchemy import Column, Integer, DateTime, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base


class TargetSession(Base):
    __tablename__ = "target_sessions"

    id = Column(Integer, primary_key=True, index=True)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False)

    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    ended_at = Column(DateTime, nullable=True)

    # Duration in seconds, computed when session ends
    duration_seconds = Column(Integer, default=0, nullable=False)

    # Local calendar date (user's timezone) this session counts toward.
    # Needed because a target can be opened/closed/reopened multiple times
    # in a day and durations must be summed for that specific day.
    session_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)

    completed = Column(Boolean, default=False, nullable=False)

    target = relationship("Target", back_populates="sessions")
