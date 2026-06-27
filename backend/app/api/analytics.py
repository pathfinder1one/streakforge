from datetime import timedelta, datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.target import Target
from app.models.target_session import TargetSession
from app.models.history import DailyHistory
from app.schemas.analytics import AnalyticsResponse, HeatmapData, CategoryStat, PriorityStat
from app.utils.date_utils import user_local_today

router = APIRouter(tags=["analytics"])


@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = user_local_today(current_user.tz_offset_minutes)
    one_year_ago = today - timedelta(days=365)

    # Heatmap data: Group by session_date, count completed sessions
    heatmap_query = (
        db.query(TargetSession.session_date, func.count(TargetSession.id))
        .join(Target)
        .filter(
            Target.user_id == current_user.id,
            TargetSession.completed == True,
            TargetSession.session_date >= one_year_ago
        )
        .group_by(TargetSession.session_date)
        .all()
    )
    heatmap_data = [HeatmapData(date=row[0], count=row[1]) for row in heatmap_query]

    # Stats by Category
    category_query = (
        db.query(Target.category, func.count(TargetSession.id))
        .join(TargetSession)
        .filter(
            Target.user_id == current_user.id,
            TargetSession.completed == True
        )
        .group_by(Target.category)
        .all()
    )
    by_category = [CategoryStat(category=row[0].value if hasattr(row[0], 'value') else row[0], count=row[1]) for row in category_query]

    # Stats by Priority
    priority_query = (
        db.query(Target.priority, func.count(TargetSession.id))
        .join(TargetSession)
        .filter(
            Target.user_id == current_user.id,
            TargetSession.completed == True
        )
        .group_by(Target.priority)
        .all()
    )
    by_priority = [PriorityStat(priority=row[0].value if hasattr(row[0], 'value') else row[0], count=row[1]) for row in priority_query]
    # Best Time of Day
    best_time_query = (
        db.query(
            func.strftime('%H', TargetSession.started_at).label("hour"),
            func.count(TargetSession.id).label("count")
        )
        .join(Target)
        .filter(
            Target.user_id == current_user.id,
            TargetSession.completed == True
        )
        .group_by("hour")
        .order_by(func.count(TargetSession.id).desc())
        .first()
    )
    
    best_time = None
    if best_time_query and best_time_query[0]:
        hour = int(best_time_query[0])
        if hour < 12:
            best_time = "Morning"
        elif hour < 17:
            best_time = "Afternoon"
        elif hour < 21:
            best_time = "Evening"
        else:
            best_time = "Late Night"

    # Mood Insights
    from app.models.user import MoodLog
    mood_query = (
        db.query(
            MoodLog.mood,
            func.count(MoodLog.id).label("count")
        )
        .filter(MoodLog.user_id == current_user.id)
        .group_by(MoodLog.mood)
        .order_by(func.count(MoodLog.id).desc())
        .first()
    )
    most_frequent_mood = mood_query[0] if mood_query else None

    return AnalyticsResponse(
        heatmap=heatmap_data,
        by_category=by_category,
        by_priority=by_priority,
        best_time_of_day=best_time,
        most_frequent_mood=most_frequent_mood
    )


@router.get("/analytics/weekly")
def get_weekly_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """7-day detailed analytics: completion rate per day, time spent, best category."""
    today = user_local_today(current_user.tz_offset_minutes)

    days = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)

        # Completed sessions for that day
        completed = (
            db.query(func.count(TargetSession.id))
            .join(Target)
            .filter(
                Target.user_id == current_user.id,
                TargetSession.session_date == day,
                TargetSession.completed == True,
            )
            .scalar()
        ) or 0

        # Total sessions attempted
        total = (
            db.query(func.count(TargetSession.id))
            .join(Target)
            .filter(
                Target.user_id == current_user.id,
                TargetSession.session_date == day,
            )
            .scalar()
        ) or 0

        # Time spent in seconds
        time_spent = (
            db.query(func.coalesce(func.sum(TargetSession.duration_seconds), 0))
            .join(Target)
            .filter(
                Target.user_id == current_user.id,
                TargetSession.session_date == day,
                TargetSession.duration_seconds > 0,
            )
            .scalar()
        ) or 0

        # History success
        hist = db.query(DailyHistory).filter(
            DailyHistory.user_id == current_user.id,
            DailyHistory.date == day,
        ).first()

        days.append({
            "date": day.isoformat(),
            "day_name": day.strftime("%a"),
            "completed_sessions": completed,
            "total_sessions": total,
            "completion_rate": round((completed / total * 100) if total > 0 else 0, 1),
            "time_spent_minutes": round(time_spent / 60, 1),
            "success": hist.success if hist else (day >= today),
        })

    # Weekly totals
    total_sessions = sum(d["total_sessions"] for d in days)
    total_completed = sum(d["completed_sessions"] for d in days)
    total_time = sum(d["time_spent_minutes"] for d in days)
    avg_completion = round((total_completed / total_sessions * 100) if total_sessions > 0 else 0, 1)

    # Best category this week
    best_cat_query = (
        db.query(Target.category, func.count(TargetSession.id).label("cnt"))
        .join(TargetSession)
        .filter(
            Target.user_id == current_user.id,
            TargetSession.completed == True,
            TargetSession.session_date >= today - timedelta(days=7),
        )
        .group_by(Target.category)
        .order_by(func.count(TargetSession.id).desc())
        .first()
    )
    
    best_category = None
    if best_cat_query and best_cat_query[0]:
        best_category = best_cat_query[0].value if hasattr(best_cat_query[0], 'value') else best_cat_query[0]

    return {
        "period": "weekly",
        "days": days,
        "summary": {
            "total_completed": total_completed,
            "total_sessions": total_sessions,
            "avg_completion_rate": avg_completion,
            "total_time_minutes": round(total_time, 1),
            "best_category": best_category,
            "days_successful": sum(1 for d in days if d["success"] and d["date"] < today.isoformat()),
        },
    }


