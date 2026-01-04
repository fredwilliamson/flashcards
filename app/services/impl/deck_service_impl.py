from typing import List
from sqlalchemy.orm import Session
from ..deck_service import DeckService
from .base_service_impl import BaseServiceImpl
from ...repositories.deck_repository import DeckRepository
from ...models.deck import Deck
from ...schemas.deck import DeckCreate, DeckReplace, DeckPatch, DeckResponse


class DeckServiceImpl(BaseServiceImpl[Deck, DeckCreate, DeckReplace, DeckPatch, DeckResponse], DeckService):
    """Deck service implementation"""
    
    def __init__(self, db: Session, repository: DeckRepository):
        super().__init__(db, repository, Deck, DeckResponse)
        self.repository: DeckRepository = repository  # Type hint for IDE
    
    def get_by_creator_id(self, creator_id: int) -> List[DeckResponse]:
        """Get all decks by creator"""
        decks = self.repository.find_by_creator_id(creator_id)
        return [self._to_response(deck) for deck in decks]
    
    def get_public_decks(self) -> List[DeckResponse]:
        """Get all public decks"""
        decks = self.repository.find_public_decks()
        return [self._to_response(deck) for deck in decks]
