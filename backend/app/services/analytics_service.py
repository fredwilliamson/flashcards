from abc import ABC, abstractmethod
from typing import Optional
from sqlalchemy.orm import Session
from ..schemas.analytics import (
    UserProgressStats,
    UserDeckCardsResponse,
    DeckAnalyticsStats,
)


class AnalyticsService(ABC):
    """Analytics service interface"""
    
    @abstractmethod
    def get_user_progress(self, user_id: int) -> Optional[UserProgressStats]:
        """
        Get user progress across all decks.
        
        Args:
            user_id: ID of the user
            
        Returns:
            UserProgressStats with progress data, or None if user not found
        """
        pass
    
    @abstractmethod
    def get_user_deck_cards(self, user_id: int, deck_id: int, limit: int = 50, offset: int = 0) -> Optional[UserDeckCardsResponse]:
        """
        Get user progress on individual cards within a deck.
        
        Args:
            user_id: ID of the user
            deck_id: ID of the deck
            limit: Maximum number of cards to return (default: 50)
            offset: Number of cards to skip (default: 0)
            
        Returns:
            UserDeckCardsResponse with card-level progress, or None if user/deck not found
        """
        pass
    
    @abstractmethod
    def get_deck_analytics(self, deck_id: int) -> Optional[DeckAnalyticsStats]:
        """
        Get analytics for a specific deck.
        
        Args:
            deck_id: ID of the deck
            
        Returns:
            DeckAnalyticsStats with deck analytics, or None if deck not found
        """
        pass
