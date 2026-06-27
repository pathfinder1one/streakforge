from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.target_session import TargetSession
from app.models.target import Target
from app.schemas.badges import Badge

router = APIRouter(tags=["badges"])


@router.get("/badges", response_model=list[Badge])
def get_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total targets completed
    total_completed = (
        db.query(func.count(TargetSession.id))
        .join(Target)
        .filter(
            Target.user_id == current_user.id,
            TargetSession.completed == True
        )
        .scalar()
    ) or 0

    longest_streak = current_user.longest_streak
    current_streak = current_user.current_streak
    level = current_user.level
    coins = current_user.coins

    # Sessions before 7am (Early Bird)
    early_bird_count = (
        db.query(func.count(TargetSession.id))
        .join(Target)
        .filter(
            Target.user_id == current_user.id,
            TargetSession.completed == True,
            extract('hour', TargetSession.started_at) < 7,
        )
        .scalar()
    ) or 0

    # Sessions after 11pm (Night Owl)
    night_owl_count = (
        db.query(func.count(TargetSession.id))
        .join(Target)
        .filter(
            Target.user_id == current_user.id,
            TargetSession.completed == True,
            extract('hour', TargetSession.started_at) >= 23,
        )
        .scalar()
    ) or 0

    badges = [
        # ─── Streak Badges ──────────────────────────────────────────────────
        Badge(
            id="streak_3",
            name="Spark",
            description="Reach a 3-day streak",
            icon="🔥",
            category="streak",
            is_unlocked=longest_streak >= 3,
            progress_percentage=min(100.0, (longest_streak / 3) * 100)
        ),
        Badge(
            id="streak_7",
            name="Iron Will",
            description="Reach a 7-day streak",
            icon="🛡️",
            category="streak",
            is_unlocked=longest_streak >= 7,
            progress_percentage=min(100.0, (longest_streak / 7) * 100)
        ),
        Badge(
            id="streak_30",
            name="Unstoppable",
            description="Reach a 30-day streak",
            icon="⚡",
            category="streak",
            is_unlocked=longest_streak >= 30,
            progress_percentage=min(100.0, (longest_streak / 30) * 100)
        ),
        Badge(
            id="streak_100",
            name="Centurion",
            description="Reach a legendary 100-day streak",
            icon="🏛️",
            category="streak",
            is_unlocked=longest_streak >= 100,
            progress_percentage=min(100.0, (longest_streak / 100) * 100)
        ),
        Badge(
            id="streak_365",
            name="Year of Fire",
            description="365 days — a full year of consistency",
            icon="🌟",
            category="streak",
            is_unlocked=longest_streak >= 365,
            progress_percentage=min(100.0, (longest_streak / 365) * 100)
        ),

        # ─── Completion Badges ───────────────────────────────────────────────
        Badge(
            id="targets_10",
            name="Getting Started",
            description="Complete 10 targets",
            icon="🎯",
            category="completion",
            is_unlocked=total_completed >= 10,
            progress_percentage=min(100.0, (total_completed / 10) * 100)
        ),
        Badge(
            id="targets_50",
            name="Executioner",
            description="Complete 50 targets",
            icon="⚔️",
            category="completion",
            is_unlocked=total_completed >= 50,
            progress_percentage=min(100.0, (total_completed / 50) * 100)
        ),
        Badge(
            id="targets_100",
            name="Time Lord",
            description="Complete 100 targets",
            icon="⏳",
            category="completion",
            is_unlocked=total_completed >= 100,
            progress_percentage=min(100.0, (total_completed / 100) * 100)
        ),
        Badge(
            id="targets_500",
            name="Legend",
            description="Complete 500 targets — you're a machine!",
            icon="🏆",
            category="completion",
            is_unlocked=total_completed >= 500,
            progress_percentage=min(100.0, (total_completed / 500) * 100)
        ),

        # ─── Time-of-Day Badges ──────────────────────────────────────────────
        Badge(
            id="early_bird",
            name="Early Bird",
            description="Complete a target before 7 AM",
            icon="🌅",
            category="time",
            is_unlocked=early_bird_count >= 1,
            progress_percentage=min(100.0, early_bird_count * 100)
        ),
        Badge(
            id="night_owl",
            name="Night Owl",
            description="Complete a target after 11 PM",
            icon="🦉",
            category="time",
            is_unlocked=night_owl_count >= 1,
            progress_percentage=min(100.0, night_owl_count * 100)
        ),

        # ─── Level / XP Badges ──────────────────────────────────────────────
        Badge(
            id="level_5",
            name="Rising Star",
            description="Reach Level 5",
            icon="⭐",
            category="progression",
            is_unlocked=level >= 5,
            progress_percentage=min(100.0, (level / 5) * 100)
        ),
        Badge(
            id="level_10",
            name="Forge Master",
            description="Reach Level 10",
            icon="🔨",
            category="progression",
            is_unlocked=level >= 10,
            progress_percentage=min(100.0, (level / 10) * 100)
        ),
        # ─── Rare/Limited Badges ────────────────────────────────────────────
        Badge(
            id="rare_founder",
            name="Early Adopter",
            description="Joined during the first month of StreakForge",
            icon="🚀",
            category="rare",
            is_unlocked=True, # Assuming true for all current users for demo
            progress_percentage=100.0
        ),
        Badge(
            id="rare_spin_master",
            name="Wheel of Fortune",
            description="Spun the daily wheel 10 times",
            icon="🎡",
            category="rare",
            is_unlocked=True if current_user.last_spin_date else False, # Simplified check
            progress_percentage=100.0 if current_user.last_spin_date else 0.0
        ),
        Badge(
            id="rare_mood_tracker",
            name="Mindful",
            description="Logged your mood 7 days in a row",
            icon="🧠",
            category="rare",
            is_unlocked=False,
            progress_percentage=0.0
        ),
        Badge(
            id="rare_weekend_warrior",
            name="Weekend Warrior",
            description="Completed 10 targets on weekends",
            icon="⚔️",
            category="rare",
            is_unlocked=False,
            progress_percentage=0.0
        ),
        Badge(
            id="coin_hoarder",
            name="Coin Hoarder",
            description="Accumulate 500 Forge Coins at once",
            icon="💰",
            category="progression",
            is_unlocked=coins >= 500,
            progress_percentage=min(100.0, (coins / 500) * 100)
        ),

        # ─── Comeback Badge ──────────────────────────────────────────────────
        Badge(
            id="comeback_kid",
            name="Comeback Kid",
            description="Rebuild a streak to 3+ days after losing one",
            icon="🔄",
            category="special",
            is_unlocked=current_streak >= 3 and longest_streak >= 3,
            progress_percentage=min(100.0, (current_streak / 3) * 100) if current_streak < 3 else 100.0
        ),
    ]

    return badges
