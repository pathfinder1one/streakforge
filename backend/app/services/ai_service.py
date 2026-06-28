"""
AI Service — Google Gemini integration for StreakForge.
Falls back to smart mock responses if no API key is configured,
so the app works perfectly in demo mode.
"""
import json
import random
from typing import Any
import google.generativeai as genai

from app.core.config import settings

# Initialize Gemini SDK if key is available
if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)


def is_ai_available() -> bool:
    return bool(settings.gemini_api_key)


async def _call_gemini(contents: list[dict], system_prompt: str = "") -> str:
    """
    Call Gemini API with multi-turn conversation contents array.
    Each item: {"role": "user"|"model", "parts": [{"text": "..."}]}
    """
    if not settings.gemini_api_key:
        return ""

    try:
        model_name = "gemini-3.1-flash-lite"
        if system_prompt:
            model = genai.GenerativeModel(model_name, system_instruction=system_prompt)
        else:
            model = genai.GenerativeModel(model_name)
            
        # Convert our REST JSON format to SDK format
        # The SDK expects [{"role": "user", "parts": ["hi"]}] where parts is a list of strings/objects
        sdk_contents = []
        for c in contents:
            sdk_parts = [p["text"] for p in c["parts"] if "text" in p]
            sdk_contents.append({"role": c["role"], "parts": sdk_parts})
            
        resp = await model.generate_content_async(
            sdk_contents,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=1024,
                temperature=0.7,
            )
        )
        return resp.text
    except Exception as e:
        error_text = str(e)
        if "404" in error_text and "is not found" in error_text:
            try:
                available = [m.name for m in genai.list_models() if "generateContent" in m.supported_generation_methods]
                error_text += f"\n\nAvailable models on your API key: {', '.join(available)}"
            except Exception:
                pass
        print(f"Gemini API SDK Error: {error_text}")
        return f"SYSTEM ERROR: API Request Failed. Details: {error_text}"


# ---------------------------------------------------------------------------
# MULTI-AGENT PERSONAS (Feature 5)
# ---------------------------------------------------------------------------

AGENT_PERSONAS = {
    "sentinel": {
        "name": "The Sentinel",
        "emoji": "🛡️",
        "system_prompt": 'You are The Sentinel, a supportive but firm accountability AI for StreakForge. Be encouraging, motivating, and helpful. 1. ACCOUNTABILITY: Gently verify completion without being aggressive. 2. ENCOURAGEMENT: Celebrate their wins and guide them constructively if they fail. 3. NEGOTIATION: If they are struggling, kindly suggest lowering the minimum time. 4. MEMORY: Reference past progress positively. Never be rude, condescending, or threaten to deduct coins aggressively. Respond ONLY in this JSON: {"message": "your response", "commands": [{"action": "mark_complete", "target_id": 123}, {"action": "deduct_coins", "amount": 50, "reason": "..."}, {"action": "renegotiate_target", "target_id": 124, "new_minimum_time": 15}], "suggested_tasks": [{"title": "...", "category": "Study|Coding|Health|Reading|Personal", "minimum_time": 30, "priority": "High|Medium|Low"}]}',
    },
    "compiler": {
        "name": "The Compiler",
        "emoji": "⚙️",
        "system_prompt": 'You are The Compiler, a helpful and experienced technical mentor for coding targets. Be supportive, patient, and encouraging. Guide the user gently to write code rather than just watching tutorials. Offer hints and celebrate their coding milestones. Respond ONLY in JSON: {"message": "your technical response", "commands": [], "suggested_tasks": []}',
    },
    "scholar": {
        "name": "The Scholar",
        "emoji": "📚",
        "system_prompt": 'You are The Scholar, a patient and encouraging academic mentor for study targets. Gently use the Feynman technique — kindly ask the user to explain concepts simply. Offer helpful study tips like spaced repetition. Respond ONLY in JSON: {"message": "your academic response", "commands": [], "suggested_tasks": []}',
    },
    "coach": {
        "name": "The Coach",
        "emoji": "💪",
        "system_prompt": 'You are The Coach, an uplifting and motivating fitness coach. Encourage consistency and celebrate small wins. Kindly verify workouts but focus on positive reinforcement. Respond ONLY in JSON: {"message": "your fitness response", "commands": [], "suggested_tasks": []}',
    },
    "accountant": {
        "name": "The Accountant",
        "emoji": "💰",
        "system_prompt": 'You are The Accountant, a wise and friendly financial coach. Help the user track savings and understand their spending habits constructively. Be supportive and guide them toward financial goals without harsh judgment. Respond ONLY in JSON: {"message": "your financial response", "commands": [], "suggested_tasks": []}',
    },
}


