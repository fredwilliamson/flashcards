from sqlalchemy import Column, String, Text, Boolean
from sqlalchemy.orm import relationship
from .base_entity import BaseEntity


class Deck(BaseEntity):
    __tablename__ = "decks"
    
    name = Column(String, nullable=False)
    description = Column(Text)
    is_public = Column(Boolean, default=False)
    
    # Relationships
    creator = relationship("User", back_populates="decks", foreign_keys="Deck.creator_id")
    cards = relationship("Card", back_populates="deck", foreign_keys="Card.deck_id", cascade="all, delete-orphan")

