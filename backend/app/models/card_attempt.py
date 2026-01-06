from sqlalchemy import Column, BigInteger, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from .base_entity import BaseEntity


class CardAttempt(BaseEntity):
    """Stores individual card attempts for analytics"""
    __tablename__ = "card_attempts"
    
    session_id = Column(BigInteger, ForeignKey("flashcard.game_sessions.id"), nullable=False, index=True)
    card_id = Column(BigInteger, ForeignKey("flashcard.cards.id", ondelete='CASCADE'), nullable=False, index=True)
    user_id = Column(BigInteger, ForeignKey("flashcard.users.id"), nullable=False, index=True)
    is_correct = Column(Boolean, nullable=False)
    response_time_seconds = Column(Float, nullable=True)
    
    # Relationships
    session = relationship("GameSession", foreign_keys=[session_id])
    card = relationship("Card", foreign_keys=[card_id])
    user = relationship("User", foreign_keys=[user_id])



