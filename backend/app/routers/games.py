from fastapi import APIRouter

from app.games.registry import list_games
from app.schemas.chat import GameResponse

router = APIRouter(prefix="/api/games", tags=["games"])


@router.get("", response_model=list[GameResponse])
async def get_games():
    """List all available games."""
    games = list_games()
    return [
        GameResponse(
            id=g.id,
            name=g.name,
            description=g.description,
            initial_mood=g.initial_mood,
            initial_message=g.initial_message,
        )
        for g in games
    ]
