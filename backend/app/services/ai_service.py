"""
AI Service — Google Gemini integration for StreakForge.
Falls back to smart mock responses if no API key is configured,
so the app works perfectly in demo mode.
"""
import json
import random
from typing import Any

import httpx

from app.core.config import settings


GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


async def _call_gemini(prompt: str) -> str:
    """Call Gemini API or return mock if no key."""
    if not settings.gemini_api_key:
        return ""  # Signal to use mock

    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": 1024, "temperature": 0.7},
    }
    url = f"{GEMINI_API_URL}?key={settings.gemini_api_key}"

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


# ─────────────────────────────────────────────────────────────────────────────
# AI CHAT
# ─────────────────────────────────────────────────────────────────────────────

MOCK_CHAT_RESPONSES = [
    "Great question! Based on your habits, I suggest breaking this goal into 3 daily steps: **start small** (10 min/day), **build consistency** (add 5 min weekly), and **track progress** daily. Want me to create these as tasks for you? 🎯",
    "I can help you plan that! Here's a quick breakdown:\n\n1. **Day 1-3**: Foundation — 20 mins each\n2. **Day 4-6**: Deep work — 45 mins each\n3. **Day 7**: Review & rest\n\nShall I add these to your targets? 💪",
    "Smart thinking! The key to success here is **time-blocking**. I recommend scheduling this for your peak energy hours (usually 9-11 AM). I'll set a reminder and create a focused target for you. 🔥",
    "Based on your streak patterns, you're most consistent in the **mornings**. Let's schedule this task then! I'm creating a new target: 30 minutes daily — does that work? ✨",
    "Here's an AI-powered plan for you:\n\n📌 **This week's focus**: Get started (just 15 min/day)\n📌 **Next week**: Increase to 30 min/day\n📌 **Week 3**: Full target time\n\nConsistency beats intensity every time! Want me to create these progressive targets? 🚀",
]

MOCK_TASK_SUGGESTIONS = [
    [
        {"title": "Research & Outline", "category": "Study", "minimum_time": 20, "priority": "High"},
        {"title": "First Draft", "category": "Study", "minimum_time": 30, "priority": "High"},
        {"title": "Review & Refine", "category": "Study", "minimum_time": 15, "priority": "Medium"},
    ],
    [
        {"title": "Warm-up Exercises", "category": "Health", "minimum_time": 10, "priority": "High"},
        {"title": "Main Workout", "category": "Health", "minimum_time": 30, "priority": "High"},
        {"title": "Cool-down & Stretch", "category": "Health", "minimum_time": 10, "priority": "Low"},
    ],
    [
        {"title": "Morning Journal", "category": "Personal", "minimum_time": 10, "priority": "Medium"},
        {"title": "Deep Focus Session", "category": "Coding", "minimum_time": 45, "priority": "High"},
        {"title": "Evening Review", "category": "Personal", "minimum_time": 10, "priority": "Low"},
    ],
]


