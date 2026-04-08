from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import AsyncGenerator


@dataclass
class LLMMessage:
    role: str  # "system", "user", "assistant"
    content: str


@dataclass
class LLMResponse:
    content: str
    model: str
    prompt_tokens: int | None = None
    completion_tokens: int | None = None


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    async def chat_completion(
        self,
        messages: list[LLMMessage],
        model: str | None = None,
    ) -> LLMResponse:
        """Send a chat completion request and return the full response."""
        ...

    @abstractmethod
    async def chat_completion_stream(
        self,
        messages: list[LLMMessage],
        model: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """Send a chat completion request and yield token chunks as they arrive."""
        ...

    @abstractmethod
    def get_default_model(self) -> str:
        """Return the default model for this provider."""
        ...
