from datetime import date, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.target import Target, FrequencyEnum
from app.models.target_session import TargetSession
from app.models.history import DailyHistory
from app.models.user import User
from app.utils.date_utils import user_local_today


def get_active_targets_for_today(db: Session, user: User, today: date) -> list[Target]:
    """
    Returns targets that count toward today's completion requirement.

    Rules:
    - Daily targets: always count.
    - Weekly targets: count only on the weekday they were created on
      (simple deterministic rule so they don't force a break on 6/7 days).
    - One Time targets: count only until they've been completed once;
      after completion they stop appearing in "today" (they're done forever).
    """
    targets = (
        db.query(Target)
        .filter(Target.user_id == user.id, Target.is_active == True)  # noqa: E712
        .all()
    )

    active_today = []
    for t in targets:
        if t.frequency == FrequencyEnum.daily:
            active_today.append(t)
        elif t.frequency == FrequencyEnum.weekly:
            if t.created_at.weekday() == today.weekday():
                active_today.append(t)
        elif t.frequency == FrequencyEnum.one_time:
            ever_completed = (
                db.query(TargetSession)
                .filter(TargetSession.target_id == t.id, TargetSession.completed == True)  # noqa: E712
                .first()
            )
            if not ever_completed:
                active_today.append(t)

    return active_today


def get_seconds_spent_today(db: Session, target_id: int, today: date) -> int:
    """Sums duration across all sessions for this target on this local date."""
    total = (
        db.query(func.coalesce(func.sum(TargetSession.duration_seconds), 0))
        .filter(TargetSession.target_id == target_id, TargetSession.session_date == today)
        .scalar()
    )
    return int(total or 0)


def is_target_completed_today(db: Session, target_id: int, today: date) -> bool:
    completed = (
        db.query(TargetSession)
        .filter(
            TargetSession.target_id == target_id,
            TargetSession.session_date == today,
            TargetSession.completed == True,  # noqa: E712
        )
        .first()
    )
    return completed is not None


def evaluate_day(db: Session, user: User, target_date: date) -> bool:
    """
    Evaluates whether `target_date` was a success (all active targets for
    that day were completed). Writes/updates the DailyHistory row.
    Returns True if successful, False otherwise.
    """
    active_targets = get_active_targets_for_today(db, user, target_date)

    if not active_targets:
        # No targets were due that day; don't penalize, don't reward.
        # We still record it as a "success" so it doesn't break the streak,
        # since there was nothing to fail.
        success = True
    else:
        success = all(
            is_target_completed_today(db, t.id, target_date) for t in active_targets
        )

    existing = (
        db.query(DailyHistory)
        .filter(DailyHistory.user_id == user.id, DailyHistory.date == target_date)
        .first()
    )
    if existing:
        existing.success = success
    else:
        db.add(DailyHistory(user_id=user.id, date=target_date, success=success))

    db.flush()
    return success


def close_out_day_and_update_streak(db: Session, user: User, target_date: date) -> bool:
    """
    Call this for a date that has fully elapsed (e.g. via daily scheduler,
    or lazily when the user's local date has advanced past target_date).
    """
    success = evaluate_day(db, user, target_date)
    
    # Process breached contracts
    from app.models.contract import Contract
    active_targets = get_active_targets_for_today(db, user, target_date)
    for t in active_targets:
        if not is_target_completed_today(db, t.id, target_date):
            contracts = db.query(Contract).filter(
                Contract.target_id == t.id,
                Contract.status == "active"
            ).all()
            for contract in contracts:
                contract.status = "breached"


    # Incremental update instead of full history recalculation
    # This allows users to retain "purchased" streak freezes without them getting wiped.
    if success:
        user.current_streak += 1
        if user.current_streak > user.longest_streak:
            user.longest_streak = user.current_streak
            
        # Award a freeze for every 7 days of consecutive streak (max 3)
        if user.current_streak > 0 and user.current_streak % 7 == 0:
            user.streak_freezes = min(3, user.streak_freezes + 1)
    else:
        if user.streak_freezes > 0:
            user.streak_freezes -= 1
            # Streak is frozen, does not break, but doesn't increment
        else:
            user.current_streak = 0

    db.commit()
    return success