async def chat(user_message: str, user_context: dict) -> dict[str, Any]:
    """Handle AI chat message, acting as the Sentinel Accountability Agent."""
    
    targets_json = json.dumps(user_context.get("targets", []), indent=2)
    
    prompt = f"""You are 'The Sentinel', an ultra-advanced, slightly intimidating, and hardcore accountability AI coach for StreakForge.
Your job is NOT to be a nice 'yes-man'. Your job is to ensure the user actually does their work, doesn't make excuses, and respects their goals.

User context:
- Level: {user_context.get('level', 1)} | XP: {user_context.get('xp', 0)} | Coins: {user_context.get('coins', 0)}
- Current streak: {user_context.get('current_streak', 0)} days
- Completed today: {user_context.get('completed_today', 0)}/{user_context.get('total_today', 0)} targets

Active Targets Today:
{targets_json}

User message: {user_message}

Behaviors:
1. TRUTH VERIFICATION: If the user says they completed a target, ask them for specific details or proof BEFORE marking it complete. If their answer is weak, deny the completion.
2. TOUGH LOVE: If they make lazy excuses, be stern. You have the power to deduct coins as a penalty.
3. DYNAMIC NEGOTIATION: If they are genuinely struggling, you can lower a target's minimum time but warn them you will reduce the XP reward.
4. ROUTINE BUILDING: If they want a hardcore routine (like 'Navy SEAL mode'), suggest 3-5 brutal targets.

You MUST respond in this EXACT JSON format:
{{
  "message": "Your stern, motivating, or interrogating response",
  "commands": [
    {{
      "action": "mark_complete",
      "target_id": 123
    }},
    {{
      "action": "deduct_coins",
      "amount": 50,
      "reason": "Lazy excuse for missing gym"
    }},
    {{
      "action": "renegotiate_target",
      "target_id": 124,
      "new_minimum_time": 15
    }}
  ],
  "suggested_tasks": [
    {{"title": "Task name", "category": "Study|Coding|Health|Reading|Personal", "minimum_time": 30, "priority": "High|Medium|Low"}}
  ]
}}

- If no commands are needed, leave 'commands' empty.
- If no tasks need to be created, leave 'suggested_tasks' empty.
- You can execute multiple commands at once.
"""

    raw = await _call_gemini(prompt)
    if not raw:
        # Mock mode
        return {
            "message": random.choice(MOCK_CHAT_RESPONSES),
            "suggested_tasks": random.choice(MOCK_TASK_SUGGESTIONS) if any(
                kw in user_message.lower() for kw in ["plan", "create", "add", "make", "help me", "start", "task", "study", "workout", "learn"]
            ) else [],
            "commands": []
        }

    try:
        # Extract JSON from markdown code block if present
        if "```json" in raw:
            raw = raw.split("```json")[1].split("```")[0]
        elif "```" in raw:
            raw = raw.split("```")[1].split("```")[0]
        return json.loads(raw.strip())
    except Exception:
        return {"message": raw, "suggested_tasks": []}


# ─────────────────────────────────────────────────────────────────────────────
# AI PRIORITIZATION
# ─────────────────────────────────────────────────────────────────────────────

async def prioritize_targets(targets: list[dict]) -> list[dict]:
    """Return targets sorted by AI-assessed priority."""
    if not targets:
        return targets

    prompt = f"""You are an AI productivity coach. Given these tasks, return them in optimal order 
(most important/urgent first). Consider: priority level, time required, category urgency.

Tasks: {json.dumps(targets, indent=2)}

Return ONLY a JSON array of task IDs in the optimal order, like: [3, 1, 4, 2]"""

    raw = await _call_gemini(prompt)
    if not raw:
        # Mock: sort by priority then time
        priority_order = {"High": 0, "Medium": 1, "Low": 2}
        return sorted(targets, key=lambda t: (priority_order.get(t.get("priority", "Medium"), 1), -t.get("minimum_time", 0)))

    try:
        if "```" in raw:
            raw = raw.split("```")[1].split("```")[0]
        ordered_ids = json.loads(raw.strip())
        id_to_target = {t["id"]: t for t in targets}
        result = [id_to_target[i] for i in ordered_ids if i in id_to_target]
        # Add any not returned by AI at end
        returned_ids = set(ordered_ids)
        for t in targets:
            if t["id"] not in returned_ids:
                result.append(t)
        return result
    except Exception:
        return targets


# ─────────────────────────────────────────────────────────────────────────────
# AI GOAL PLANNING
# ─────────────────────────────────────────────────────────────────────────────

async def plan_goal(goal: str, days: int = 7) -> list[dict]:
    """Break a big goal into daily subtasks."""
    prompt = f"""You are an AI productivity planner for StreakForge.
    
Break down this goal into {days} actionable daily tasks:
Goal: "{goal}"

Return ONLY a JSON array of tasks:
[
  {{"title": "Task name (concise)", "category": "Study|Coding|Health|Reading|Personal", "minimum_time": 30, "priority": "High|Medium|Low", "frequency": "Daily|One Time"}}
]

Make tasks specific, measurable, and achievable. Max {min(days, 5)} tasks."""

    raw = await _call_gemini(prompt)
    if not raw:
        return [
            {"title": f"Work on: {goal[:40]} (Part 1)", "category": "Personal", "minimum_time": 30, "priority": "High", "frequency": "Daily"},
            {"title": f"Review progress on: {goal[:35]}", "category": "Personal", "minimum_time": 15, "priority": "Medium", "frequency": "Daily"},
            {"title": f"Deep dive: {goal[:40]}", "category": "Personal", "minimum_time": 45, "priority": "High", "frequency": "Daily"},
        ]

    try:
        if "```json" in raw:
            raw = raw.split("```json")[1].split("```")[0]
        elif "```" in raw:
            raw = raw.split("```")[1].split("```")[0]
        return json.loads(raw.strip())
    except Exception:
        return []


