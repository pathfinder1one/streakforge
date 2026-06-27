from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.dashboard import StreakResponse
from app.services.dashboard_service import catch_up_missed_days

router = APIRouter(tags=["streak"])


@router.get("/streak", response_model=StreakResponse)
def get_streak(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    catch_up_missed_days(db, current_user)
    return StreakResponse(
        current_streak=current_user.current_streak,
        longest_streak=current_user.longest_streak,
    )
