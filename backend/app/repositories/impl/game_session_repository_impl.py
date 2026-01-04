from typing import List, Optional, Set
from sqlalchemy.orm import Session
from ..game_session_repository import GameSessionRepository
from .base_repository_impl import BaseRepositoryImpl
from ...models import Deck, Card
from ...models.game_session import GameSession, GameSessionStatus


class GameSessionRepositoryImpl(BaseRepositoryImpl[GameSession], GameSessionRepository):
    """Game session repository implementation"""

    def __init__(self, db: Session):
        super().__init__(db, GameSession)

    def find_by_user_id(self, user_id: int) -> List[GameSession]:
        """Find all game sessions by user ID"""
        return self.db.query(GameSession).filter(GameSession.user_id == user_id).all()

    def find_by_user_and_status(self, user_id: int, status: GameSessionStatus) -> List[GameSession]:
        """Find game sessions by user ID and status"""
        return self.db.query(GameSession).filter(
            GameSession.user_id == user_id,
            GameSession.status == status
        ).all()

    def find_active_by_user_and_deck(self, user_id: int, deck_id: int) -> Optional[GameSession]:
        """Find active game session by user and deck"""
        return self.db.query(GameSession).filter(
            GameSession.user_id == user_id,
            GameSession.deck_id == deck_id,
            GameSession.status == GameSessionStatus.ACTIVE
        ).first()

    def get_unique_decks_for_user(self, user_id: int) -> Set[Deck]:
        """Get unique decks for a user"""
        result = (
            self.db.query(Deck)
            .join(GameSession, GameSession.deck_id == Deck.id)
            .join(Card, Card.deck_id == Deck.id)
            .filter(GameSession.user_id == user_id)
            .distinct()
            .all()
        )
        return set(result)
