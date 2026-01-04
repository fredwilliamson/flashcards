from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class UserStatsResponse(BaseModel):
    """User statistics response for admin"""
    user_id: int
    username: str
    first_name: str
    last_name: str
    total_sessions: int
    active_sessions: int
    completed_sessions: int
    total_cards_attempted: int
    total_cards_success: int
    success_rate_percentage: float
    last_activity: Optional[datetime] = None


class DeckStatsResponse(BaseModel):
    """Deck statistics response for admin"""
    deck_id: int
    deck_name: str
    creator_id: int
    is_public: bool
    total_cards: int
    total_sessions: int
    unique_users: int
    average_success_rate: float


class GlobalStatsResponse(BaseModel):
    """Global statistics for admin dashboard"""
    total_users: int
    total_decks: int
    total_cards: int
    total_sessions: int
    active_sessions: int
    total_attempts: int
    global_success_rate: float


class SessionListItem(BaseModel):
    """Session item for admin list"""
    session_id: int
    user_id: int
    username: str
    deck_id: int
    deck_name: str
    status: str
    remaining_count: int
    success_count: int
    completion_percentage: float
    created_at: datetime


class CardDifficultyResponse(BaseModel):
    """Card difficulty statistics"""
    card_id: int
    question: str
    deck_id: int
    deck_name: str
    total_attempts: int
    success_count: int
    failure_count: int
    success_rate_percentage: float
    unique_users: int



