"""Game registry — central lookup for all game definitions."""

from dataclasses import dataclass, field

from app.games.sad_robot import (
    GAME_ID as DR_ID,
    GAME_NAME as DR_NAME,
    GAME_DESCRIPTION as DR_DESC,
    SYSTEM_PROMPT as DR_PROMPT,
    INITIAL_MOOD as DR_MOOD,
    INITIAL_MESSAGE as DR_INITIAL_MESSAGE,
    AVAILABLE_MOODS as DR_MOODS,
)
from app.games.lazy_robot import (
    GAME_ID as LR_ID,
    GAME_NAME as LR_NAME,
    GAME_DESCRIPTION as LR_DESC,
    SYSTEM_PROMPT as LR_PROMPT,
    INITIAL_MOOD as LR_MOOD,
    AVAILABLE_MOODS as LR_MOODS,
    INITIAL_MESSAGE as LR_INITIAL_MSG,
)
from app.games.password_lock import (
    GAME_ID as PL_ID,
    GAME_NAME as PL_NAME,
    GAME_DESCRIPTION as PL_DESC,
    SYSTEM_PROMPT as PL_PROMPT,
    INITIAL_MOOD as PL_MOOD,
    AVAILABLE_MOODS as PL_MOODS,
    INITIAL_MESSAGE as PL_INITIAL_MSG,
    DEFAULT_PASSWORD as PL_PASSWORD,
)

DEFAULT_LANGUAGE = "en"


def _resolve(value: str | dict[str, str], language: str = DEFAULT_LANGUAGE) -> str:
    """Resolve a translatable value to a string for the given language."""
    if isinstance(value, str):
        return value
    return value.get(language, value.get(DEFAULT_LANGUAGE, next(iter(value.values()))))


@dataclass
class GameDefinition:
    id: str
    name: str
    description: str | dict[str, str]
    system_prompt: str
    initial_mood: str
    available_moods: list[str] = field(default_factory=list)
    initial_message: str | dict[str, str] | None = None
    password: str | None = None  # For password-lock style games

    def get_description(self, language: str = DEFAULT_LANGUAGE) -> str:
        return _resolve(self.description, language)

    def get_initial_message(self, language: str = DEFAULT_LANGUAGE) -> str | None:
        if self.initial_message is None:
            return None
        return _resolve(self.initial_message, language)


# ---------------------------------------------------------------------------
# Register all games here
# ---------------------------------------------------------------------------

_GAMES: dict[str, GameDefinition] = {
    DR_ID: GameDefinition(
        id=DR_ID,
        name=DR_NAME,
        description=DR_DESC,
        system_prompt=DR_PROMPT,
        initial_mood=DR_MOOD,
        available_moods=DR_MOODS,
        initial_message=DR_INITIAL_MESSAGE,
    ),
    LR_ID: GameDefinition(
        id=LR_ID,
        name=LR_NAME,
        description=LR_DESC,
        system_prompt=LR_PROMPT,
        initial_mood=LR_MOOD,
        available_moods=LR_MOODS,
        initial_message=LR_INITIAL_MSG,
    ),
    PL_ID: GameDefinition(
        id=PL_ID,
        name=PL_NAME,
        description=PL_DESC,
        system_prompt=PL_PROMPT,
        initial_mood=PL_MOOD,
        available_moods=PL_MOODS,
        initial_message=PL_INITIAL_MSG,
        password=PL_PASSWORD,
    ),
}


def get_game(game_id: str) -> GameDefinition | None:
    """Return a game definition by id, or None if not found."""
    return _GAMES.get(game_id)


def list_games() -> list[GameDefinition]:
    """Return all registered games."""
    return list(_GAMES.values())
