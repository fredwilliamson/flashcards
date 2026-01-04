from sqlalchemy import Column, BigInteger, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base_entity import BaseEntity


class Card(BaseEntity):
    __tablename__ = "cards"
    
    deck_id = Column(BigInteger, ForeignKey("flashcard.decks.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    keywords = Column(JSON, nullable=False)  # List of keywords for validation
    hint = Column(Text, nullable=True)
    
    # Relationships
    deck = relationship("Deck", back_populates="cards", foreign_keys="Card.deck_id")

