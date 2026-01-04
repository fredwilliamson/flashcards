from abc import abstractmethod
from typing import List, Optional, Set
from .base_repository import BaseRepository
from ..models import Deck
from ..models.game_session import GameSession, GameSessionStatus


class GameSessionRepository(BaseRepository[GameSession]):
    """Game session repository interface"""
    
    @abstractmethod
    def find_by_user_id(self, user_id: int) -> List[GameSession]:
        """Find all game sessions by user ID"""
        pass
    
    @abstractmethod
    def find_by_user_and_status(self, user_id: int, status: GameSessionStatus) -> List[GameSession]:
        """Find game sessions by user ID and status"""
        pass
    
    @abstractmethod
    def find_active_by_user_and_deck(self, user_id: int, deck_id: int) -> Optional[GameSession]:
        """Find active game session by user and deck"""
        pass
    
    @abstractmethod
    def get_unique_decks_for_user(self, user_id: int) -> Set[Deck]:
        """Get unique decks for a user"""
        pass


