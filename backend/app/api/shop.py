from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.shop import ShopItem, UserPurchase, ShopItemTypeEnum

router = APIRouter(prefix="/shop", tags=["shop"])

# ─── Default shop items (seeded on first request) ────────────────────────────

DEFAULT_ITEMS = [
    {
        "name": "Streak Freeze",
        "description": "Protect your streak for one missed day. Auto-applied when you miss a day.",
        "icon": "🛡️",
        "item_type": ShopItemTypeEnum.streak_freeze,
        "price": 100,
        "effect_value": "1",
    },
    {
        "name": "XP Boost (2x)",
        "description": "Double your XP earnings for the next 24 hours.",
        "icon": "⚡",
        "item_type": ShopItemTypeEnum.xp_boost,
        "price": 200,
        "effect_value": "2.0",
    },
    {
        "name": "Ember Theme",
        "description": "Unlock the exclusive Ember dark theme with fiery accents.",
        "icon": "🔥",
        "item_type": ShopItemTypeEnum.theme,
        "price": 500,
        "effect_value": "ember",
    },
    {
        "name": "Galaxy Theme",
        "description": "Unlock the stunning Galaxy theme with deep space aesthetics.",
        "icon": "🌌",
        "item_type": ShopItemTypeEnum.theme,
        "price": 500,
        "effect_value": "galaxy",
    },
    {
        "name": "Diamond Frame",
        "description": "Show off a shimmering diamond avatar frame on your profile.",
        "icon": "💎",
        "item_type": ShopItemTypeEnum.avatar_frame,
        "price": 750,
        "effect_value": "diamond",
    },
    {
        "name": "Gold Frame",
        "description": "Display a prestigious gold avatar frame.",
        "icon": "🏅",
        "item_type": ShopItemTypeEnum.avatar_frame,
        "price": 400,
        "effect_value": "gold",
    },
    {
        "name": "Streak Freeze x3",
        "description": "Three streak freezes in one purchase — save 25%!",
        "icon": "❄️",
        "item_type": ShopItemTypeEnum.streak_freeze,
        "price": 250,
        "effect_value": "3",
    },
    {
        "name": "XP Mega Boost (3x)",
        "description": "Triple your XP earnings for 48 hours.",
        "icon": "🚀",
        "item_type": ShopItemTypeEnum.xp_boost,
        "price": 450,
        "effect_value": "3.0",
    },
]


def _seed_shop_items(db: Session):
    """Seed default shop items if they don't exist yet."""
    existing = db.query(ShopItem).count()
    if existing == 0:
        for item_data in DEFAULT_ITEMS:
            item = ShopItem(**item_data)
            db.add(item)
        db.commit()


@router.get("/items")
def get_shop_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all available shop items with user's purchase history."""
    _seed_shop_items(db)
    items = db.query(ShopItem).filter(ShopItem.is_available == True).all()  # noqa: E712

    purchased_item_ids = {
        p.item_id for p in db.query(UserPurchase).filter(UserPurchase.user_id == current_user.id).all()
    }

    return {
        "coins": current_user.coins,
        "items": [
            {
                "id": item.id,
                "name": item.name,
                "description": item.description,
                "icon": item.icon,
                "item_type": item.item_type.value,
                "price": item.price,
                "effect_value": item.effect_value,
                "is_purchased": item.id in purchased_item_ids,
                "can_afford": current_user.coins >= item.price,
            }
            for item in items
        ],
    }


class BuyRequest(BaseModel):
    item_id: int


@router.post("/buy")
def buy_item(
    data: BuyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Purchase a shop item with Forge Coins."""
    _seed_shop_items(db)
    item = db.query(ShopItem).filter(ShopItem.id == data.item_id, ShopItem.is_available == True).first()  # noqa: E712
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    if current_user.coins < item.price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough coins. Need {item.price}, have {current_user.coins}",
        )

    # Apply effect
    effect = item.effect_value
    if item.item_type == ShopItemTypeEnum.streak_freeze:
        quantity = int(effect or "1")
        current_user.streak_freezes = min(10, current_user.streak_freezes + quantity)
    # xp_boost / themes / avatar frames are recorded as purchases and frontend handles display

    current_user.coins -= item.price

    purchase = UserPurchase(user_id=current_user.id, item_id=item.id)
    db.add(purchase)
    db.commit()

    return {
        "detail": f"Purchased '{item.name}' successfully!",
        "coins_remaining": current_user.coins,
        "streak_freezes": current_user.streak_freezes,
        "item": {
            "id": item.id,
            "name": item.name,
            "icon": item.icon,
            "item_type": item.item_type.value,
            "effect_value": item.effect_value,
        },
    }


@router.get("/my-purchases")
def my_purchases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user's purchase history."""
    purchases = (
        db.query(UserPurchase)
        .filter(UserPurchase.user_id == current_user.id)
        .order_by(UserPurchase.purchased_at.desc())
        .all()
    )
    return {
        "purchases": [
            {
                "id": p.id,
                "item_id": p.item_id,
                "item_name": p.item.name,
                "item_icon": p.item.icon,
                "item_type": p.item.item_type.value,
                "effect_value": p.item.effect_value,
                "purchased_at": p.purchased_at.isoformat(),
            }
            for p in purchases
        ]
    }


from datetime import datetime, timezone

@router.post("/claim-monthly-reward")
def claim_monthly_reward(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Claim the monthly 500 free Forge Coins."""
    now = datetime.now(timezone.utc)
    
    if current_user.last_monthly_reward_claim:
        last_claim = current_user.last_monthly_reward_claim
        if last_claim.year == now.year and last_claim.month == now.month:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already claimed your monthly reward for this month.",
            )
            
    current_user.coins += 500
    current_user.last_monthly_reward_claim = now
    db.commit()
    
    return {
        "detail": "Monthly reward of 500 coins claimed successfully!",
        "coins_remaining": current_user.coins,
        "last_monthly_reward_claim": current_user.last_monthly_reward_claim.isoformat()
    }
