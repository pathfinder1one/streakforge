import math
import random
from datetime import datetime, timedelta

from app.models.user import User
from app.models.target import Target

class StreakPredictor:
    def predict_risk(self, user: User, targets: list[Target]) -> float:
        """
        Pure Python predictive model (Logistic Function)
        Predicts the chance (%) of breaking the streak tomorrow.
        """
        # Feature Extraction
        target_count = len(targets)
        streak = user.current_streak
        tomorrow_is_weekend = (datetime.now() + timedelta(days=1)).weekday() >= 5
        
        # Base risk logit (bias)
        logit = -1.0 
        
        # Weights (simulating a trained linear model)
        w_streak = -0.15      # Higher streak = lower risk
        w_targets = 0.2       # More targets = higher risk (burnout)
        w_weekend = 1.2       # Weekends = much higher risk
        
        # Calculate Logit
        logit += (streak * w_streak)
        logit += (target_count * w_targets)
        if tomorrow_is_weekend:
            logit += w_weekend
            
        # Sigmoid function to get probability between 0 and 1
        try:
            prob = 1 / (1 + math.exp(-logit))
        except OverflowError:
            prob = 0.0 if logit < 0 else 1.0
            
        risk_percentage = prob * 100.0
        
        # Add slight variance for realism in MVP
        risk_percentage += random.uniform(-2, 2)
        
        return max(0.0, min(100.0, risk_percentage))

predictor = StreakPredictor()
