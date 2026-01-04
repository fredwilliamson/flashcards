from fastapi import APIRouter, Depends, HTTPException
from ..auth.dependencies import get_current_active_user
from ..models.user import User
from ..services.impl.analytics_service_impl import AnalyticsServiceImpl
from ..dependencies import get_analytics_service
from ..schemas.analytics import (
    UserProgressStats,
    UserDeckCardsResponse,
    DeckAnalyticsStats,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/users/{user_id}/progress", response_model=UserProgressStats)
def get_user_progress(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    service: AnalyticsServiceImpl = Depends(get_analytics_service),
):
    """Get user progress across all decks (User can access their own, Admin can access any)"""
    # Users can only access their own data, admins can access any user's data
    if not current_user.is_admin and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="You can only access your own progress")

    progress = service.get_user_progress(user_id)
    if not progress:
        raise HTTPException(status_code=404, detail="User not found")

    return progress


@router.get("/users/{user_id}/decks/{deck_id}/cards", response_model=UserDeckCardsResponse)
def get_user_deck_cards(
    user_id: int,
    deck_id: int,
    current_user: User = Depends(get_current_active_user),
    service: AnalyticsServiceImpl = Depends(get_analytics_service),
):
    """Get user progress on individual cards within a deck (User can access their own, Admin can access any)"""
    # Users can only access their own data, admins can access any user's data
    if not current_user.is_admin and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="You can only access your own progress")

    cards = service.get_user_deck_cards(user_id, deck_id)
    if not cards:
        raise HTTPException(status_code=404, detail="User or deck not found")

    return cards


@router.get("/decks/{deck_id}/analytics", response_model=DeckAnalyticsStats)
def get_deck_analytics(
    deck_id: int,
    current_user: User = Depends(get_current_active_user),
    service: AnalyticsServiceImpl = Depends(get_analytics_service),
):
    """Get analytics for a specific deck (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    analytics = service.get_deck_analytics(deck_id)
    if not analytics:
        raise HTTPException(status_code=404, detail="Deck not found")

    return analytics

