import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=32000)
    conversation_id: uuid.UUID | None = None
    model: str | None = None  # Override default model
    game_id: str | None = None  # Identifies which game is being played
    language: str | None = None  # Frontend UI language (e.g. "en", "de")


class MessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    model: str | None = None
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: uuid.UUID
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConversationDetailResponse(ConversationResponse):
    messages: list[MessageResponse] = []


class GameResponse(BaseModel):
    id: str
    name: str
    description: str
    initial_mood: str
    initial_message: str | None = None
