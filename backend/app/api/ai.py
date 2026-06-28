from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.target import Target
from app.services import ai_service
from app.services.target_service import create_target
from app.schemas.target import TargetCreate
from app.models.target import CategoryEnum, PriorityEnum, FrequencyEnum

router = APIRouter(prefix="/ai", tags=["ai"])


# ─── Chat ────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    create_suggested_tasks: bool = False
    target_id: int | None = None  # Optional: scope conversation to a specific target


class SuggestedTask(BaseModel):
    title: str
    category: str = "Personal"
    minimum_time: int = 25
    priority: str = "Medium"


class ExecutedCommand(BaseModel):
    action: str
    target_id: int | None = None
    detail: str | None = None

class ChatResponse(BaseModel):
    message: str
    suggested_tasks: List[SuggestedTask] = []
    created_tasks: List[int] = []
    executed_commands: List[ExecutedCommand] = []
    agent_type: str = "sentinel"
    agent_name: str = "The Sentinel"

@router.post("/chat", response_model=ChatResponse)
async def ai_chat(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.services import timer_service
    from app.models.target import Target
    from app.utils.date_utils import user_local_today
    
    today = user_local_today(current_user.tz_offset_minutes)
    targets = db.query(Target).filter(Target.user_id == current_user.id).all()
    
    # Send simplified targets info to AI
    target_dicts = [
        {
            "id": t.id, 
            "title": t.title, 
            "priority": t.priority.value if hasattr(t.priority, "value") else str(t.priority), 
            "min_time": t.minimum_time
        }
        for t in targets
    ]

    user_context = {
        "current_streak": current_user.current_streak,
        "longest_streak": current_user.longest_streak,
        "level": current_user.level,
        "xp": current_user.xp,
        "coins": current_user.coins,
        "total_today": len(targets),
        "completed_today": 0, # simplified
        "targets": target_dicts
    }
    
    result = await ai_service.chat(
        data.message,
        user_context,
        db=db,
        user_id=current_user.id,
        target_id=data.target_id,
    )

    created_ids = []
    if data.create_suggested_tasks and result.get("suggested_tasks"):
        for task_data in result["suggested_tasks"]:
            try:
                cat = CategoryEnum(task_data.get("category", "Personal"))
            except ValueError:
                cat = CategoryEnum.personal
            try:
                pri = PriorityEnum(task_data.get("priority", "Medium"))
            except ValueError:
                pri = PriorityEnum.medium
            t = create_target(
                db,
                current_user,
                TargetCreate(
                    title=task_data["title"],
                    category=cat,
                    priority=pri,
                    minimum_time=task_data.get("minimum_time", 25),
                    frequency=FrequencyEnum.daily,
                ),
            )
            created_ids.append(t.id)

    # Process Sentinel Commands
    executed_commands = []
    if result.get("commands"):
        for cmd in result["commands"]:
            action = cmd.get("action")
            tid = cmd.get("target_id")
            if action == "mark_complete" and tid:
                try:
                    # To mark complete autonomously, start and end a 0-sec session
                    sess = timer_service.start_session(db, current_user, tid)
                    timer_service.end_session(db, current_user, sess.id, True, force_complete=True)
                    executed_commands.append(ExecutedCommand(action=action, target_id=tid, detail="Target marked as complete."))
                except Exception as e:
                    executed_commands.append(ExecutedCommand(action=action, target_id=tid, detail=f"Failed to mark complete: {e}"))
            elif action == "deduct_coins":
                amount = int(cmd.get("amount", 0))
                # Hard cap deductions to 10 coins max to prevent the AI from draining the user's balance
                amount = min(amount, 10)
                if amount > 0:
                    current_user.coins = max(0, current_user.coins - amount)
                    db.commit()
                    executed_commands.append(ExecutedCommand(action=action, detail=f"Burned {amount} coins. Reason: {cmd.get('reason', '')}"))
            elif action == "renegotiate_target" and tid:
                new_time = max(1, int(cmd.get("new_minimum_time", 1)))
                target = db.query(Target).filter(Target.id == tid, Target.user_id == current_user.id).first()
                if target:
                    target.minimum_time = new_time
                    db.commit()
                    executed_commands.append(ExecutedCommand(action=action, target_id=tid, detail=f"Target time reduced to {new_time} mins."))

    return ChatResponse(
        message=result.get("message", ""),
        suggested_tasks=result.get("suggested_tasks", []),
        created_tasks=created_ids,
        executed_commands=executed_commands,
        agent_type=result.get("agent_type", "sentinel"),
        agent_name=result.get("agent_name", "The Sentinel"),
    )


# --- Conversation History Endpoint ---

class ConversationMessage(BaseModel):
    id: int
    role: str
    message: str
    agent_type: str
    agent_name: str
    created_at: str


@router.get("/history", response_model=List[ConversationMessage])
def get_chat_history(
    target_id: int | None = None,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get conversation history, optionally filtered by target."""
    from app.models.ai_conversation import AIConversation
    from app.services.ai_service import AGENT_PERSONAS
    from sqlalchemy import desc

    query = db.query(AIConversation).filter(AIConversation.user_id == current_user.id)
    if target_id is not None:
        query = query.filter(AIConversation.target_id == target_id)

    msgs = query.order_by(desc(AIConversation.id)).limit(limit).all()

    return [
        ConversationMessage(
            id=m.id,
            role=m.role,
            message=m.message,
            agent_type=m.agent_type,
            agent_name=AGENT_PERSONAS.get(m.agent_type, AGENT_PERSONAS["sentinel"])["name"],
            created_at=m.created_at.isoformat(),
        )
        for m in reversed(msgs)
    ]


# ─── Prioritize ───────────────────────────────────────────────────────────────

class PrioritizeRequest(BaseModel):
    target_ids: List[int]


@router.post("/prioritize")
async def ai_prioritize(
    data: PrioritizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    targets = (
        db.query(Target)
        .filter(Target.user_id == current_user.id, Target.id.in_(data.target_ids))
        .all()
    )
    target_dicts = [
        {
            "id": t.id,
            "title": t.title,
            "category": t.category.value if hasattr(t.category, "value") else str(t.category),
            "priority": t.priority.value if hasattr(t.priority, "value") else str(t.priority),
            "minimum_time": t.minimum_time,
        }
        for t in targets
    ]
    sorted_targets = await ai_service.prioritize_targets(target_dicts)
    return {"ordered_ids": [t["id"] for t in sorted_targets]}


# ─── Plan Goal ────────────────────────────────────────────────────────────────

class PlanGoalRequest(BaseModel):
    goal: str
    days: int = 7
    create_tasks: bool = False


@router.post("/plan-goal")
async def ai_plan_goal(
    data: PlanGoalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tasks = await ai_service.plan_goal(data.goal, data.days)

    created_ids = []
    if data.create_tasks:
        for task_data in tasks:
            try:
                cat = CategoryEnum(task_data.get("category", "Personal"))
            except ValueError:
                cat = CategoryEnum.personal
            try:
                pri = PriorityEnum(task_data.get("priority", "Medium"))
            except ValueError:
                pri = PriorityEnum.medium
            try:
                freq = FrequencyEnum(task_data.get("frequency", "Daily"))
            except ValueError:
                freq = FrequencyEnum.daily
            t = create_target(
                db,
                current_user,
                TargetCreate(
                    title=task_data["title"],
                    category=cat,
                    priority=pri,
                    minimum_time=task_data.get("minimum_time", 30),
                    frequency=freq,
                ),
            )
            created_ids.append(t.id)

    return {"tasks": tasks, "created_ids": created_ids}


# ─── Recommendations ─────────────────────────────────────────────────────────

@router.get("/recommendations")
async def ai_recommendations(
    current_user: User = Depends(get_current_user),
):
    user_context = {
        "current_streak": current_user.current_streak,
        "longest_streak": current_user.longest_streak,
        "level": current_user.level,
        "xp": current_user.xp,
        "coins": current_user.coins,
    }
    recs = await ai_service.get_recommendations(user_context)
    return {"recommendations": recs}
@router.post("/suggest-difficulty")
async def suggest_difficulty(
    data: dict,
    current_user: User = Depends(get_current_user),
):
    """
    Takes a target title and returns a smart suggestion based on AI.
    """
    title = data.get("title", "")
    if not title:
        return {"suggestion": None}
        
    prompt = f"The user wants to start a habit/target called: '{title}'. Suggest a smart, achievable breakdown (e.g. 10 pages/day, 30 mins) in one short sentence. Start with 'AI Suggests: '."
    
    # Fast fallback logic first to save time if no API key
    from app.services.ai_service import is_ai_available
    if not is_ai_available():
        lower = title.lower()
        if 'read' in lower or 'book' in lower:
            return {"suggestion": "AI Suggests: Break this into 10 pages/day for optimal completion rates."}
        elif 'workout' in lower or 'gym' in lower or 'exercise' in lower:
            return {"suggestion": "AI Suggests: Start with a 30-min block to build consistency before scaling up."}
        elif 'code' in lower or 'study' in lower:
            return {"suggestion": "AI Suggests: Use the Pomodoro technique (25 min focus) for this."}
        return {"suggestion": "AI Suggests: Ensure your goal is specific, measurable, and achievable in < 1 hour."}
        
    # If AI is available, use it
    try:
        from app.services.ai_service import get_gemini_model
        model = get_gemini_model()
        if model:
            response = await model.generate_content_async(prompt)
            return {"suggestion": response.text.strip()}
    except Exception as e:
        print(f"AI Suggestion error: {e}")
        
    return {"suggestion": "AI Suggests: Ensure your goal is specific, measurable, and achievable in < 1 hour."}
