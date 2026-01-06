from typing import List
from sqlalchemy.orm import Session
from ..card_service import CardService
from .base_service_impl import BaseServiceImpl
from ...repositories.card_repository import CardRepository
from ...models.card import Card
from ...schemas.card import CardCreate, CardReplace, CardPatch, CardResponse


class CardServiceImpl(BaseServiceImpl[Card, CardCreate, CardReplace, CardPatch, CardResponse], CardService):
    """Card service implementation"""
    
    def __init__(self, db: Session, repository: CardRepository):
        super().__init__(db, repository, Card, CardResponse)
        self.repository: CardRepository = repository  # Type hint for IDE
    
    def get_by_deck_id(self, deck_id: int) -> List[CardResponse]:
        """Get all cards by deck"""
        cards = self.repository.find_by_deck_id(deck_id)
        return [self._to_response(card) for card in cards]




