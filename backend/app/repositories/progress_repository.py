from abc import abstractmethod
from typing import List
from .base_repository import BaseRepository
from ..models.progress import UserProgress


class ProgressRepository(BaseRepository[UserProgress]):
    """User progress repository interface"""
    
    @abstractmethod
    def find_by_user_id(self, user_id: int) -> List[UserProgress]:
        """Find all progress records by user ID"""
        pass
    
    @abstractmethod
    def find_by_deck_id(self, deck_id: int) -> List[UserProgress]:
        """Find all progress records by deck ID"""
        pass
    
    @abstractmethod
    def find_by_card_id(self, card_id: int) -> List[UserProgress]:
        """Find all progress records by card ID"""
        pass
    
    @abstractmethod
    def find_by_user_and_deck(self, user_id: int, deck_id: int) -> List[UserProgress]:
        """Find progress records by user and deck"""
        pass