def _detect_agent_type(targets: list[dict], target_id: int | None) -> str:
    """Pick the right specialist agent based on target category."""
    if target_id:
        for t in targets:
            if t.get("id") == target_id:
                cat = t.get("category", "").lower()
                if cat == "coding":
                    return "compiler"
                elif cat == "study":
                    return "scholar"
                elif cat == "health":
                    return "coach"
                return "sentinel"
    return "sentinel"


# ---------------------------------------------------------------------------
# AI CHAT (with multi-turn memory + multi-agent routing)
# ---------------------------------------------------------------------------

MOCK_CHAT_RESPONSES = [
    "Great question! Based on your habits, I suggest breaking this goal into 3 daily steps: **start small** (10 min/day), **build consistency** (add 5 min weekly), and **track progress** daily. Want me to create these as tasks for you? 🎯",
    "I can help you plan that! Here is a quick breakdown:\n\n1. **Day 1-3**: Foundation — 20 mins each\n2. **Day 4-6**: Deep work — 45 mins each\n3. **Day 7**: Review and rest\n\nShall I add these to your targets? 💪",
    "Smart thinking! The key to success here is **time-blocking**. I recommend scheduling this for your peak energy hours (usually 9-11 AM). 🔥",
    "Based on your streak patterns, you are most consistent in the **mornings**. Let us schedule this task then! ✨",
    "Here is an AI-powered plan:\n\n📌 **This week**: Get started (15 min/day)\n📌 **Next week**: 30 min/day\n📌 **Week 3**: Full target time\n\nConsistency beats intensity every time! 🚀",
]

MOCK_TASK_SUGGESTIONS = [
    [
        {"title": "Research and Outline", "category": "Study", "minimum_time": 20, "priority": "High"},
        {"title": "First Draft", "category": "Study", "minimum_time": 30, "priority": "High"},
        {"title": "Review and Refine", "category": "Study", "minimum_time": 15, "priority": "Medium"},
    ],
    [
        {"title": "Warm-up Exercises", "category": "Health", "minimum_time": 10, "priority": "High"},
        {"title": "Main Workout", "category": "Health", "minimum_time": 30, "priority": "High"},
        {"title": "Cool-down and Stretch", "category": "Health", "minimum_time": 10, "priority": "Low"},
    ],
    [
        {"title": "Morning Journal", "category": "Personal", "minimum_time": 10, "priority": "Medium"},
        {"title": "Deep Focus Session", "category": "Coding", "minimum_time": 45, "priority": "High"},
        {"title": "Evening Review", "category": "Personal", "minimum_time": 10, "priority": "Low"},
    ],
]


async def chat(
    user_message: str,
    user_context: dict,
    db=None,
    user_id: int | None = None,
    target_id: int | None = None,
) -> dict[str, Any]:
    """
    Handle AI chat message with multi-turn memory and multi-agent routing.
    Loads last 10 messages from DB for memory context.
    Routes to specialist agent persona based on target category.
    Saves user + assistant messages to DB after each turn.
    """
    targets = user_context.get("targets", [])
    agent_type = _detect_agent_type(targets, target_id)
    persona = AGENT_PERSONAS.get(agent_type, AGENT_PERSONAS["sentinel"])

    # Build multi-turn conversation history
    history_contents: list[dict] = []

    if db and user_id:
        from app.models.ai_conversation import AIConversation
        from sqlalchemy import desc

        past_msgs = (
            db.query(AIConversation)
            .filter(
                AIConversation.user_id == user_id,
                AIConversation.target_id == target_id,
            )
            .order_by(desc(AIConversation.id))
            .limit(10)
            .all()
        )
        for msg in reversed(past_msgs):
            gemini_role = "model" if msg.role == "assistant" else "user"
            history_contents.append({
                "role": gemini_role,
                "parts": [{"text": msg.message}],
            })

    targets_json = json.dumps(targets, indent=2)
    current_user_text = (
        f"User context:\n"
        f"- Level: {user_context.get('level', 1)} | XP: {user_context.get('xp', 0)} | Coins: {user_context.get('coins', 0)}\n"
        f"- Current streak: {user_context.get('current_streak', 0)} days\n"
        f"- Completed today: {user_context.get('completed_today', 0)}/{user_context.get('total_today', 0)} targets\n"
        f"- Active Targets: {targets_json}\n\n"
        f"User message: {user_message}"
    )

    history_contents.append({
        "role": "user",
        "parts": [{"text": current_user_text}],
    })

    raw = await _call_gemini(history_contents, system_prompt=persona["system_prompt"])

    if not raw:
        result = {
            "message": persona["emoji"] + " " + random.choice(MOCK_CHAT_RESPONSES),
            "suggested_tasks": random.choice(MOCK_TASK_SUGGESTIONS) if any(
                kw in user_message.lower() for kw in ["plan", "create", "add", "make", "help me", "start", "task", "study", "workout", "learn"]
            ) else [],
            "commands": [],
            "agent_type": agent_type,
            "agent_name": persona["name"],
        }
    else:
        try:
            clean = raw
            if "```json" in clean:
                clean = clean.split("```json")[1].split("```")[0]
            elif "```" in clean:
                clean = clean.split("```")[1].split("```")[0]
            result = json.loads(clean.strip())
            result["agent_type"] = agent_type
            result["agent_name"] = persona["name"]
        except Exception:
            result = {
                "message": raw,
                "suggested_tasks": [],
                "commands": [],
                "agent_type": agent_type,
                "agent_name": persona["name"],
            }

    # Persist conversation turns to DB
    if db and user_id:
        from app.models.ai_conversation import AIConversation
        db.add(AIConversation(
            user_id=user_id,
            target_id=target_id,
            agent_type=agent_type,
            role="user",
            message=user_message,
        ))
        db.add(AIConversation(
            user_id=user_id,
            target_id=target_id,
            agent_type=agent_type,
            role="assistant",
            message=result.get("message", ""),
        ))
        db.commit()

    return result


