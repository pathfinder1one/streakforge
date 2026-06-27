import enum
import string
import random
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base


def _generate_invite_code(length: int = 8) -> str:
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choices(chars, k=length))


class SquadRoleEnum(str, enum.Enum):
    owner = "owner"
    member = "member"


class Squad(Base):
    __tablename__ = "squads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    invite_code = Column(String, unique=True, nullable=False, default=_generate_invite_code)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    members = relationship("SquadMember", back_populates="squad", cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by])


class SquadMember(Base):
    __tablename__ = "squad_members"

    id = Column(Integer, primary_key=True, index=True)
    squad_id = Column(Integer, ForeignKey("squads.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(Enum(SquadRoleEnum), default=SquadRoleEnum.member, nullable=False)
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    squad = relationship("Squad", back_populates="members")
    user = relationship("User")
