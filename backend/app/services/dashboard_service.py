from datetime import date, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.history import DailyHistory
from app.schemas.target import TargetResponse
from app.schemas.dashboard import DashboardResponse
from app.services.streak_service import (
    get_active_targets_for_today,
    get_seconds_spent_today,
    is_target_completed_today,
    close_out_day_and_update_streak,
)
from app.utils.date_utils import user_local_today


def _user_local_signup_date(user: User) -> date:
    """Converts the naive-UTC created_at timestamp into the user's local date."""
    created_utc = user.created_at
    if created_utc.tzinfo is None:
        created_utc = created_utc.replace(tzinfo=timezone.utc)
    local_dt = created_utc + timedelta(minutes=user.tz_offset_minutes)
    return local_dt.date()


def catch_up_missed_days(db: Session, user: User) -> None:
    """
    Lazily evaluates any past days that haven't been closed out yet,
    walking forward from the last recorded day (or account creation,
    converted to the user's local date) up to yesterday. This stands in
    for a daily cron job: whenever the user opens the app, any day that
    has fully elapsed gets settled.
    """
    today = user_local_today(user.tz_offset_minutes)

    last_record = (
        db.query(DailyHistory)
        .filter(DailyHistory.user_id == user.id)
        .order_by(DailyHistory.date.desc())
        .first()
    )

    if last_record:
        cursor = last_record.date + timedelta(days=1)
    else:
        cursor = _user_local_signup_date(user)

    # Close out every day strictly before today that hasn't been recorded.
    while cursor < today:
        close_out_day_and_update_streak(db, user, cursor)
        cursor += timedelta(days=1)


def get_dashboard(db: Session, user: User) -> DashboardResponse:
    catch_up_missed_days(db, user)

    today = user_local_today(user.tz_offset_minutes)
    active_targets = get_active_targets_for_today(db, user, today)

    target_responses = []
    completed_count = 0

    for t in active_targets:
        seconds_spent = get_seconds_spent_today(db, t.id, today)
        completed = is_target_completed_today(db, t.id, today)
        can_complete = seconds_spent >= (t.minimum_time * 60)

        if completed:
            completed_count += 1

        target_responses.append(
            TargetResponse(
                id=t.id,
                title=t.title,
                link=t.link,
                category=t.category,
                priority=t.priority,
                minimum_time=t.minimum_time,
                frequency=t.frequency,
                scheduled_date=t.scheduled_date,
                alert_time=t.alert_time,
                is_active=t.is_active,
                created_at=t.created_at,
                seconds_spent_today=seconds_spent,
                is_completed_today=completed,
                can_complete=can_complete,
            )
        )

    total = len(active_targets)
    completion_percentage = (completed_count / total * 100) if total > 0 else 0.0

    return DashboardResponse(
        current_streak=user.current_streak,
        longest_streak=user.longest_streak,
        streak_freezes=user.streak_freezes,
        completion_percentage=round(completion_percentage, 1),
        total_today=total,
        completed_today=completed_count,
        targets_today=target_responses,
    )
