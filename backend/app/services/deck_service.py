from abc import abstractmethod
from typing import List
from .base_service import BaseService
from ..models.deck import Deck
from ..schemas.deck import DeckCreate, DeckReplace, DeckPatch, DeckResponse


class DeckService(BaseService[Deck, DeckCreate, DeckReplace, DeckPatch, DeckResponse]):
    """Deck service interface"""
    
    @abstractmethod
    def get_by_creator_id(self, creator_id: int) -> List[DeckResponse]:
        """Get all decks by creator"""
        pass
    
    @abstractmethod
    def get_public_decks(self) -> List[DeckResponse]:
        """Get all public decks"""
        pass




