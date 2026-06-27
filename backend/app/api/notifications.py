from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification, NotificationTypeEnum
from app.models.squad import SquadMember

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NudgeRequest(BaseModel):
    recipient_id: int
    message: Optional[str] = None


class CheerRequest(BaseModel):
    recipient_id: int
    message: Optional[str] = None


@router.post("/nudge", status_code=status.HTTP_201_CREATED)
def send_nudge(
    data: NudgeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a nudge to remind a squad member to complete their target."""
    if data.recipient_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot nudge yourself")

    recipient = db.query(User).filter(User.id == data.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Verify they share a squad
    sender_squads = {m.squad_id for m in db.query(SquadMember).filter(SquadMember.user_id == current_user.id).all()}
    recipient_squads = {m.squad_id for m in db.query(SquadMember).filter(SquadMember.user_id == data.recipient_id).all()}
    if not sender_squads.intersection(recipient_squads):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only nudge squad members")

    notification = Notification(
        recipient_id=data.recipient_id,
        sender_id=current_user.id,
        notification_type=NotificationTypeEnum.nudge,
        title=f"👋 Nudge from {current_user.name}",
        message=data.message or f"{current_user.name} is reminding you to complete your targets today!",
        icon="👋",
    )
    db.add(notification)
    db.commit()
    return {"detail": "Nudge sent!"}


@router.post("/cheer", status_code=status.HTTP_201_CREATED)
def send_cheer(
    data: CheerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a cheer to celebrate a squad member's achievement."""
    if data.recipient_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot cheer yourself")

    recipient = db.query(User).filter(User.id == data.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Verify squad membership
    sender_squads = {m.squad_id for m in db.query(SquadMember).filter(SquadMember.user_id == current_user.id).all()}
    recipient_squads = {m.squad_id for m in db.query(SquadMember).filter(SquadMember.user_id == data.recipient_id).all()}
    if not sender_squads.intersection(recipient_squads):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only cheer squad members")

    notification = Notification(
        recipient_id=data.recipient_id,
        sender_id=current_user.id,
        notification_type=NotificationTypeEnum.cheer,
        title=f"🎉 Cheer from {current_user.name}",
        message=data.message or f"{current_user.name} is cheering you on! Keep it up! 🔥",
        icon="🎉",
    )
    db.add(notification)
    db.commit()
    return {"detail": "Cheer sent!"}


@router.get("")
def get_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all notifications for the current user."""
    query = db.query(Notification).filter(Notification.recipient_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.is_read == False)  # noqa: E712
    notifications = query.order_by(Notification.created_at.desc()).limit(50).all()

    return {
        "notifications": [
            {
                "id": n.id,
                "type": n.notification_type.value,
                "title": n.title,
                "message": n.message,
                "icon": n.icon,
                "sender_name": n.sender.name if n.sender else "StreakForge",
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat(),
            }
            for n in notifications
        ],
        "unread_count": db.query(Notification)
            .filter(Notification.recipient_id == current_user.id, Notification.is_read == False)  # noqa: E712
            .count(),
    }


@router.post("/{notification_id}/read")
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_id == current_user.id,
    ).first()
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    notification.is_read = True
    db.commit()
    return {"detail": "Marked as read"}


@router.post("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.is_read == False,  # noqa: E712
    ).update({"is_read": True})
    db.commit()
    return {"detail": "All notifications marked as read"}


@router.get("/pending-reminders")
def pending_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return targets whose alert_time is within the next 5 minutes (for browser push)."""
    from datetime import datetime, timezone, timedelta
    from app.models.target import Target
    from app.utils.date_utils import user_local_today

    now_utc = datetime.now(timezone.utc)
    # Convert to user local time
    user_offset = timedelta(minutes=current_user.tz_offset_minutes)
    now_local = now_utc + user_offset
    now_time_str = now_local.strftime("%H:%M")

    # Get targets with alert_time set
    targets = db.query(Target).filter(
        Target.user_id == current_user.id,
        Target.is_active == True,  # noqa: E712
        Target.alert_time.isnot(None),
    ).all()

    # Check which ones are due in the next 5 minutes
    def time_diff_minutes(t1: str, t2: str) -> int:
        h1, m1 = map(int, t1.split(":"))
        h2, m2 = map(int, t2.split(":"))
        return (h1 * 60 + m1) - (h2 * 60 + m2)

    due_reminders = []
    for t in targets:
        if t.alert_time:
            diff = time_diff_minutes(t.alert_time, now_time_str)
            if 0 <= diff <= 5:
                due_reminders.append({
                    "target_id": t.id,
                    "title": t.title,
                    "alert_time": t.alert_time,
                    "category": t.category.value,
                })

    return {"reminders": due_reminders}
