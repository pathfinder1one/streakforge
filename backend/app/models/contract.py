from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False)
    
    pledge_amount = Column(Integer, nullable=False, default=100)
    status = Column(String, nullable=False, default="active") # active, breached, resolved
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)
    
    user = relationship("User", backref="contracts")
    target = relationship("Target", backref="contracts")
