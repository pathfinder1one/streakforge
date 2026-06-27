import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base


class ShopItemTypeEnum(str, enum.Enum):
    streak_freeze = "streak_freeze"
    xp_boost = "xp_boost"
    theme = "theme"
    avatar_frame = "avatar_frame"
    badge_slot = "badge_slot"


class ShopItem(Base):
    __tablename__ = "shop_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    icon = Column(String, nullable=True)  # emoji or image path
    item_type = Column(Enum(ShopItemTypeEnum), nullable=False)
    price = Column(Integer, nullable=False)  # in Forge Coins
    is_available = Column(Boolean, default=True, nullable=False)
    # For xp_boost: multiplier value; for freeze: quantity; for theme: theme_id
    effect_value = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    purchases = relationship("UserPurchase", back_populates="item")


class UserPurchase(Base):
    __tablename__ = "user_purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("shop_items.id"), nullable=False)
    purchased_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    item = relationship("ShopItem", back_populates="purchases")
