from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.target import Target, TargetSubtask
from app.models.user import User
from app.schemas.target import TargetCreate, TargetUpdate


def create_target(db: Session, user: User, data: TargetCreate) -> Target:
    target = Target(
        user_id=user.id,
        title=data.title,
        link=data.link,
        category=data.category,
        priority=data.priority,
        minimum_time=data.minimum_time,
        frequency=data.frequency,
        scheduled_date=data.scheduled_date,
        alert_time=data.alert_time,
        target_type=data.target_type,
        metric_unit=data.metric_unit,
        metric_goal=data.metric_goal,
    )
    db.add(target)
    
    if data.subtasks:
        for st_data in data.subtasks:
            subtask = TargetSubtask(
                title=st_data.title,
                is_completed=st_data.is_completed or False
            )
            target.subtasks.append(subtask)

    db.commit()
    db.refresh(target)
    return target


def list_targets(db: Session, user: User) -> list[Target]:
    return db.query(Target).filter(Target.user_id == user.id).order_by(Target.order.asc(), Target.created_at.desc()).all()


def reorder_targets(db: Session, user: User, target_ids: list[int]) -> list[Target]:
    # Update order for each target ID in the list according to its index
    targets = db.query(Target).filter(Target.user_id == user.id).all()
    target_map = {t.id: t for t in targets}
    
    for idx, target_id in enumerate(target_ids):
        if target_id in target_map:
            target_map[target_id].order = idx
            
    db.commit()
    return list_targets(db, user)


def get_target_or_404(db: Session, user: User, target_id: int) -> Target:
    target = db.query(Target).filter(Target.id == target_id, Target.user_id == user.id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target not found")
    return target


def update_target(db: Session, user: User, target_id: int, data: TargetUpdate) -> Target:
    target = get_target_or_404(db, user, target_id)
    update_fields = data.model_dump(exclude_unset=True, exclude={"subtasks"})
    for key, value in update_fields.items():
        setattr(target, key, value)
    
    if data.subtasks is not None:
        # Sync subtasks
        incoming_ids = {st.id for st in data.subtasks if st.id is not None}
        
        # Delete subtasks that are no longer in the payload
        for existing_st in list(target.subtasks):
            if existing_st.id not in incoming_ids:
                db.delete(existing_st)
                target.subtasks.remove(existing_st)
        
        # Update or create
        for st_data in data.subtasks:
            if st_data.id is not None:
                # Update existing
                existing_st = next((st for st in target.subtasks if st.id == st_data.id), None)
                if existing_st:
                    existing_st.title = st_data.title
                    existing_st.is_completed = st_data.is_completed or False
            else:
                # Create new
                new_st = TargetSubtask(
                    title=st_data.title,
                    is_completed=st_data.is_completed or False
                )
                target.subtasks.append(new_st)

    db.commit()
    db.refresh(target)
    return target


def delete_target(db: Session, user: User, target_id: int) -> None:
    target = get_target_or_404(db, user, target_id)
    db.delete(target)
    db.commit()


def toggle_subtask(db: Session, user: User, target_id: int, subtask_id: int) -> Target:
    target = get_target_or_404(db, user, target_id)
    subtask = next((st for st in target.subtasks if st.id == subtask_id), None)
    if not subtask:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtask not found")
    
    subtask.is_completed = not subtask.is_completed
    db.commit()
    db.refresh(target)
    return target
