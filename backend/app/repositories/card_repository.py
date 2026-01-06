from abc import abstractmethod
from typing import List
from .base_repository import BaseRepository
from ..models.card import Card


class CardRepository(BaseRepository[Card]):
    """Card repository interface"""
    
    @abstractmethod
    def find_by_deck_id(self, deck_id: int) -> List[Card]:
        """Find all cards by deck ID"""
        pass




