from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas.game_session import (
    GameSessionStart,
    GameSessionResponse,
    NextCardResponse,
    AnswerSubmit,
    AnswerResponse,
    SessionStatsResponse
)
from ..services.impl import GamingSessionServiceImpl
from ..dependencies import get_gaming_session_service
from ..auth.dependencies import get_current_active_user
from ..models.user import User

router = APIRouter(dependencies=[Depends(get_current_active_user)])


@router.post("/sessions", response_model=GameSessionResponse, status_code=201)
def start_session(
    data: GameSessionStart,
    current_user: User = Depends(get_current_active_user),
    service: GamingSessionServiceImpl = Depends(get_gaming_session_service)
):
    """
    Start a new game session with a deck.
    
    Initializes a session with all cards from the deck in random order.
    """
    return service.start_session(current_user.id, data)


@router.get("/sessions/{session_id}/next-card", response_model=NextCardResponse)
def get_next_card(
    session_id: int,
    current_user: User = Depends(get_current_active_user),
    service: GamingSessionServiceImpl = Depends(get_gaming_session_service)
):
    """
    Get the next card from the session.
    
    Returns the first card from remaining_cards pile.
    Returns 404 if no cards remaining.
    """
    card = service.get_next_card(session_id, current_user.id)
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No cards remaining in session"
        )
    return card


@router.post("/sessions/{session_id}/answer", response_model=AnswerResponse)
def submit_answer(
    session_id: int,
    data: AnswerSubmit,
    current_user: User = Depends(get_current_active_user),
    service: GamingSessionServiceImpl = Depends(get_gaming_session_service)
):
    """
    Submit an answer for validation.
    
    - If correct: card moves to success pile
    - If incorrect: card returns to random position in remaining pile
    """
    return service.submit_answer(session_id, current_user.id, data)


@router.get("/sessions/{session_id}", response_model=SessionStatsResponse)
def get_session_stats(
    session_id: int,
    current_user: User = Depends(get_current_active_user),
    service: GamingSessionServiceImpl = Depends(get_gaming_session_service)
):
    """Get current session statistics"""
    return service.get_session_stats(session_id, current_user.id)


@router.post("/sessions/{session_id}/complete", response_model=SessionStatsResponse)
def complete_session(
    session_id: int,
    current_user: User = Depends(get_current_active_user),
    service: GamingSessionServiceImpl = Depends(get_gaming_session_service)
):
    """
    Mark session as completed.
    
    Returns final statistics.
    """
    return service.complete_session(session_id, current_user.id)

