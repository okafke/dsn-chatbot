import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.games.registry import list_games, get_game
from app.models.conversation import Conversation
from app.models.user import User
from app.schemas.chat import GameResponse, MessageResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/games", tags=["games"])


@router.get("", response_model=list[GameResponse])
async def get_games(language: str = Query(default="en")):
    """List all available games, with descriptions in the requested language."""
    games = list_games()
    return [
        GameResponse(
            id=g.id,
            name=g.name,
            description=g.get_description(language),
            initial_mood=g.initial_mood,
            initial_message=g.get_initial_message(language),
        )
        for g in games
    ]


class PasswordCheckRequest(BaseModel):
    game_id: str
    password: str
    conversation_id: uuid.UUID | None = None


class PasswordCheckResponse(BaseModel):
    correct: bool


@router.post("/check-password", response_model=PasswordCheckResponse)
async def check_password(
    request: PasswordCheckRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Check if the submitted password matches the game's secret password."""
    game = get_game(request.game_id)
    if not game or not game.password:
        return PasswordCheckResponse(correct=False)

    correct = request.password.strip().upper() == game.password.strip().upper()

    # If correct and we have a conversation_id, mark it as solved
    if correct and request.conversation_id:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == request.conversation_id,
                Conversation.user_id == current_user.id,
            )
        )
        conversation = result.scalar_one_or_none()
        if conversation and not conversation.solved_at:
            conversation.solved_at = datetime.now(timezone.utc)
            await db.flush()

    return PasswordCheckResponse(correct=correct)


class SolvedConversationResponse(BaseModel):
    id: uuid.UUID
    title: str
    username: str
    solved_at: datetime | None = None
    created_at: datetime
    final_mood: str | None = None
    messages: list[MessageResponse] = []

    model_config = {"from_attributes": True}


@router.get("/{game_id}/hall-of-fame", response_model=list[SolvedConversationResponse])
async def get_hall_of_fame(
    game_id: str,
    db: AsyncSession = Depends(get_db),
):
    """List all solved conversations for a game (Hall of Fame), visible to everyone.

    For password-lock games: returns solved conversations ordered by solved_at.
    For mood-based games (e.g. sad_robot): returns top 20 conversations with a
    final_mood, ordered by best mood first.
    """
    game = get_game(game_id)

    # Mood-based games: rank by final_mood (best mood first), limit 20
    if game and game.available_moods and not game.password:
        mood_order = {mood: idx for idx, mood in enumerate(game.available_moods)}

        result = await db.execute(
            select(Conversation)
            .where(
                Conversation.game_id == game_id,
                Conversation.final_mood.isnot(None),
            )
            .options(selectinload(Conversation.messages), selectinload(Conversation.user))
        )
        conversations = result.scalars().all()

        # Sort by mood rank descending (best mood = highest index in available_moods)
        conversations = sorted(
            conversations,
            key=lambda c: mood_order.get(c.final_mood, -1),
            reverse=True,
        )[:20]
    else:
        # Password-lock style: solved conversations ordered by solved_at
        result = await db.execute(
            select(Conversation)
            .where(
                Conversation.game_id == game_id,
                Conversation.solved_at.isnot(None),
            )
            .options(selectinload(Conversation.messages), selectinload(Conversation.user))
            .order_by(Conversation.solved_at.asc())
        )
        conversations = result.scalars().all()

    return [
        SolvedConversationResponse(
            id=c.id,
            title=c.title,
            username=c.user.username,
            solved_at=c.solved_at,
            created_at=c.created_at,
            final_mood=c.final_mood,
            messages=[
                MessageResponse(
                    id=m.id,
                    role=m.role,
                    content=m.content,
                    model=m.model,
                    prompt_tokens=m.prompt_tokens,
                    completion_tokens=m.completion_tokens,
                    created_at=m.created_at,
                )
                for m in c.messages
            ],
        )
        for c in conversations
    ]
