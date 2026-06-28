from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.target import CategoryEnum, PriorityEnum, FrequencyEnum, TargetTypeEnum


class SubtaskCreate(BaseModel):
    id: Optional[int] = None
    title: str = Field(..., min_length=1, max_length=200)
    is_completed: Optional[bool] = False

class SubtaskUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None

class SubtaskResponse(BaseModel):
    id: int
    title: str
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TargetCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    link: Optional[str] = None
    category: CategoryEnum = CategoryEnum.personal
    priority: PriorityEnum = PriorityEnum.medium
    minimum_time: int = Field(0, ge=0, description="Minutes required before completion")
    frequency: FrequencyEnum = FrequencyEnum.daily
    scheduled_date: Optional[datetime] = None
    alert_time: Optional[str] = None
    subtasks: Optional[list[SubtaskCreate]] = None
    target_type: TargetTypeEnum = TargetTypeEnum.positive
    metric_unit: Optional[str] = None
    metric_goal: Optional[float] = None
    deadline_date: Optional[datetime] = None


class TargetUpdate(BaseModel):
    title: Optional[str] = None
    link: Optional[str] = None
    category: Optional[CategoryEnum] = None
    priority: Optional[PriorityEnum] = None
    minimum_time: Optional[int] = Field(None, ge=0)
    frequency: Optional[FrequencyEnum] = None
    scheduled_date: Optional[datetime] = None
    alert_time: Optional[str] = None
    is_active: Optional[bool] = None
    subtasks: Optional[list[SubtaskCreate]] = None
    target_type: Optional[TargetTypeEnum] = None
    metric_unit: Optional[str] = None
    metric_goal: Optional[float] = None
    deadline_date: Optional[datetime] = None


class TargetResponse(BaseModel):
    id: int
    title: str
    link: Optional[str]
    category: CategoryEnum
    priority: PriorityEnum
    minimum_time: int
    frequency: FrequencyEnum
    scheduled_date: Optional[datetime] = None
    alert_time: Optional[str] = None
    is_active: bool
    created_at: datetime
    subtasks: list[SubtaskResponse] = []
    target_type: TargetTypeEnum = TargetTypeEnum.positive
    metric_unit: Optional[str] = None
    metric_goal: Optional[float] = None
    order: int = 0
    deadline_date: Optional[datetime] = None

    # Computed, populated by the service layer for "today"
    seconds_spent_today: int = 0
    is_completed_today: bool = False
    can_complete: bool = False
    metric_logged_today: float = 0.0
    is_failed_today: bool = False

    class Config:
        from_attributes = True


class SessionStartRequest(BaseModel):
    target_id: int


class SessionStartResponse(BaseModel):
    session_id: int
    started_at: datetime


class SessionEndRequest(BaseModel):
    session_id: int
    mark_complete: bool = False


class MetricLogRequest(BaseModel):
    value: float = Field(..., gt=0)
    note: Optional[str] = None
