"""
AIConversation model — stores multi-turn conversation history for the Sentinel agent.
Each row is one message turn (user or assistant) linked to a user and optionally a target.
"""
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Optional: conversation scoped to a specific target
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=True, index=True)

    # Which specialist agent handled this turn
    # Options: sentinel, compiler, scholar, coach, accountant
    agent_type = Column(String, default="sentinel", nullable=False)

    # "user" or "assistant"
    role = Column(String, nullable=False)

    # The actual message text
    message = Column(Text, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", foreign_keys=[user_id])
