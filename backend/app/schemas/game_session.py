from pydantic import BaseModel
from typing import Optional
from .base_schema import BaseSchema


class GameSessionStart(BaseModel):
    """Schema for starting a game session"""
    deck_id: int


class GameSessionResponse(BaseSchema):
    """Schema for game session response"""
    user_id: int
    deck_id: int
    status: str
    remaining_count: int
    success_count: int
    completion_percentage: float


class NextCardResponse(BaseModel):
    """Schema for next card in game"""
    card_id: int
    question: str
    hint: Optional[str] = None
    remaining_count: int


class AnswerSubmit(BaseModel):
    """Schema for submitting an answer"""
    card_id: int
    answer: str
    response_time_seconds: Optional[float] = None


class AnswerResponse(BaseModel):
    """Schema for answer validation response"""
    is_correct: bool
    message: str
    expected_keywords: list[str]
    remaining_count: int
    success_count: int


class SessionStatsResponse(BaseModel):
    """Schema for session statistics"""
    session_id: int
    status: str
    total_cards: int
    remaining_count: int
    success_count: int
    completion_percentage: float