# ─────────────────────────────────────────────────────────────────────────────
# AI RECOMMENDATIONS
# ─────────────────────────────────────────────────────────────────────────────

MOCK_RECOMMENDATIONS = [
    [
        {"type": "motivation", "icon": "🔥", "title": "Keep Your Streak Alive!", "description": "You're on a great streak! Complete at least one target today to keep the momentum going."},
        {"type": "tip", "icon": "⏰", "title": "Best Time to Focus", "description": "Your completion rate is highest in the morning. Try tackling high-priority tasks before 11 AM."},
        {"type": "challenge", "icon": "🏆", "title": "Level Up Challenge", "description": "Complete all targets for 3 consecutive days to earn bonus XP and a special badge!"},
    ],
    [
        {"type": "insight", "icon": "📊", "title": "Consistency is Key", "description": "Users who track for 7+ days see 3x better results. You're building an incredible habit!"},
        {"type": "tip", "icon": "🎯", "title": "Focus Mode", "description": "Set a 25-minute timer (Pomodoro) for your hardest task. No distractions — just pure focus."},
        {"type": "motivation", "icon": "💪", "title": "You're Stronger Than You Think", "description": "Every completed target is a vote for the person you're becoming. Keep going!"},
    ],
    [
        {"type": "tip", "icon": "📚", "title": "Stack Your Habits", "description": "Try doing your Reading target right after your morning coffee — habit stacking increases consistency by 40%."},
        {"type": "challenge", "icon": "⚡", "title": "Speed Run Today", "description": "Challenge yourself to complete your easiest 2 targets in the first hour of your day!"},
        {"type": "insight", "icon": "🌟", "title": "You're in the Top 10%", "description": "Most people abandon habits within 3 days. The fact you're here means you're already winning."},
    ],
]


async def get_recommendations(user_context: dict) -> list[dict]:
    """Get personalized productivity recommendations."""
    prompt = f"""You are an AI coach for StreakForge productivity app.

User stats:
- Current streak: {user_context.get('current_streak', 0)} days  
- Longest streak: {user_context.get('longest_streak', 0)} days
- Completed today: {user_context.get('completed_today', 0)}/{user_context.get('total_today', 0)} targets
- Level: {user_context.get('level', 1)}
- XP: {user_context.get('xp', 0)}

Generate 3 personalized productivity recommendations.

Return ONLY a JSON array:
[
  {{
    "type": "motivation|tip|insight|challenge",
    "icon": "emoji",
    "title": "Short title",
    "description": "2-3 sentence actionable recommendation"
  }}
]"""

    raw = await _call_gemini(prompt)
    if not raw:
        return random.choice(MOCK_RECOMMENDATIONS)

    try:
        if "```json" in raw:
            raw = raw.split("```json")[1].split("```")[0]
        elif "```" in raw:
            raw = raw.split("```")[1].split("```")[0]
        return json.loads(raw.strip())
    except Exception:
        return random.choice(MOCK_RECOMMENDATIONS)

import base64

async def verify_image(target_title: str, image_bytes: bytes, mime_type: str) -> dict:
    """Uses Gemini Multimodal to verify if an uploaded image proves the target was completed."""
    if not settings.gemini_api_key:
        # Mock verification for local dev
        return {"verified": True, "reason": "Mock mode: Image looks good!"}
        
    prompt = f"Verify if this image serves as proof that the user completed their habit/target titled: '{target_title}'. Focus on finding evidence related to the target. Respond STRICTLY in JSON format: {{\"verified\": true/false, \"reason\": \"a short 1-sentence explanation\"}}"
    
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {
                    "inlineData": {
                        "mimeType": mime_type,
                        "data": base64.b64encode(image_bytes).decode('utf-8')
                    }
                }
            ]
        }],
        "generationConfig": {"maxOutputTokens": 1024, "temperature": 0.4},
    }
    url = f"{GEMINI_API_URL}?key={settings.gemini_api_key}"

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw = data["candidates"][0]["content"]["parts"][0]["text"]
            
            if "```json" in raw:
                raw = raw.split("```json")[1].split("```")[0]
            elif "```" in raw:
                raw = raw.split("```")[1].split("```")[0]
            return json.loads(raw.strip())
        except Exception as e:
            return {"verified": False, "reason": f"AI Verification failed: {str(e)}"}
