from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from .base_entity import BaseEntity


class User(BaseEntity):
    __tablename__ = "users"
    
    username = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    
    # Relationships
    decks = relationship("Deck", back_populates="creator", foreign_keys="Deck.creator_id")
    progress = relationship("UserProgress", back_populates="user", foreign_keys="UserProgress.user_id")

