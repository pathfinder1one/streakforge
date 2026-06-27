from app.models.target import Target

class HabitRecommender:
    def __init__(self):
        # A curated dataset of highly effective habits
        self.habit_database = [
            {"title": "Morning Meditation", "category": "Health", "desc": "10 minutes of mindfulness to start the day calm.", "priority": "High"},
            {"title": "Read 10 Pages", "category": "Reading", "desc": "Read a non-fiction book to learn something new.", "priority": "Medium"},
            {"title": "Drink 3L Water", "category": "Health", "desc": "Stay hydrated throughout the day.", "priority": "High"},
            {"title": "Learn a New Framework", "category": "Coding", "desc": "Spend 30 minutes reading docs or watching a tutorial.", "priority": "Medium"},
            {"title": "LeetCode Daily", "category": "Coding", "desc": "Solve 1 algorithm problem to keep skills sharp.", "priority": "High"},
            {"title": "Evening Walk", "category": "Health", "desc": "15 minute walk after dinner for digestion.", "priority": "Low"},
            {"title": "Plan Tomorrow", "category": "Personal", "desc": "Write down top 3 tasks for the next day.", "priority": "High"},
            {"title": "No Social Media before 12", "category": "Personal", "desc": "Deep focus morning without distractions.", "priority": "High"},
            {"title": "Review Flashcards", "category": "Study", "desc": "Spaced repetition study session.", "priority": "Medium"},
            {"title": "Stretching/Yoga", "category": "Health", "desc": "15 mins of mobility work.", "priority": "Low"}
        ]
        
    def _get_words(self, text: str) -> set:
        return set(text.lower().split())

    def recommend_for_user(self, user_targets: list[Target], n_recommendations: int = 3):
        if not user_targets:
            # Return top high priority defaults
            return [h for h in self.habit_database if h["priority"] == "High"][:n_recommendations]
            
        # Build user profile words
        user_words = set()
        user_titles = set()
        for t in user_targets:
            user_words.update(self._get_words(t.title))
            user_words.update(self._get_words(t.category.value if hasattr(t.category, "value") else str(t.category)))
            user_titles.add(t.title.lower())
            
        # Score each habit using Jaccard-like Similarity
        scored_habits = []
        for habit in self.habit_database:
            if habit["title"].lower() in user_titles:
                continue
                
            habit_words = self._get_words(habit["title"]) | self._get_words(habit["category"]) | self._get_words(habit["desc"])
            
            intersection = len(user_words.intersection(habit_words))
            union = len(user_words.union(habit_words))
            
            # Simple word overlap ratio
            score = (intersection / union) if union > 0 else 0
            
            scored_habits.append({
                "title": habit["title"],
                "category": habit["category"],
                "priority": habit["priority"],
                "description": habit["desc"],
                "match_score": round(score * 100, 1)
            })
            
        # Sort by match score
        scored_habits.sort(key=lambda x: x["match_score"], reverse=True)
        
        # Fallback to defaults if not enough scored
        result = scored_habits[:n_recommendations]
        if len(result) < n_recommendations:
            for h in self.habit_database:
                if h["title"].lower() not in user_titles and not any(r["title"] == h["title"] for r in result):
                    result.append({
                        "title": h["title"],
                        "category": h["category"],
                        "priority": h["priority"],
                        "description": h["desc"],
                        "match_score": 0.0
                    })
                if len(result) == n_recommendations:
                    break
                    
        return result

recommender = HabitRecommender()
