from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.target_session import TargetSession
from app.models.target import Target

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


def _get_leaderboard_entries(db: Session, current_user_id: int, sort_by: str = "current_streak", limit: int = 50):
    """
    Builds leaderboard from all users. 
    sort_by: current_streak | longest_streak | total_xp | level
    """
    users = db.query(User).all()

    if sort_by == "current_streak":
        sorted_users = sorted(users, key=lambda u: (-u.current_streak, -u.longest_streak))
    elif sort_by == "longest_streak":
        sorted_users = sorted(users, key=lambda u: (-u.longest_streak, -u.current_streak))
    elif sort_by == "level":
        sorted_users = sorted(users, key=lambda u: (-u.level, -u.xp))
    else:  # total_xp by default
        sorted_users = sorted(users, key=lambda u: (-u.level, -u.xp, -u.current_streak))

    entries = []
    for idx, user in enumerate(sorted_users[:limit]):
        entries.append({
            "rank": idx + 1,
            "user_id": user.id,
            "name": user.name,
            "current_streak": user.current_streak,
            "longest_streak": user.longest_streak,
            "level": user.level,
            "xp": user.xp,
            "coins": user.coins,
            "is_me": user.id == current_user_id,
            "avatar_url": user.avatar_url,
        })

    return entries


@router.get("/global")
def global_leaderboard(
    sort_by: str = Query("current_streak", enum=["current_streak", "longest_streak", "level", "total_xp"]),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Global leaderboard sorted by current_streak, longest_streak, level, or total XP."""
    entries = _get_leaderboard_entries(db, current_user.id, sort_by, limit)

    # Find current user's rank even if not in top N
    my_rank = next((e["rank"] for e in entries if e["is_me"]), None)
    if my_rank is None:
        all_entries = _get_leaderboard_entries(db, current_user.id, sort_by, 10000)
        my_rank = next((e["rank"] for e in all_entries if e["is_me"]), None)

    return {
        "leaderboard": entries,
        "my_rank": my_rank,
        "total_users": db.query(User).count(),
        "sort_by": sort_by,
    }


@router.get("/squad/{squad_id}")
def squad_leaderboard_global(
    squad_id: int,
    sort_by: str = Query("current_streak", enum=["current_streak", "longest_streak", "level"]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Squad-specific leaderboard (re-uses squad endpoint logic)."""
    from app.models.squad import Squad, SquadMember
    from fastapi import HTTPException, status

    is_member = db.query(SquadMember).filter(
        SquadMember.squad_id == squad_id,
        SquadMember.user_id == current_user.id,
    ).first()
    if not is_member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member")

    squad = db.query(Squad).filter(Squad.id == squad_id).first()
    if not squad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Squad not found")

    members = squad.members
    if sort_by == "current_streak":
        sorted_members = sorted(members, key=lambda m: (-m.user.current_streak,))
    elif sort_by == "longest_streak":
        sorted_members = sorted(members, key=lambda m: (-m.user.longest_streak,))
    else:
        sorted_members = sorted(members, key=lambda m: (-m.user.level, -m.user.xp))

    return {
        "squad_name": squad.name,
        "leaderboard": [
            {
                "rank": idx + 1,
                "user_id": m.user_id,
                "name": m.user.name,
                "current_streak": m.user.current_streak,
                "longest_streak": m.user.longest_streak,
                "level": m.user.level,
                "xp": m.user.xp,
                "is_me": m.user_id == current_user.id,
                "avatar_url": m.user.avatar_url,
            }
            for idx, m in enumerate(sorted_members)
        ],
    }
