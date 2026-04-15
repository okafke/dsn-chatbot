from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.games.registry import list_games, get_game
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


class PasswordCheckRequest(BaseModel):
    game_id: str
    password: str


class PasswordCheckResponse(BaseModel):
    correct: bool


@router.post("/check-password", response_model=PasswordCheckResponse)
async def check_password(request: PasswordCheckRequest):
    """Check if the submitted password matches the game's secret password."""
    game = get_game(request.game_id)
    if not game or not game.password:
        return PasswordCheckResponse(correct=False)

    correct = request.password.strip().upper() == game.password.strip().upper()
    return PasswordCheckResponse(correct=correct)