# ---------------------------------------------------------------------------
# AI PRIORITIZATION
# ---------------------------------------------------------------------------

async def prioritize_targets(targets: list[dict]) -> list[dict]:
    """Return targets sorted by AI-assessed priority."""
    if not targets:
        return targets

    prompt = (
        "You are an AI productivity coach. Given these tasks, return them in optimal order "
        "(most important/urgent first). Consider: priority level, time required, category urgency.\n\n"
        f"Tasks: {json.dumps(targets, indent=2)}\n\n"
        "Return ONLY a JSON array of task IDs in the optimal order, like: [3, 1, 4, 2]"
    )

    contents = [{"role": "user", "parts": [{"text": prompt}]}]
    raw = await _call_gemini(contents)
    if not raw:
        priority_order = {"High": 0, "Medium": 1, "Low": 2}
        return sorted(targets, key=lambda t: (priority_order.get(t.get("priority", "Medium"), 1), -t.get("minimum_time", 0)))

    try:
        if "```" in raw:
            raw = raw.split("```")[1].split("```")[0]
        ordered_ids = json.loads(raw.strip())
        id_to_target = {t["id"]: t for t in targets}
        result = [id_to_target[i] for i in ordered_ids if i in id_to_target]
        returned_ids = set(ordered_ids)
        for t in targets:
            if t["id"] not in returned_ids:
                result.append(t)
        return result
    except Exception:
        return targets


# ---------------------------------------------------------------------------
# AI GOAL PLANNING
# ---------------------------------------------------------------------------

async def plan_goal(goal: str, days: int = 7) -> list[dict]:
    """Break a big goal into daily subtasks."""
    prompt = (
        f"You are an AI productivity planner for StreakForge.\n\n"
        f"Break down this goal into {days} actionable daily tasks:\n"
        f"Goal: \"{goal}\"\n\n"
        "Return ONLY a JSON array of tasks:\n"
        "[\n"
        "  {\"title\": \"Task name (concise)\", \"category\": \"Study|Coding|Health|Reading|Personal\", \"minimum_time\": 30, \"priority\": \"High|Medium|Low\", \"frequency\": \"Daily|One Time\"}\n"
        "]\n\n"
        f"Make tasks specific, measurable, and achievable. Max {min(days, 5)} tasks."
    )

    contents = [{"role": "user", "parts": [{"text": prompt}]}]
    raw = await _call_gemini(contents)
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


# ---------------------------------------------------------------------------
# AI RECOMMENDATIONS
# ---------------------------------------------------------------------------

