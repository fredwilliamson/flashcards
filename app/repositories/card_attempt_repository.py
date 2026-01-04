from abc import abstractmethod
from typing import List, Tuple
from .base_repository import BaseRepository
from ..models import Deck
from ..models.card_attempt import CardAttempt


class CardAttemptRepository(BaseRepository[CardAttempt]):
    """Card attempt repository interface"""
    
    @abstractmethod
    def find_by_user_id(self, user_id: int) -> List[CardAttempt]:
        """Find all attempts for a user"""
        pass
    
    @abstractmethod
    def find_by_session_id(self, session_id: int) -> List[CardAttempt]:
        """Find all attempts for a session"""
        pass
    
    @abstractmethod
    def find_by_user_and_decks(self, user_id: int, deck_ids: List[int]) -> List[Tuple[Deck, CardAttempt]]:
        """Find all attempts for a user on specific decks"""
        pass

    @abstractmethod
    def find_by_user_and_deck(self, user_id: int, deck_id: int) -> List[CardAttempt]:
        """Find all attempts for a user on a specific deck"""
        pass

    @abstractmethod
    def find_by_deck(self, deck_id: int) -> List[CardAttempt]:
        """Find all attempts for a deck"""
        pass
