from datetime import date
from typing import List

from pydantic import BaseModel

from app.schemas.target import TargetResponse


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int


class DashboardResponse(BaseModel):
    current_streak: int
    longest_streak: int
    streak_freezes: int
    completion_percentage: float
    total_today: int
    completed_today: int
    targets_today: List[TargetResponse]


class HistoryEntry(BaseModel):
    date: date
    success: bool

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    entries: List[HistoryEntry]
    total_completions: int
    total_targets: int
    completion_percentage: float
