"""Game registry — central lookup for all game definitions."""

from dataclasses import dataclass, field

from app.games.sad_robot import (
    GAME_ID as DR_ID,
    GAME_NAME as DR_NAME,
    GAME_DESCRIPTION as DR_DESC,
    SYSTEM_PROMPT as DR_PROMPT,
    INITIAL_MOOD as DR_MOOD,
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


@dataclass
class GameDefinition:
    id: str
    name: str
    description: str
    system_prompt: str
    initial_mood: str
    available_moods: list[str] = field(default_factory=list)
    initial_message: str | None = None


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
}


def get_game(game_id: str) -> GameDefinition | None:
    """Return a game definition by id, or None if not found."""
    return _GAMES.get(game_id)


def list_games() -> list[GameDefinition]:
    """Return all registered games."""
    return list(_GAMES.values())
