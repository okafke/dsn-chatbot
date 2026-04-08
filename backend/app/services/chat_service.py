import json
import uuid
from typing import AsyncGenerator

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.llm.base import LLMMessage
from app.llm.factory import get_llm_provider
from app.models.conversation import Conversation
from app.models.message import Message


SYSTEM_PROMPT = "You are a helpful AI assistant. Be concise and clear in your responses."


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
    db: AsyncSession, conversation_id: uuid.UUID
) -> list[LLMMessage]:
    """Load conversation history as LLM messages."""
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    messages = result.scalars().all()

    llm_messages = [LLMMessage(role="system", content=SYSTEM_PROMPT)]
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
) -> AsyncGenerator[str, None]:
    """
    Process a chat message and stream the response as SSE events.

    Yields SSE-formatted strings:
    - data: {"type": "conversation", "id": "..."}\n\n  (first event)
    - data: {"type": "token", "content": "..."}\n\n    (token chunks)
    - data: {"type": "done"}\n\n                         (completion)
    - data: {"type": "error", "message": "..."}\n\n     (on error)
    """
    provider = get_llm_provider()

    try:
        # Get or create conversation
        conversation = await get_or_create_conversation(db, user_id, conversation_id)

        # Send conversation ID to client
        yield f"data: {json.dumps({'type': 'conversation', 'id': str(conversation.id)})}\n\n"

        # Load conversation history
        llm_messages = await get_conversation_messages(db, conversation.id)

        # Save user message
        await save_message(db, conversation.id, "user", user_message)
        await db.commit()

        # Update title if this is the first message
        if len(llm_messages) <= 1:  # Only system prompt
            await update_conversation_title(db, conversation, user_message)
            await db.commit()

        # Add the new user message to the LLM context
        llm_messages.append(LLMMessage(role="user", content=user_message))

        # Stream the response
        full_response = ""
        async for token in provider.chat_completion_stream(llm_messages, model=model):
            full_response += token
            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

        # Save assistant message
        await save_message(
            db,
            conversation.id,
            "assistant",
            full_response,
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
