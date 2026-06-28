from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.target import Target
from app.models.contract import Contract
from app.schemas.court import ContractCreate, ContractResponse, CourtPlea, CourtVerdict
import google.generativeai as genai
from app.core.config import settings

router = APIRouter(tags=["court"])

@router.post("/court/pledge", response_model=ContractResponse)
def create_pledge(
    data: ContractCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target = db.query(Target).filter(Target.id == data.target_id, Target.user_id == current_user.id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
        
    # Check if active contract already exists
    existing = db.query(Contract).filter(
        Contract.target_id == data.target_id, 
        Contract.status == "active"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Active contract already exists for this target")
        
    contract = Contract(
        user_id=current_user.id,
        target_id=data.target_id,
        pledge_amount=data.pledge_amount,
        status="active"
    )
    db.add(contract)
    db.commit()
    db.refresh(contract)
    
    return ContractResponse(
        id=contract.id,
        target_id=contract.target_id,
        target_title=target.title,
        pledge_amount=contract.pledge_amount,
        status=contract.status,
        created_at=contract.created_at
    )

@router.get("/court/breached", response_model=list[ContractResponse])
def get_breached_contracts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contracts = db.query(Contract).filter(
        Contract.user_id == current_user.id,
        Contract.status == "breached"
    ).all()
    
    res = []
    for c in contracts:
        res.append(ContractResponse(
            id=c.id,
            target_id=c.target_id,
            target_title=c.target.title,
            pledge_amount=c.pledge_amount,
            status=c.status,
            created_at=c.created_at
        ))
    return res

@router.post("/court/judge", response_model=CourtVerdict)
def court_judge(
    data: CourtPlea,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(
        Contract.id == data.contract_id,
        Contract.user_id == current_user.id,
        Contract.status == "breached"
    ).first()
    
    if not contract:
        raise HTTPException(status_code=404, detail="Breached contract not found")

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    prompt = f\"\"\"
    You are The Judge, an AI in an accountability app called StreakForge.
    The user pledged {contract.pledge_amount} coins to complete their daily target: "{contract.target.title}".
    They FAILED to complete it.
    
    They have submitted the following plea/excuse for why they failed:
    "{data.plea_message}"
    
    Evaluate their excuse. 
    If it's a genuine, unavoidable emergency (medical, extreme weather, etc), you can forgive them.
    If it's a weak excuse (lazy, forgot, tired), they must pay the full penalty.
    If it's somewhere in between, give a partial deduction.
    
    Output your decision strictly as JSON with this schema:
    {{
      "verdict": "forgiven" | "partial_deduction" | "full_penalty",
      "coins_deducted": <integer between 0 and {contract.pledge_amount}>,
      "message": "<your response as The Judge, in character. Be stern but fair. Explain your ruling.>"
    }}
    \"\"\"
    
    try:
        response = model.generate_content(prompt)
        text = response.text.replace("`json", "").replace("`", "").strip()
        result = json.loads(text)
    except Exception as e:
        # Fallback if AI fails
        result = {
            "verdict": "full_penalty",
            "coins_deducted": contract.pledge_amount,
            "message": "The AI Judge is unavailable. The law is absolute. Full penalty applied."
        }
        
    deduction = int(result.get("coins_deducted", contract.pledge_amount))
    if deduction > current_user.coins:
        deduction = current_user.coins
        
    current_user.coins = max(0, current_user.coins - deduction)
    contract.status = "resolved"
    contract.resolved_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return CourtVerdict(
        verdict=result.get("verdict", "full_penalty"),
        coins_deducted=deduction,
        message=result.get("message", "Judgment rendered.")
    )
