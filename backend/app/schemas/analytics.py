from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class UserDeckProgress(BaseModel):
    deck_id: int
    deck_name: str
    total_cards: int
    mastered_cards: int
    progress_percentage: float
    success_rate: float
    last_activity: Optional[datetime]

    class Config:
        from_attributes = True


class UserProgressStats(BaseModel):
    user_id: int
    username: str
    total_cards_attempted: int
    cards_mastered: int
    avg_success_rate: float
    consecutive_success_count: int
    decks_progress: List[UserDeckProgress]
    struggling_decks: List[UserDeckProgress]

    class Config:
        from_attributes = True


class UserDeckCard(BaseModel):
    card_id: int
    question: str
    answer: str
    status: str  # 'new', 'learning', 'review', 'mastered'
    attempts: int
    success_rate: float
    last_seen: Optional[datetime]
    next_review: Optional[datetime]
    consecutive_success_count: int

    class Config:
        from_attributes = True


class UserDeckCardsResponse(BaseModel):
    user_id: int
    username: str
    deck_id: int
    deck_name: str
    cards: List[UserDeckCard]
    mastered_count: int
    total_count: int
    avg_success_rate: float
    last_activity: Optional[datetime]

    class Config:
        from_attributes = True


class DeckUserProgress(BaseModel):
    user_id: int
    username: str
    mastered_cards: int
    total_cards: int
    progress_percentage: float
    success_rate: float
    last_activity: Optional[datetime]

    class Config:
        from_attributes = True


class CardDifficulty(BaseModel):
    card_id: int
    question: str
    attempts: int
    success_rate: float
    avg_time_seconds: Optional[float]

    class Config:
        from_attributes = True


class DeckAnalyticsStats(BaseModel):
    deck_id: int
    deck_name: str
    total_users: int
    avg_mastery_rate: float
    avg_success_rate: float
    difficult_cards_count: int
    users_progress: List[DeckUserProgress]
    difficult_cards: List[CardDifficulty]

    class Config:
        from_attributes = True

