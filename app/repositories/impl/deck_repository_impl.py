from typing import List
from sqlalchemy.orm import Session, joinedload
from ..deck_repository import DeckRepository
from .base_repository_impl import BaseRepositoryImpl
from ...models.deck import Deck


class DeckRepositoryImpl(BaseRepositoryImpl[Deck], DeckRepository):
    """Deck repository implementation"""

    def __init__(self, db: Session):
        super().__init__(db, Deck)

    def find_public_decks(self) -> List[Deck]:
        """Find all public decks"""
        return self.db.query(Deck).filter(Deck.is_public == True).all()

    def find_decks_with_cards(self, deck_id: int) -> List[Deck]:
        return self.db.query(Deck).options(joinedload(Deck.cards)).filter(Deck.id == deck_id).all()