@router.get("/analytics/monthly")
def get_monthly_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """30-day summary: completion %, streak progress, most productive day of week."""
    today = user_local_today(current_user.tz_offset_minutes)
    thirty_days_ago = today - timedelta(days=30)

    # Per-day completion for the last 30 days
    history_rows = (
        db.query(DailyHistory)
        .filter(
            DailyHistory.user_id == current_user.id,
            DailyHistory.date >= thirty_days_ago,
        )
        .all()
    )

    days_tracked = len(history_rows)
    days_successful = sum(1 for h in history_rows if h.success)
    monthly_completion_rate = round((days_successful / days_tracked * 100) if days_tracked > 0 else 0, 1)

    # Time spent this month
    total_time_seconds = (
        db.query(func.coalesce(func.sum(TargetSession.duration_seconds), 0))
        .join(Target)
        .filter(
            Target.user_id == current_user.id,
            TargetSession.session_date >= thirty_days_ago,
            TargetSession.duration_seconds > 0,
        )
        .scalar()
    ) or 0

    # Most productive day of week (0=Mon, 6=Sun)
    weekday_counts = [0] * 7
    for h in history_rows:
        if h.success:
            weekday_counts[h.date.weekday()] += 1

    WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    best_weekday_idx = weekday_counts.index(max(weekday_counts)) if any(weekday_counts) else 0
    worst_weekday_idx = weekday_counts.index(min(weekday_counts)) if any(weekday_counts) else 0

    # Per-week completion rates for trend chart
    weeks = []
    for week_num in range(4, -1, -1):
        week_start = today - timedelta(days=(week_num + 1) * 7)
        week_end = today - timedelta(days=week_num * 7)
        week_hist = [h for h in history_rows if week_start <= h.date < week_end]
        weeks.append({
            "week": f"Week {5 - week_num}",
            "start": week_start.isoformat(),
            "success_days": sum(1 for h in week_hist if h.success),
            "total_days": len(week_hist),
            "completion_rate": round((sum(1 for h in week_hist if h.success) / len(week_hist) * 100) if week_hist else 0, 1),
        })

    return {
        "period": "monthly",
        "summary": {
            "days_tracked": days_tracked,
            "days_successful": days_successful,
            "completion_rate": monthly_completion_rate,
            "total_time_hours": round(total_time_seconds / 3600, 1),
            "current_streak": current_user.current_streak,
            "longest_streak": current_user.longest_streak,
            "best_day_of_week": WEEKDAY_NAMES[best_weekday_idx],
            "worst_day_of_week": WEEKDAY_NAMES[worst_weekday_idx],
        },
        "weekday_breakdown": [
            {"day": WEEKDAY_NAMES[i], "success_days": weekday_counts[i]}
            for i in range(7)
        ],
        "weekly_trend": weeks,
    }


@router.get("/ai/insights")
async def ai_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Data-driven AI insights about the user's patterns."""
    from app.services import ai_service

    today = user_local_today(current_user.tz_offset_minutes)
    thirty_days_ago = today - timedelta(days=30)

    # Build pattern data
    sessions = (
        db.query(TargetSession, Target)
        .join(Target)
        .filter(
            Target.user_id == current_user.id,
            TargetSession.session_date >= thirty_days_ago,
        )
        .all()
    )

    # Category x day-of-week completion matrix
    category_weekday = {}
    for session, target in sessions:
        if session.completed:
            cat = target.category.value
            dow = session.session_date.weekday()
            key = f"{cat}_dow_{dow}"
            category_weekday[key] = category_weekday.get(key, 0) + 1

    user_context = {
        "current_streak": current_user.current_streak,
        "longest_streak": current_user.longest_streak,
        "level": current_user.level,
        "xp": current_user.xp,
        "coins": current_user.coins,
        "category_weekday_patterns": category_weekday,
    }

    recs = await ai_service.get_recommendations(user_context)
    return {"insights": recs, "generated_at": datetime.now(timezone.utc).isoformat()}
