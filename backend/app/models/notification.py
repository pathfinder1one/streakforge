import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base


class NotificationTypeEnum(str, enum.Enum):
    nudge = "nudge"
    cheer = "cheer"
    system = "system"
    achievement = "achievement"
    level_up = "level_up"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null for system notifications
    notification_type = Column(Enum(NotificationTypeEnum), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    icon = Column(String, nullable=True)  # emoji icon
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    recipient = relationship("User", foreign_keys=[recipient_id])
    sender = relationship("User", foreign_keys=[sender_id])
