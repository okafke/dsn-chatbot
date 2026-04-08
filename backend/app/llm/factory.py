from app.llm.base import LLMProvider
from app.llm.openai_provider import OpenAIProvider
from app.config import settings

_providers: dict[str, type[LLMProvider]] = {
    "openai": OpenAIProvider,
}

_instance: LLMProvider | None = None


def get_llm_provider() -> LLMProvider:
    """Get or create the configured LLM provider singleton."""
    global _instance
    if _instance is None:
        provider_name = settings.llm_provider.lower()
        provider_class = _providers.get(provider_name)
        if provider_class is None:
            available = ", ".join(_providers.keys())
            raise ValueError(
                f"Unknown LLM provider: '{provider_name}'. Available: {available}"
            )
        _instance = provider_class()
    return _instance


def register_provider(name: str, provider_class: type[LLMProvider]) -> None:
    """Register a new LLM provider. Use this to add custom providers."""
    _providers[name.lower()] = provider_class
