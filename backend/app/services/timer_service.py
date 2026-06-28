from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.target import Target
from app.models.target_session import TargetSession
from app.models.user import User
from app.services.streak_service import get_seconds_spent_today, is_target_completed_today
from app.utils.date_utils import user_local_today


def start_session(db: Session, user: User, target_id: int) -> TargetSession:
    target = (
        db.query(Target)
        .filter(Target.id == target_id, Target.user_id == user.id)
        .first()
    )
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target not found")

    today = user_local_today(user.tz_offset_minutes)

    session = TargetSession(
        target_id=target.id,
        started_at=datetime.now(timezone.utc),
        session_date=today,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def end_session(db: Session, user: User, session_id: int, mark_complete: bool, force_complete: bool = False) -> TargetSession:
    session = (
        db.query(TargetSession)
        .join(Target, Target.id == TargetSession.target_id)
        .filter(TargetSession.id == session_id, Target.user_id == user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if session.ended_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Session already ended")

    now = datetime.now(timezone.utc)
    started_at = session.started_at
    if started_at.tzinfo is None:
        started_at = started_at.replace(tzinfo=timezone.utc)

    elapsed = int((now - started_at).total_seconds())
    session.ended_at = now
    session.duration_seconds = max(elapsed, 0)

    target = db.query(Target).filter(Target.id == session.target_id).first()

    if mark_complete:
        today = user_local_today(user.tz_offset_minutes)
        total_seconds_today = get_seconds_spent_today(db, target.id, today) + session.duration_seconds
        required_seconds = target.minimum_time * 60

        if total_seconds_today < required_seconds and not force_complete:
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Minimum time not yet reached. "
                    f"{total_seconds_today}s of {required_seconds}s completed."
                ),
            )
            
        was_already_completed = is_target_completed_today(db, target.id, today)
        session.completed = True
        
        if not was_already_completed:
            # Award XP and Coins based on priority
            priority_xp = {"High": 50, "Medium": 25, "Low": 15}
            priority_coins = {"High": 20, "Medium": 10, "Low": 5}
            xp_reward = priority_xp.get(target.priority.value, 25)
            coin_reward = priority_coins.get(target.priority.value, 10)
            
            user.xp += xp_reward
            user.coins += coin_reward
            
            # Level up logic
            # XP required for next level = current_level * 100
            while user.xp >= user.level * 100:
                user.xp -= user.level * 100
                user.level += 1
                user.coins += 50  # Level up bonus

    db.commit()
    db.refresh(session)
    return session
