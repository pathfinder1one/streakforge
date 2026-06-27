from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.target import Target, TargetMetricLog, TargetTypeEnum
from app.schemas.target import (
    TargetCreate,
    TargetUpdate,
    TargetResponse,
    SessionStartRequest,
    SessionStartResponse,
    SessionEndRequest,
    MetricLogRequest,
)
from app.services import target_service, timer_service
from app.services.streak_service import get_seconds_spent_today, is_target_completed_today
from app.utils.date_utils import user_local_today

router = APIRouter(tags=["targets"])


def _get_metric_logged_today(db: Session, target_id: int, today) -> float:
    """Sum all metric logs for today for a given target."""
    from sqlalchemy import func
    today_dt_start = datetime(today.year, today.month, today.day, tzinfo=timezone.utc)
    today_dt_end = datetime(today.year, today.month, today.day, 23, 59, 59, tzinfo=timezone.utc)
    total = (
        db.query(func.coalesce(func.sum(TargetMetricLog.value), 0))
        .filter(
            TargetMetricLog.target_id == target_id,
            TargetMetricLog.log_date >= today_dt_start,
            TargetMetricLog.log_date <= today_dt_end,
        )
        .scalar()
    )
    return float(total or 0.0)


def _is_failed_today(db: Session, target_id: int, today) -> bool:
    """Check if a negative target was marked as failed today."""
    today_dt_start = datetime(today.year, today.month, today.day, tzinfo=timezone.utc)
    today_dt_end = datetime(today.year, today.month, today.day, 23, 59, 59, tzinfo=timezone.utc)
    from app.models.target_session import TargetSession
    failed = (
        db.query(TargetSession)
        .filter(
            TargetSession.target_id == target_id,
            TargetSession.session_date == today,
            TargetSession.completed == False,  # noqa: E712
        )
        .first()
    )
    # For negative targets, a session with completed=False and a special marker is used
    # We use a simpler approach: check if there's a "failure" session
    # Actually, let's store failure as a session with duration_seconds = -1
    from app.models.target_session import TargetSession
    fail_session = (
        db.query(TargetSession)
        .filter(
            TargetSession.target_id == target_id,
            TargetSession.session_date == today,
            TargetSession.duration_seconds == -1,  # sentinel for "failed today"
        )
        .first()
    )
    return fail_session is not None


def _to_response(db: Session, user: User, target) -> TargetResponse:
    today = user_local_today(user.tz_offset_minutes)
    seconds_spent = get_seconds_spent_today(db, target.id, today)
    completed = is_target_completed_today(db, target.id, today)
    metric_logged = _get_metric_logged_today(db, target.id, today)
    failed_today = _is_failed_today(db, target.id, today)

    # For metric targets: can_complete when metric_logged >= metric_goal
    if target.metric_goal and target.metric_unit:
        can_complete = metric_logged >= target.metric_goal
    else:
        can_complete = seconds_spent >= (target.minimum_time * 60)

    return TargetResponse(
        id=target.id,
        title=target.title,
        link=target.link,
        category=target.category,
        priority=target.priority,
        minimum_time=target.minimum_time,
        frequency=target.frequency,
        scheduled_date=target.scheduled_date,
        alert_time=target.alert_time,
        is_active=target.is_active,
        created_at=target.created_at,
        subtasks=target.subtasks,
        target_type=target.target_type,
        metric_unit=target.metric_unit,
        metric_goal=target.metric_goal,
        seconds_spent_today=seconds_spent,
        is_completed_today=completed,
        can_complete=can_complete,
        metric_logged_today=metric_logged,
        is_failed_today=failed_today,
    )


@router.get("/targets", response_model=List[TargetResponse])
def get_targets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    targets = target_service.list_targets(db, current_user)
    return [_to_response(db, current_user, t) for t in targets]


