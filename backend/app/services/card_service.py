from abc import abstractmethod
from typing import List
from .base_service import BaseService
from ..models.card import Card
from ..schemas.card import CardCreate, CardReplace, CardPatch, CardResponse


class CardService(BaseService[Card, CardCreate, CardReplace, CardPatch, CardResponse]):
    """Card service interface"""
    
    @abstractmethod
    def get_by_deck_id(self, deck_id: int) -> List[CardResponse]:
        """Get all cards by deck"""
        pass




