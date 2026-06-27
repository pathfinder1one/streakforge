from datetime import datetime, date, timezone, timedelta


def user_local_today(tz_offset_minutes: int) -> date:
    """
    Returns 'today' in the user's local timezone, given their UTC offset in minutes.
    e.g. India (UTC+5:30) -> tz_offset_minutes = 330
    """
    now_utc = datetime.now(timezone.utc)
    local_time = now_utc + timedelta(minutes=tz_offset_minutes)
    return local_time.date()


def user_local_now(tz_offset_minutes: int) -> datetime:
    now_utc = datetime.now(timezone.utc)
    return now_utc + timedelta(minutes=tz_offset_minutes)


def days_between(d1: date, d2: date) -> int:
    return (d2 - d1).days