@router.put("/targets/reorder", response_model=List[TargetResponse])
def reorder_targets(
    target_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    targets = target_service.reorder_targets(db, current_user, target_ids)
    return [_to_response(db, current_user, t) for t in targets]


@router.post("/targets", response_model=TargetResponse)
def create_target(
    data: TargetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target = target_service.create_target(db, current_user, data)
    return _to_response(db, current_user, target)


@router.put("/targets/{target_id}", response_model=TargetResponse)
def update_target(
    target_id: int,
    data: TargetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target = target_service.update_target(db, current_user, target_id, data)
    return _to_response(db, current_user, target)


@router.delete("/targets/{target_id}")
def delete_target(
    target_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_service.delete_target(db, current_user, target_id)
    return {"detail": "Target deleted"}


@router.put("/targets/{target_id}/subtasks/{subtask_id}/toggle", response_model=TargetResponse)
def toggle_subtask(
    target_id: int,
    subtask_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target = target_service.toggle_subtask(db, current_user, target_id, subtask_id)
    return _to_response(db, current_user, target)


@router.post("/targets/{target_id}/fail-today")
def fail_negative_target(
    target_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a negative (habit-breaking) target as failed for today."""
    from fastapi import HTTPException, status
    from app.models.target_session import TargetSession

    target = db.query(Target).filter(
        Target.id == target_id, Target.user_id == current_user.id
    ).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target not found")
    if target.target_type != TargetTypeEnum.negative:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only negative targets can be marked as failed")

    today = user_local_today(current_user.tz_offset_minutes)

    # Check if already failed
    already_failed = (
        db.query(TargetSession)
        .filter(
            TargetSession.target_id == target_id,
            TargetSession.session_date == today,
            TargetSession.duration_seconds == -1,
        )
        .first()
    )
    if already_failed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already marked as failed today")

    # Create a sentinel session with duration_seconds=-1 to mark failure
    fail_session = TargetSession(
        target_id=target_id,
        started_at=datetime.now(timezone.utc),
        ended_at=datetime.now(timezone.utc),
        duration_seconds=-1,  # sentinel for "failed today"
        session_date=today,
        completed=False,
    )
    db.add(fail_session)
    db.commit()
    return {"detail": "Marked as failed today", "target_id": target_id}


@router.post("/targets/{target_id}/log-metric")
def log_metric(
    target_id: int,
    data: MetricLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log a metric value (e.g. liters of water, pages read) for today."""
    from fastapi import HTTPException, status

    target = db.query(Target).filter(
        Target.id == target_id, Target.user_id == current_user.id
    ).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target not found")
    if not target.metric_unit or not target.metric_goal:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This target does not have metric tracking enabled")

    now = datetime.now(timezone.utc)
    log_entry = TargetMetricLog(
        target_id=target_id,
        log_date=now,
        value=data.value,
        note=data.note,
    )
    db.add(log_entry)

    # Award XP for logging progress
    current_user.xp += 5
    current_user.coins += 2

    db.commit()
    today = user_local_today(current_user.tz_offset_minutes)
    total_logged = _get_metric_logged_today(db, target_id, today)

    return {
        "detail": "Metric logged successfully",
        "value_logged": data.value,
        "total_logged_today": total_logged,
        "goal": target.metric_goal,
        "unit": target.metric_unit,
        "goal_reached": total_logged >= target.metric_goal,
    }


@router.post("/sessions/start", response_model=SessionStartResponse)
def start_session(
    data: SessionStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = timer_service.start_session(db, current_user, data.target_id)
    return SessionStartResponse(session_id=session.id, started_at=session.started_at)


@router.post("/sessions/end")
def end_session(
    data: SessionEndRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = timer_service.end_session(db, current_user, data.session_id, data.mark_complete)
    return {
        "session_id": session.id,
        "duration_seconds": session.duration_seconds,
        "completed": session.completed,
    }


from fastapi import UploadFile, File, HTTPException, status
from app.services import ai_service

@router.post("/targets/{target_id}/verify-image")
async def verify_target_image(
    target_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Uses Gemini Multimodal Vision to verify image proof before completing."""
    target = db.query(Target).filter(Target.id == target_id, Target.user_id == current_user.id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target not found")
        
    image_bytes = await file.read()
    
    # Verify using Gemini
    result = await ai_service.verify_image(target.title, image_bytes, file.content_type)
    
    if result.get("verified"):
        # Image verified! Mark target as complete if not already
        today = user_local_today(current_user.tz_offset_minutes)
        if not is_target_completed_today(db, target_id, today):
            sess = timer_service.start_session(db, current_user, target.id)
            timer_service.end_session(db, current_user, sess.id, True)
            
    return {
        "verified": result.get("verified", False),
        "reason": result.get("reason", "Verification failed.")
    }
