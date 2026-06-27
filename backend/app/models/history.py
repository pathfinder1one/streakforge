from sqlalchemy import Column, Integer, Date, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class DailyHistory(Base):
    __tablename__ = "daily_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    success = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="daily_history")

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_user_date"),
    )