MOCK_RECOMMENDATIONS = [
    [
        {"type": "motivation", "icon": "🔥", "title": "Keep Your Streak Alive!", "description": "You are on a great streak! Complete at least one target today to keep the momentum going."},
        {"type": "tip", "icon": "⏰", "title": "Best Time to Focus", "description": "Your completion rate is highest in the morning. Try tackling high-priority tasks before 11 AM."},
        {"type": "challenge", "icon": "🏆", "title": "Level Up Challenge", "description": "Complete all targets for 3 consecutive days to earn bonus XP and a special badge!"},
    ],
    [
        {"type": "insight", "icon": "📊", "title": "Consistency is Key", "description": "Users who track for 7+ days see 3x better results. You are building an incredible habit!"},
        {"type": "tip", "icon": "🎯", "title": "Focus Mode", "description": "Set a 25-minute timer (Pomodoro) for your hardest task. No distractions — just pure focus."},
        {"type": "motivation", "icon": "💪", "title": "You are Stronger Than You Think", "description": "Every completed target is a vote for the person you are becoming. Keep going!"},
    ],
]


async def get_recommendations(user_context: dict) -> list[dict]:
    """Get personalized productivity recommendations."""
    prompt = (
        "You are an AI coach for StreakForge productivity app.\n\n"
        "User stats:\n"
        f"- Current streak: {user_context.get('current_streak', 0)} days\n"
        f"- Longest streak: {user_context.get('longest_streak', 0)} days\n"
        f"- Completed today: {user_context.get('completed_today', 0)}/{user_context.get('total_today', 0)} targets\n"
        f"- Level: {user_context.get('level', 1)}\n"
        f"- XP: {user_context.get('xp', 0)}\n\n"
        "Generate 3 personalized productivity recommendations.\n\n"
        "Return ONLY a JSON array:\n"
        "[\n"
        "  {\n"
        "    \"type\": \"motivation|tip|insight|challenge\",\n"
        "    \"icon\": \"emoji\",\n"
        "    \"title\": \"Short title\",\n"
        "    \"description\": \"2-3 sentence actionable recommendation\"\n"
        "  }\n"
        "]"
    )

    contents = [{"role": "user", "parts": [{"text": prompt}]}]
    raw = await _call_gemini(contents)
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


# ---------------------------------------------------------------------------
# IMAGE VERIFICATION
# ---------------------------------------------------------------------------

import base64


async def verify_image(target_title: str, image_bytes: bytes, mime_type: str) -> dict:
    """Uses Gemini Multimodal to verify if an uploaded image proves the target was completed."""
    if not settings.gemini_api_key:
        return {"verified": True, "reason": "Mock mode: Image looks good!"}

    prompt = f"Verify if this image proves the user completed their habit: '{target_title}'. Respond STRICTLY in JSON: {{\"verified\": true/false, \"reason\": \"one sentence\"}}"

    try:
        model = genai.GenerativeModel("gemini-3.1-flash-lite")
        
        # Prepare the multimodal content
        image_part = {
            "mime_type": mime_type,
            "data": image_bytes
        }
        
        resp = await model.generate_content_async(
            [prompt, image_part],
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=256,
                temperature=0.4,
            )
        )
        
        raw = resp.text
        if "```json" in raw:
            raw = raw.split("```json")[1].split("```")[0]
        elif "```" in raw:
            raw = raw.split("```")[1].split("```")[0]
        return json.loads(raw.strip())
    except Exception as e:
        return {"verified": False, "reason": f"AI Verification failed: {str(e)}"}


# ---------------------------------------------------------------------------
# PROACTIVE NUDGE GENERATION (Feature 4)
# ---------------------------------------------------------------------------

async def generate_nudge(user_name: str, pending_targets: list[str], streak: int, risk_score: float) -> str:
    """Generate a personalized proactive nudge message for the user."""
    targets_str = ", ".join(pending_targets[:3]) if pending_targets else "your habits"
    prompt = (
        f"You are The Sentinel. Generate a SHORT (2 sentences max), urgent, personalized nudge for {user_name}.\n\n"
        f"Context:\n"
        f"- They have NOT started any session today\n"
        f"- Streak: {streak} days (at risk!)\n"
        f"- Pending habits: {targets_str}\n"
        f"- Streak break risk: {int(risk_score * 100)}%\n\n"
        "Be direct and urgent. Return ONLY the notification message text."
    )

    contents = [{"role": "user", "parts": [{"text": prompt}]}]
    raw = await _call_gemini(contents)
    if not raw:
        first_target = pending_targets[0] if pending_targets else "your habit"
        return f"Your {streak}-day streak is in danger! Start '{first_target}' NOW before it is too late. — The Sentinel"
    return raw.strip()


# Keep backward compat — old callers using get_gemini_model() return None gracefully
def get_gemini_model():
    return None
