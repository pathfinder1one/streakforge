"""
Streak Risk Predictor — Logistic Regression using scikit-learn.
Trains on-the-fly from DailyHistory + MoodLog tables.
Falls back to a rule-based logit model when insufficient data.
"""
import math
import random
import logging
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

# Map mood labels to numeric scores
MOOD_SCORES = {"Great": 5, "Good": 4, "Okay": 3, "Bad": 2, "Awful": 1}


class StreakPredictor:
    def predict_risk(self, user, targets: list) -> float:
        """
        Predicts the % chance of breaking the streak today.
        Tries scikit-learn LogisticRegression first; falls back to rule-based.
        """
        try:
            return self._ml_predict(user, targets)
        except Exception as e:
            logger.debug(f"ML predict failed ({e}), using rule-based fallback")
            return self._rule_based_predict(user, targets)

    def _extract_features(self, user, targets: list) -> dict:
        """Extract feature vector for the model."""
        now = datetime.now(timezone.utc)
        return {
            "day_of_week": now.weekday(),            # 0=Mon … 6=Sun
            "hour_of_day": now.hour,                 # 0-23
            "streak_length": min(user.current_streak, 100),
            "num_targets": len(targets),
            "is_weekend": int(now.weekday() >= 5),
            "streak_freezes": min(user.streak_freezes, 10),
            "level": min(user.level, 50),
        }

    def _ml_predict(self, user, targets: list) -> float:
        """
        Train a LogisticRegression on DailyHistory data and predict risk.
        Only runs when sklearn is available and enough history exists.
        """
        from sklearn.linear_model import LogisticRegression
        from sklearn.preprocessing import StandardScaler
        import numpy as np
        from app.core.database import SessionLocal
        from app.models.history import DailyHistory
        from app.models.user import MoodLog

        db = SessionLocal()
        try:
            history = (
                db.query(DailyHistory)
                .filter(DailyHistory.user_id == user.id)
                .order_by(DailyHistory.date.desc())
                .limit(180)
                .all()
            )

            if len(history) < 10:
                raise ValueError("Not enough history for ML model")

            mood_logs = db.query(MoodLog).filter(MoodLog.user_id == user.id).all()
            mood_by_date = {}
            for m in mood_logs:
                d = m.date.date() if hasattr(m.date, "date") else m.date
                mood_by_date[d] = MOOD_SCORES.get(m.mood, 3)

            X, y = [], []
            for i, h in enumerate(history[1:], 1):
                prev = history[i - 1] if i - 1 < len(history) else None
                d = h.date
                mood = mood_by_date.get(d, 3)
                completed_prev = int(prev.success) if prev else 0

                X.append([
                    d.weekday(),
                    mood,
                    completed_prev,
                    min(i, 100),   # approximated streak at that day
                    int(d.weekday() >= 5),
                ])
                y.append(int(not h.success))

            X_arr = np.array(X, dtype=float)
            y_arr = np.array(y)

            # Need both classes for LR
            if len(set(y_arr)) < 2:
                raise ValueError("Only one class in training data")

            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X_arr)
            model = LogisticRegression(max_iter=200, C=1.0, solver="lbfgs")
            model.fit(X_scaled, y_arr)

            feats = self._extract_features(user, targets)
            today_mood = mood_by_date.get(datetime.now(timezone.utc).date(), 3)
            X_today = np.array([[
                feats["day_of_week"],
                today_mood,
                1 if user.current_streak > 0 else 0,
                feats["streak_length"],
                feats["is_weekend"],
            ]], dtype=float)

            X_today_scaled = scaler.transform(X_today)
            prob = model.predict_proba(X_today_scaled)[0][1]

            # Build human-readable reason
            reason = self._build_reason(feats, today_mood, prob)
            self._last_reason = reason
            return round(prob * 100, 1)

        finally:
            db.close()

    def _rule_based_predict(self, user, targets: list) -> float:
        """Simple logit rule-based fallback."""
        feats = self._extract_features(user, targets)
        logit = -1.0
        logit += feats["streak_length"] * -0.15
        logit += feats["num_targets"] * 0.2
        logit += feats["is_weekend"] * 1.2
        logit += (feats["day_of_week"] == 0) * 0.3  # Mondays also risky
        try:
            prob = 1 / (1 + math.exp(-logit))
        except OverflowError:
            prob = 0.0 if logit < 0 else 1.0
        risk = prob * 100 + random.uniform(-2, 2)
        self._last_reason = self._build_reason(feats, 3, prob)
        return round(max(0.0, min(100.0, risk)), 1)

    def _build_reason(self, feats: dict, mood: int, prob: float) -> str:
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        day_name = days[feats["day_of_week"]]
        reasons = []
        if feats["is_weekend"]:
            reasons.append("weekends are historically high-risk")
        if mood <= 2:
            reasons.append("your mood is low today")
        if feats["streak_length"] < 3:
            reasons.append("short streaks are fragile")
        if feats["num_targets"] > 5:
            reasons.append("you have many targets today (burnout risk)")
        if feats["day_of_week"] == 0:
            reasons.append("Mondays have lower completion rates")
        if not reasons:
            reasons.append(f"historical data for {day_name}s shows moderate risk")
        return f"Risk is high because: {'; '.join(reasons)}."

    def get_reason(self) -> str:
        return getattr(self, "_last_reason", "Based on your historical patterns.")


predictor = StreakPredictor()
