"""
Scheduler Service — APScheduler background jobs for StreakForge.
Currently implements: hourly proactive Sentinel nudges for high-risk users.
"""
import logging
from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def _send_nudges_job():
    """
    Hourly job: find users with high streak risk and no session started today.
    Generates a personalized nudge via Gemini and saves it as a Notification.
    """
    try:
        from app.core.database import SessionLocal
        from app.models.user import User
        from app.models.target import Target
        from app.models.target_session import TargetSession
        from app.models.notification import Notification, NotificationTypeEnum
        from app.ml.predictor import predictor
        from app.services.ai_service import generate_nudge
        from app.utils.date_utils import user_local_today

        db = SessionLocal()
        try:
            today_utc = datetime.now(timezone.utc).date()

            # Get all users with at least 1 active target
            users = db.query(User).filter(User.is_demo == False).all()

            for user in users:
                try:
                    today = user_local_today(user.tz_offset_minutes)
                    targets = db.query(Target).filter(
                        Target.user_id == user.id,
                        Target.is_active == True,
                    ).all()

                    if not targets:
                        continue

                    # Skip if user already has a session today
                    session_today = db.query(TargetSession).join(Target).filter(
                        Target.user_id == user.id,
                        TargetSession.session_date == today,
                    ).first()

                    if session_today:
                        continue

                    # Skip if nudge already sent today
                    existing_nudge = db.query(Notification).filter(
                        Notification.recipient_id == user.id,
                        Notification.notification_type == NotificationTypeEnum.nudge,
                        Notification.created_at >= datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc),
                    ).first()

                    if existing_nudge:
                        continue

                    # Compute risk score
                    risk = predictor.predict_risk(user, targets)
                    if risk < 60:  # Only nudge if risk >= 60%
                        continue

                    # Generate personalized nudge message
                    pending_names = [t.title for t in targets[:3]]
                    message = await generate_nudge(
                        user_name=user.name,
                        pending_targets=pending_names,
                        streak=user.current_streak,
                        risk_score=risk / 100,
                    )

                    # Save as notification
                    notif = Notification(
                        recipient_id=user.id,
                        sender_id=None,
                        notification_type=NotificationTypeEnum.nudge,
                        title="The Sentinel is watching...",
                        message=message,
                        icon="🛡️",
                    )
                    db.add(notif)

                except Exception as e:
                    logger.warning(f"Nudge job failed for user {user.id}: {e}")

            db.commit()
            logger.info(f"Nudge job completed at {datetime.now(timezone.utc)}")

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Nudge scheduler job error: {e}")


async def _check_breached_contracts_job():
    """
    Daily job at 23:55: find all active contracts. If the associated target
    was not completed today, mark the contract as breached.
    """
    try:
        from app.core.database import SessionLocal
        from app.models.contract import Contract
        from app.models.target import Target
        
        db = SessionLocal()
        try:
            active_contracts = db.query(Contract).filter(Contract.status == "active").all()
            for contract in active_contracts:
                # Check if target is completed today
                target = db.query(Target).filter(Target.id == contract.target_id).first()
                if target and target.is_active:
                    # In a real app we'd check TargetSession for today's date in user's timezone
                    # Here we can use a simpler heuristic or just check the target's internal state
                    # But since target state (is_completed_today) is calculated dynamically in frontend,
                    # we must query sessions.
                    from app.models.target_session import TargetSession
                    from app.utils.date_utils import user_local_today
                    from app.models.user import User
                    
                    user = db.query(User).filter(User.id == contract.user_id).first()
                    if not user:
                        continue
                        
                    today = user_local_today(user.tz_offset_minutes)
                    session_today = db.query(TargetSession).filter(
                        TargetSession.target_id == target.id,
                        TargetSession.session_date == today,
                        TargetSession.completed == True
                    ).first()
                    
                    if not session_today:
                        contract.status = "breached"
                        logger.info(f"Contract {contract.id} breached for target {target.id}")
            
            db.commit()
            logger.info(f"Breached contracts job completed at {datetime.now(timezone.utc)}")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Breach check scheduler job error: {e}")


def start_scheduler():
    """Start the APScheduler with all background jobs."""
    if not scheduler.running:
        scheduler.add_job(
            _send_nudges_job,
            trigger=IntervalTrigger(hours=1),
            id="proactive_nudges",
            replace_existing=True,
            misfire_grace_time=300,
        )
        scheduler.add_job(
            _check_breached_contracts_job,
            trigger=CronTrigger(hour=23, minute=55),
            id="breached_contracts",
            replace_existing=True,
            misfire_grace_time=300,
        )
        scheduler.start()
        logger.info("APScheduler started — registered jobs: proactive_nudges, breached_contracts")


def stop_scheduler():
    """Gracefully stop the scheduler on app shutdown."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler stopped")
