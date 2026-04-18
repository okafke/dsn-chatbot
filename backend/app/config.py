from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # Application
    app_name: str = "DSN Chatbot"
    app_env: str = "development"
    app_version: str = "0.2.0"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://chatbot:chatbot@db:5432/chatbot"

    # JWT Auth
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7

    # LLM
    llm_provider: str = "openai"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    available_models: str = ""  # Comma-separated list of models available for selection

    @property
    def available_models_list(self) -> list[str]:
        """Return list of available models. Falls back to the default model if empty."""
        if self.available_models.strip():
            return [m.strip() for m in self.available_models.split(",") if m.strip()]
        return [self.openai_model]

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
