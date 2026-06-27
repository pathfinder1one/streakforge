from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.target import Target
from app.ml.predictor import predictor
from app.ml.recommender import recommender

router = APIRouter(prefix="/ml", tags=["ml"])

@router.get("/risk-score")
def get_risk_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Predicts the chance (%) of breaking the streak tomorrow."""
    targets = db.query(Target).filter(Target.user_id == current_user.id).all()
    risk = predictor.predict_risk(current_user, targets)
    
    status = "Low"
    if risk > 75:
        status = "Critical"
    elif risk > 40:
        status = "Medium"
        
    return {
        "risk_score": round(risk, 1),
        "status": status,
        "message": "AI prediction based on your historical patterns."
    }

@router.get("/recommendations")
def get_ml_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Uses Collaborative Filtering (Content-based) to recommend new habits."""
    targets = db.query(Target).filter(Target.user_id == current_user.id).all()
    recs = recommender.recommend_for_user(targets)
    return {"recommendations": recs}
