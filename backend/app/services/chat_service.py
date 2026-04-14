import json
import logging
import re
import uuid
from typing import AsyncGenerator

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.games.registry import get_game
from app.llm.base import LLMMessage
from app.llm.factory import get_llm_provider
from app.models.conversation import Conversation
from app.models.message import Message


SYSTEM_PROMPT = "You are a helpful AI assistant. Be concise and clear in your responses."

_MOOD_PATTERN = re.compile(r"\$\[MOOD:(\w+)\]\s*$")
LOG = logging.getLogger(__name__)

def _parse_mood(text: str, available_moods: list[str] | None = None) -> tuple[str, str | None]:
    """Strip a trailing [MOOD:value] tag from *text*.

    Returns (cleaned_text, mood_value).  mood_value is ``None`` when no
    valid tag is found.
    """
    LOG.info(f"Checking {text} for mood pattern")
    match = _MOOD_PATTERN.search(text)
    if not match:
        LOG.error(f"Failed to find mood in {text}")
        return text, None

    mood = match.group(1)
    if available_moods and mood not in available_moods:
        LOG.error(f"{mood} not in ${available_moods}")
        return text, None

    cleaned = text[: match.start()].rstrip()
    LOG.info(f"Parsed mood {mood} from {text}")
    return cleaned, mood


async def get_or_create_conversation(
    db: AsyncSession,
    user_id: uuid.UUID,
    conversation_id: uuid.UUID | None = None,
) -> Conversation:
    """Get an existing conversation or create a new one."""
    if conversation_id:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
        )
        conversation = result.scalar_one_or_none()
        if conversation:
            return conversation

    # Create new conversation
    conversation = Conversation(user_id=user_id)
    db.add(conversation)
    await db.flush()
    await db.refresh(conversation)
    return conversation


async def get_conversation_messages(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    system_prompt: str = SYSTEM_PROMPT,
) -> list[LLMMessage]:
    """Load conversation history as LLM messages."""
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    messages = result.scalars().all()

    llm_messages = [LLMMessage(role="system", content=system_prompt)]
    for msg in messages:
        llm_messages.append(LLMMessage(role=msg.role, content=msg.content))

    return llm_messages


async def save_message(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    role: str,
    content: str,
    model: str | None = None,
    prompt_tokens: int | None = None,
    completion_tokens: int | None = None,
) -> Message:
    """Save a message to the database."""
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        model=model,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
    )
    db.add(message)
    await db.flush()
    await db.refresh(message)
    return message


async def update_conversation_title(
    db: AsyncSession, conversation: Conversation, first_message: str
) -> None:
    """Set conversation title from the first user message."""
    title = first_message[:100].strip()
    if len(first_message) > 100:
        title += "..."
    conversation.title = title
    await db.flush()


async def stream_chat_response(
    db: AsyncSession,
    user_id: uuid.UUID,
    user_message: str,
    conversation_id: uuid.UUID | None = None,
    model: str | None = None,
    game_id: str | None = None,
) -> AsyncGenerator[str, None]:
    """
    Process a chat message and stream the response as SSE events.

    Yields SSE-formatted strings:
    - data: {"type": "conversation", "id": "..."}\n\n  (first event)
    - data: {"type": "token", "content": "..."}\n\n    (token chunks)
    - data: {"type": "mood", "value": "..."}\n\n       (game mood, if applicable)
    - data: {"type": "done"}\n\n                         (completion)
    - data: {"type": "error", "message": "..."}\n\n     (on error)
    """
    provider = get_llm_provider()

    # Resolve game-specific settings
    game = get_game(game_id) if game_id else None
    system_prompt = game.system_prompt if game else SYSTEM_PROMPT

    try:
        # Get or create conversation
        conversation = await get_or_create_conversation(db, user_id, conversation_id)

        # Send conversation ID to client
        yield f"data: {json.dumps({'type': 'conversation', 'id': str(conversation.id)})}\n\n"

        # Load conversation history
        llm_messages = await get_conversation_messages(db, conversation.id, system_prompt)

        # Save user message
        await save_message(db, conversation.id, "user", user_message)
        await db.commit()

        # Update title if this is the first message
        if len(llm_messages) <= 1:  # Only system prompt
            await update_conversation_title(db, conversation, user_message)
            await db.commit()

        # Add the new user message to the LLM context
        llm_messages.append(LLMMessage(role="user", content=user_message))
        LOG.info(llm_messages)

        # Stream the response
        full_response = ""
        async for token in provider.chat_completion_stream(llm_messages, model=model):
            # TODO: Should probably wait for $ character and not send those tokens
            full_response += token
            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

        # Parse mood tag if this is a game conversation
        cleaned_response = full_response
        mood_value: str | None = None
        if game:
            cleaned_response, mood_value = _parse_mood(
                full_response, game.available_moods
            )
            if mood_value:
                yield f"data: {json.dumps({'type': 'mood', 'value': mood_value})}\n\n"

        # Save assistant message (cleaned, without mood tag)
        await save_message(
            db,
            conversation.id,
            "assistant",
            cleaned_response,
            model=model or provider.get_default_model(),
        )
        await db.commit()

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"


async def get_user_conversations(
    db: AsyncSession, user_id: uuid.UUID
) -> list[Conversation]:
    """Get all conversations for a user, ordered by most recent."""
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    )
    return list(result.scalars().all())


async def get_conversation_detail(
    db: AsyncSession, user_id: uuid.UUID, conversation_id: uuid.UUID
) -> Conversation | None:
    """Get a conversation with all its messages."""
    result = await db.execute(
        select(Conversation)
        .where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
        .options(selectinload(Conversation.messages))
    )
    return result.scalar_one_or_none()
