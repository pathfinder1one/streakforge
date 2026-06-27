from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.history import DailyHistory
from app.schemas.dashboard import HistoryResponse, HistoryEntry
from app.services.dashboard_service import catch_up_missed_days

router = APIRouter(tags=["history"])


@router.get("/history", response_model=HistoryResponse)
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    catch_up_missed_days(db, current_user)

    records = (
        db.query(DailyHistory)
        .filter(DailyHistory.user_id == current_user.id)
        .order_by(DailyHistory.date.desc())
        .all()
    )

    total = len(records)
    successes = sum(1 for r in records if r.success)
    percentage = (successes / total * 100) if total > 0 else 0.0

    return HistoryResponse(
        entries=[HistoryEntry(date=r.date, success=r.success) for r in records],
        total_completions=successes,
        total_targets=total,
        completion_percentage=round(percentage, 1),
    )
