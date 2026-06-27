from datetime import date, timedelta, datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.target import Target, FrequencyEnum
from app.models.target_session import TargetSession
from app.models.history import DailyHistory
from app.utils.date_utils import user_local_today

router = APIRouter(prefix="/calendar", tags=["calendar"])


class CalendarDay(BaseModel):
    date: str  # ISO date string YYYY-MM-DD
    total_targets: int
    completed_targets: int
    success: bool
    has_history: bool


class CalendarTargetItem(BaseModel):
    id: int
    title: str
    category: str
    priority: str
    completed: bool


class CalendarDayDetail(BaseModel):
    date: str
    targets: List[CalendarTargetItem]


@router.get("/month")
def get_calendar_month(
    year: int = Query(...),
    month: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return completion data for every day in the given month."""
    # Build date range for the month
    first_day = date(year, month, 1)
    if month == 12:
        last_day = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = date(year, month + 1, 1) - timedelta(days=1)

    today = user_local_today(current_user.tz_offset_minutes)

    # Fetch all daily history for this month
    history_rows = (
        db.query(DailyHistory)
        .filter(
            DailyHistory.user_id == current_user.id,
            DailyHistory.date >= first_day,
            DailyHistory.date <= last_day,
        )
        .all()
    )
    history_map = {row.date: row for row in history_rows}

    # Fetch all user targets
    all_targets = (
        db.query(Target)
        .filter(Target.user_id == current_user.id)
        .all()
    )

    days = []
    current = first_day
    while current <= last_day:
        hist = history_map.get(current)

        # Count sessions for this day
        sessions_today = (
            db.query(TargetSession)
            .filter(
                TargetSession.target_id.in_([t.id for t in all_targets]),
                TargetSession.session_date == current,
            )
            .all()
        )
        completed_target_ids = {s.target_id for s in sessions_today if s.completed}

        # Only count targets that were active on that day
        active_targets = []
        for t in all_targets:
            if t.frequency == FrequencyEnum.daily:
                if t.created_at.date() <= current:
                    active_targets.append(t)
            elif t.frequency == FrequencyEnum.weekly:
                if t.created_at.date() <= current and t.created_at.weekday() == current.weekday():
                    active_targets.append(t)
            elif t.frequency == FrequencyEnum.one_time:
                if t.created_at.date() <= current:
                    active_targets.append(t)

        total = len(active_targets)
        completed = len([t for t in active_targets if t.id in completed_target_ids])

        days.append({
            "date": current.isoformat(),
            "total_targets": total,
            "completed_targets": completed,
            "success": hist.success if hist else (completed == total and total > 0 and current < today),
            "has_history": hist is not None,
        })
        current += timedelta(days=1)

    return {"year": year, "month": month, "days": days}


@router.get("/day/{date_str}")
def get_calendar_day(
    date_str: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return target details for a specific day."""
    try:
        target_date = date.fromisoformat(date_str)
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD"}

    all_targets = (
        db.query(Target)
        .filter(Target.user_id == current_user.id)
        .all()
    )

    sessions = (
        db.query(TargetSession)
        .filter(
            TargetSession.target_id.in_([t.id for t in all_targets]),
            TargetSession.session_date == target_date,
        )
        .all()
    )
    completed_ids = {s.target_id for s in sessions if s.completed}

    targets_on_day = []
    for t in all_targets:
        relevant = False
        if t.frequency == FrequencyEnum.daily and t.created_at.date() <= target_date:
            relevant = True
        elif t.frequency == FrequencyEnum.weekly and t.created_at.date() <= target_date and t.created_at.weekday() == target_date.weekday():
            relevant = True
        elif t.frequency == FrequencyEnum.one_time and t.created_at.date() <= target_date:
            relevant = True

        if relevant:
            targets_on_day.append({
                "id": t.id,
                "title": t.title,
                "category": t.category.value,
                "priority": t.priority.value,
                "completed": t.id in completed_ids,
            })

    return {"date": date_str, "targets": targets_on_day}


@router.get("/export.ics")
def export_ics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate an ICS file for all active targets, importable into Google/Apple/Outlook Calendar."""
    targets = (
        db.query(Target)
        .filter(Target.user_id == current_user.id, Target.is_active == True)  # noqa: E712
        .all()
    )

    today = user_local_today(current_user.tz_offset_minutes)
    now_utc = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//StreakForge//StreakForge Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:StreakForge — {current_user.name}'s Targets",
        "X-WR-TIMEZONE:UTC",
    ]

    for t in targets:
        uid = f"target-{t.id}@streakforge"
        summary = t.title
        description = f"Category: {t.category.value} | Priority: {t.priority.value}"
        if t.minimum_time:
            description += f" | Min Time: {t.minimum_time} min"
        if t.link:
            description += f" | Link: {t.link}"

        # Build DTSTART based on frequency
        dtstart = today.strftime("%Y%m%d")

        lines += [
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{now_utc}",
            f"DTSTART;VALUE=DATE:{dtstart}",
            f"SUMMARY:{summary}",
            f"DESCRIPTION:{description}",
            "CATEGORIES:StreakForge",
        ]

        # Set recurrence rule based on frequency
        if t.frequency == FrequencyEnum.daily:
            lines.append("RRULE:FREQ=DAILY")
        elif t.frequency == FrequencyEnum.weekly:
            weekday = t.created_at.strftime("%A")[:2].upper()
            lines.append(f"RRULE:FREQ=WEEKLY;BYDAY={weekday}")
        # One-time: no recurrence

        if t.alert_time:
            try:
                h, m = map(int, t.alert_time.split(":"))
                alarm_lines = [
                    "BEGIN:VALARM",
                    "TRIGGER:-PT0M",
                    "ACTION:DISPLAY",
                    f"DESCRIPTION:Time to work on: {t.title}",
                    "END:VALARM",
                ]
                lines += alarm_lines
            except Exception:
                pass

        lines.append("END:VEVENT")

    lines.append("END:VCALENDAR")
    ics_content = "\r\n".join(lines) + "\r\n"

    return Response(
        content=ics_content,
        media_type="text/calendar; charset=utf-8",
        headers={
            "Content-Disposition": 'attachment; filename="streakforge-targets.ics"',
        },
    )
