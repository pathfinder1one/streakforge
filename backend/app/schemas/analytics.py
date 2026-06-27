from datetime import date
from typing import List, Dict

from pydantic import BaseModel

class HeatmapData(BaseModel):
    date: date
    count: int

class CategoryStat(BaseModel):
    category: str
    count: int

class PriorityStat(BaseModel):
    priority: str
    count: int

class AnalyticsResponse(BaseModel):
    heatmap: List[HeatmapData]
    by_category: List[CategoryStat]
    by_priority: List[PriorityStat]
    best_time_of_day: str | None = None
    most_frequent_mood: str | None = None
