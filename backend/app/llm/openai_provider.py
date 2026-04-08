from typing import AsyncGenerator

from openai import AsyncOpenAI

from app.config import settings
from app.llm.base import LLMProvider, LLMMessage, LLMResponse


class OpenAIProvider(LLMProvider):
    """OpenAI LLM provider implementation."""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.default_model = settings.openai_model

    async def chat_completion(
        self,
        messages: list[LLMMessage],
        model: str | None = None,
    ) -> LLMResponse:
        response = await self.client.chat.completions.create(
            model=model or self.default_model,
            messages=[{"role": m.role, "content": m.content} for m in messages],
            stream=False,
        )

        choice = response.choices[0]
        usage = response.usage

        return LLMResponse(
            content=choice.message.content or "",
            model=response.model,
            prompt_tokens=usage.prompt_tokens if usage else None,
            completion_tokens=usage.completion_tokens if usage else None,
        )

    async def chat_completion_stream(
        self,
        messages: list[LLMMessage],
        model: str | None = None,
    ) -> AsyncGenerator[str, None]:
        stream = await self.client.chat.completions.create(
            model=model or self.default_model,
            messages=[{"role": m.role, "content": m.content} for m in messages],
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    def get_default_model(self) -> str:
        return self.default_model
