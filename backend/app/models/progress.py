from sqlalchemy import Column, BigInteger, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base_entity import BaseEntity


class UserProgress(BaseEntity):
    __tablename__ = "user_progress"
    
    user_id = Column(BigInteger, ForeignKey("flashcard.users.id"), nullable=False)
    deck_id = Column(BigInteger, ForeignKey("flashcard.decks.id"), nullable=False)
    card_id = Column(BigInteger, ForeignKey("flashcard.cards.id"), nullable=False)
    correct = Column(Boolean, nullable=False)
    answered_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="progress", foreign_keys="UserProgress.user_id")

