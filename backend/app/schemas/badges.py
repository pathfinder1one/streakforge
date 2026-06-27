from typing import List, Optional
from pydantic import BaseModel

class Badge(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    category: str = "general"
    is_unlocked: bool
    progress_percentage: float
