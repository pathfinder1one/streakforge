import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship

from app.core.database import Base


class CategoryEnum(str, enum.Enum):
    study = "Study"
    coding = "Coding"
    reading = "Reading"
    health = "Health"
    personal = "Personal"


class PriorityEnum(str, enum.Enum):
    high = "High"
    medium = "Medium"
    low = "Low"


class FrequencyEnum(str, enum.Enum):
    daily = "Daily"
    weekly = "Weekly"
    one_time = "One Time"


class TargetTypeEnum(str, enum.Enum):
    positive = "positive"   # Build a habit
    negative = "negative"   # Break a habit


class Target(Base):
    __tablename__ = "targets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    link = Column(String, nullable=True)
    category = Column(Enum(CategoryEnum), default=CategoryEnum.personal, nullable=False)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.medium, nullable=False)

    # Minimum time required, in minutes
    minimum_time = Column(Integer, default=0, nullable=False)
    frequency = Column(Enum(FrequencyEnum), default=FrequencyEnum.daily, nullable=False)

    scheduled_date = Column(DateTime, nullable=True) # Storing as DateTime for flexibility
    alert_time = Column(String, nullable=True) # Storing as String "HH:MM" for simpler frontend integration

    # Target type: positive (build habit) or negative (break habit)
    target_type = Column(Enum(TargetTypeEnum), default=TargetTypeEnum.positive, nullable=False)

    # Progress-based tracking (optional; if set, metric_goal must be reached instead of time)
    metric_unit = Column(String, nullable=True)   # e.g. "liters", "pages", "km"
    metric_goal = Column(Float, nullable=True)    # e.g. 2.0, 50, 5.0

    # For negative targets: whether the user already failed today
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Feature #9: Drag & Drop Reordering
    order = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="targets")
    sessions = relationship("TargetSession", back_populates="target", cascade="all, delete-orphan")
    subtasks = relationship("TargetSubtask", back_populates="target", cascade="all, delete-orphan")
    metric_logs = relationship("TargetMetricLog", back_populates="target", cascade="all, delete-orphan")


class TargetSubtask(Base):
    __tablename__ = "target_subtasks"

    id = Column(Integer, primary_key=True, index=True)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False)
    title = Column(String, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    target = relationship("Target", back_populates="subtasks")


class TargetMetricLog(Base):
    """Stores per-day metric progress for progress-based targets."""
    __tablename__ = "target_metric_logs"

    id = Column(Integer, primary_key=True, index=True)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False)
    log_date = Column(DateTime, nullable=False)  # stored as date
    value = Column(Float, nullable=False)  # amount logged (cumulative for that day)
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    target = relationship("Target", back_populates="metric_logs")
