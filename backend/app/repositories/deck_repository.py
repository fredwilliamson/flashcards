from abc import abstractmethod
from typing import List
from .base_repository import BaseRepository
from ..models.deck import Deck


class DeckRepository(BaseRepository[Deck]):
    """Deck repository interface"""
    
    @abstractmethod
    def find_public_decks(self) -> List[Deck]:
        """Find all public decks"""
        pass

    @abstractmethod
    def find_decks_with_cards(self, deck_id: int) -> List[Deck]:
        pass