from typing import List
from sqlalchemy.orm import Session
from ..card_repository import CardRepository
from .base_repository_impl import BaseRepositoryImpl
from ...models.card import Card


class CardRepositoryImpl(BaseRepositoryImpl[Card], CardRepository):
    """Card repository implementation"""
    
    def __init__(self, db: Session):
        super().__init__(db, Card)
    
    def find_by_deck_id(self, deck_id: int) -> List[Card]:
        """Find all cards by deck ID"""
        return self.db.query(Card).filter(Card.deck_id == deck_id).all()




