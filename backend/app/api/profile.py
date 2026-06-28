from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
import os
import shutil
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.auth import UserProfile, ProfileUpdate

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/profile", response_model=UserProfile)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserProfile)
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.name = data.name
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/buy-freeze")
def buy_freeze(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.coins < 100:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough Forge Coins.")
    if current_user.streak_freezes >= 5:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You already have the maximum number of streak freezes (5).")
    
    current_user.coins -= 100
    current_user.streak_freezes += 1
    db.commit()
    
    return {
        "detail": "Streak freeze purchased!", 
        "coins": current_user.coins, 
        "streak_freezes": current_user.streak_freezes
    }


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate extension
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid image format")

    from app.core.config import settings

    if settings.cloudinary_url:
        import cloudinary.uploader
        try:
            result = cloudinary.uploader.upload(
                file.file,
                public_id=f"streakforge/user_{current_user.id}",
                overwrite=True
            )
            avatar_url = result.get("secure_url")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")
    else:
        # Fallback to local storage if Cloudinary is not configured
        avatar_dir = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "avatars")
        os.makedirs(avatar_dir, exist_ok=True)

        filename = f"user_{current_user.id}{ext}"
        filepath = os.path.join(avatar_dir, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        avatar_url = f"/avatars/{filename}"

    # Update DB
    current_user.avatar_url = avatar_url
    db.commit()

    return {"avatar_url": avatar_url}


@router.post("/spin")
def daily_spin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime, timezone
    import random
    
    # Check if already spun today
    now = datetime.now(timezone.utc)
    if current_user.last_spin_date and current_user.last_spin_date.date() == now.date():
        raise HTTPException(status_code=400, detail="You have already spun the wheel today!")
        
    # Reward pool: list of (type, amount, probability_weight)
    rewards = [
        ("coins", 10, 50),
        ("xp", 50, 30),
        ("coins", 50, 15),
        ("xp", 200, 4),
        ("coins", 200, 1)
    ]
    
    total_weight = sum(w for _, _, w in rewards)
    r = random.uniform(0, total_weight)
    
    upto = 0
    selected_reward = None
    for type_, amount, weight in rewards:
        if upto + weight >= r:
            selected_reward = (type_, amount)
            break
        upto += weight
        
    type_, amount = selected_reward
    if type_ == "coins":
        current_user.coins += amount
    else:
        current_user.xp += amount
        
    current_user.last_spin_date = now
    db.commit()
    
    return {
        "reward_type": type_,
        "amount": amount,
        "new_coins": current_user.coins,
        "new_xp": current_user.xp
    }


@router.get("/export")
def export_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.target import Target
    targets = db.query(Target).filter(Target.user_id == current_user.id).all()
    
    export_obj = {
        "user": {
            "name": current_user.name,
            "email": current_user.email,
            "level": current_user.level,
            "xp": current_user.xp,
            "coins": current_user.coins,
            "current_streak": current_user.current_streak,
            "longest_streak": current_user.longest_streak,
            "joined_at": current_user.created_at.isoformat() if current_user.created_at else None
        },
        "targets": []
    }
    
    for t in targets:
        target_dict = {
            "id": t.id,
            "title": t.title,
            "category": t.category,
            "priority": t.priority,
            "frequency": t.frequency,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "subtasks": [{"title": st.title, "is_completed": st.is_completed} for st in t.subtasks],
            "sessions": [{"started_at": s.started_at.isoformat(), "duration": s.duration_seconds, "completed": s.completed} for s in t.sessions],
            "metrics": [{"date": m.log_date.isoformat(), "value": m.value, "note": m.note} for m in t.metric_logs]
        }
        export_obj["targets"].append(target_dict)
        
    return export_obj


@router.post("/mood")
def log_mood(
    mood: str,
    note: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.user import MoodLog
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    
    # Optional: check if already logged today
    existing = db.query(MoodLog).filter(
        MoodLog.user_id == current_user.id
    ).order_by(MoodLog.date.desc()).first()
    
    if existing and existing.date.date() == now.date():
        existing.mood = mood
        if note:
            existing.note = note
    else:
        new_log = MoodLog(user_id=current_user.id, mood=mood, note=note, date=now)
        db.add(new_log)
        
    db.commit()
    return {"detail": "Mood logged"}


@router.post("/email-report")
def send_test_email_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mock endpoint to send a weekly email report. 
    In a real app, this would use SendGrid or AWS SES.
    """
    return {"message": f"Weekly report sent to {current_user.email}!"}


@router.post("/upgrade")
def upgrade_to_pro(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mock endpoint to upgrade user to Pro. 
    In a real app, this would use Stripe Checkout.
    """
    return {"message": "Successfully upgraded to StreakForge Pro!"}


# ---------------------------------------------------------------------------
# Feature 9: Onboarding — User Persona Selection
# ---------------------------------------------------------------------------

VALID_PERSONAS = {"study", "fitness", "coding", "growth", "habits"}


class OnboardingRequest(BaseModel):
    persona: str  # study | fitness | coding | growth | habits


@router.post("/onboarding", response_model=UserProfile)
def set_onboarding_persona(
    data: OnboardingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Set user persona during onboarding. Can only be called once (or any time to update)."""
    if data.persona not in VALID_PERSONAS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid persona. Choose from: {', '.join(VALID_PERSONAS)}"
        )
    current_user.user_persona = data.persona
    db.commit()
    db.refresh(current_user)
    return current_user
