from fastapi import APIRouter, Query

from app.games.registry import list_games
from app.schemas.chat import GameResponse

router = APIRouter(prefix="/api/games", tags=["games"])


@router.get("", response_model=list[GameResponse])
async def get_games(language: str = Query(default="en")):
    """List all available games, with descriptions in the requested language."""
    games = list_games()
    return [
        GameResponse(
            id=g.id,
            name=g.name,
            description=g.get_description(language),
            initial_mood=g.initial_mood,
            initial_message=g.get_initial_message(language),
        )
        for g in games
    ]
