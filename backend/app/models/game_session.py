from sqlalchemy import Column, BigInteger, String, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from .base_entity import BaseEntity
import enum


class GameSessionStatus(str, enum.Enum):
    """Status of a game session"""
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class GameSession(BaseEntity):
    __tablename__ = "game_sessions"
    
    user_id = Column(BigInteger, ForeignKey("flashcard.users.id"), nullable=False)
    deck_id = Column(BigInteger, ForeignKey("flashcard.decks.id"), nullable=False)
    status = Column(Enum(GameSessionStatus), nullable=False, default=GameSessionStatus.ACTIVE)
    remaining_cards = Column(ARRAY(BigInteger), nullable=False, default=list)  # Array of card IDs
    success_cards = Column(ARRAY(BigInteger), nullable=False, default=list)    # Array of card IDs
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    deck = relationship("Deck", foreign_keys=[deck_id])

