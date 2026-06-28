from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ContractCreate(BaseModel):
    target_id: int
    pledge_amount: int

class ContractResponse(BaseModel):
    id: int
    target_id: int
    target_title: str
    pledge_amount: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class CourtPlea(BaseModel):
    contract_id: int
    plea_message: str

class CourtVerdict(BaseModel):
    verdict: str # "forgiven", "partial_deduction", "full_penalty"
    coins_deducted: int
    message: str
