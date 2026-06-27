from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.squad import Squad, SquadMember, SquadRoleEnum

router = APIRouter(prefix="/squads", tags=["squads"])


class SquadCreate(BaseModel):
    name: str
    description: Optional[str] = None


class SquadJoin(BaseModel):
    invite_code: str


class SquadMemberOut(BaseModel):
    user_id: int
    name: str
    role: str
    current_streak: int
    longest_streak: int
    level: int
    xp: int
    joined_at: str

    class Config:
        from_attributes = True


class SquadOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    invite_code: str
    created_by: int
    member_count: int
    members: List[SquadMemberOut] = []

    class Config:
        from_attributes = True


def _squad_to_out(squad: Squad) -> dict:
    members_out = []
    for m in squad.members:
        members_out.append({
            "user_id": m.user_id,
            "name": m.user.name,
            "role": m.role.value,
            "current_streak": m.user.current_streak,
            "longest_streak": m.user.longest_streak,
            "level": m.user.level,
            "xp": m.user.xp,
            "joined_at": m.joined_at.isoformat(),
        })
    return {
        "id": squad.id,
        "name": squad.name,
        "description": squad.description,
        "invite_code": squad.invite_code,
        "created_by": squad.created_by,
        "member_count": len(squad.members),
        "members": members_out,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_squad(
    data: SquadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    squad = Squad(
        name=data.name,
        description=data.description,
        created_by=current_user.id,
    )
    db.add(squad)
    db.flush()

    # Creator is auto-joined as owner
    member = SquadMember(
        squad_id=squad.id,
        user_id=current_user.id,
        role=SquadRoleEnum.owner,
    )
    db.add(member)
    db.commit()
    db.refresh(squad)
    return _squad_to_out(squad)


@router.post("/join")
def join_squad(
    data: SquadJoin,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    squad = db.query(Squad).filter(Squad.invite_code == data.invite_code.upper()).first()
    if not squad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid invite code")

    already_member = db.query(SquadMember).filter(
        SquadMember.squad_id == squad.id,
        SquadMember.user_id == current_user.id,
    ).first()
    if already_member:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already a member of this squad")

    member = SquadMember(
        squad_id=squad.id,
        user_id=current_user.id,
        role=SquadRoleEnum.member,
    )
    db.add(member)
    db.commit()
    db.refresh(squad)
    return _squad_to_out(squad)


@router.get("/my")
def get_my_squads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    memberships = db.query(SquadMember).filter(SquadMember.user_id == current_user.id).all()
    squad_ids = [m.squad_id for m in memberships]
    squads = db.query(Squad).filter(Squad.id.in_(squad_ids)).all()
    return [_squad_to_out(s) for s in squads]


@router.get("/{squad_id}")
def get_squad(
    squad_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    squad = db.query(Squad).filter(Squad.id == squad_id).first()
    if not squad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Squad not found")

    # Only members can view
    is_member = db.query(SquadMember).filter(
        SquadMember.squad_id == squad_id,
        SquadMember.user_id == current_user.id,
    ).first()
    if not is_member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this squad")

    return _squad_to_out(squad)


@router.delete("/{squad_id}/leave")
def leave_squad(
    squad_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    membership = db.query(SquadMember).filter(
        SquadMember.squad_id == squad_id,
        SquadMember.user_id == current_user.id,
    ).first()
    if not membership:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not a member of this squad")

    db.delete(membership)
    db.commit()
    return {"detail": "Left squad successfully"}


@router.get("/{squad_id}/leaderboard")
def squad_leaderboard(
    squad_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_member = db.query(SquadMember).filter(
        SquadMember.squad_id == squad_id,
        SquadMember.user_id == current_user.id,
    ).first()
    if not is_member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this squad")

    squad = db.query(Squad).filter(Squad.id == squad_id).first()
    members = sorted(squad.members, key=lambda m: (-m.user.current_streak, -m.user.xp))
    return {
        "squad_id": squad_id,
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
                "coins": m.user.coins,
                "is_me": m.user_id == current_user.id,
            }
            for idx, m in enumerate(members)
        ],
    }
