from typing import List, Tuple
from sqlalchemy.orm import Session
from ..card_attempt_repository import CardAttemptRepository
from ...models import Deck
from ...models.card_attempt import CardAttempt
from ...models.game_session import GameSession
from .base_repository_impl import BaseRepositoryImpl


class CardAttemptRepositoryImpl(BaseRepositoryImpl[CardAttempt], CardAttemptRepository):
    """Card attempt repository implementation"""

    def __init__(self, db: Session):
        super().__init__(db, CardAttempt)

    def find_by_user_id(self, user_id: int) -> List[CardAttempt]:
        """Find all attempts for a user"""
        return self.db.query(CardAttempt).filter(CardAttempt.user_id == user_id).all()

    def find_by_user_and_deck(self, user_id: int, deck_id: int) -> List[CardAttempt]:
        return (
            self.db.query(CardAttempt)
            .join(GameSession, CardAttempt.session_id == GameSession.id)
            .filter(
                CardAttempt.user_id == user_id,
                GameSession.deck_id == deck_id
            )
            .all()
        )

    def find_by_session_id(self, session_id: int) -> List[CardAttempt]:
        """Find all attempts for a session"""
        return self.db.query(CardAttempt).filter(CardAttempt.session_id == session_id).all()

    def find_by_user_and_decks(self, user_id: int, deck_ids: List[int]) -> List[Tuple[Deck, CardAttempt]]:
        """Find all attempts for a user on specific decks"""
        return (self.db.query(Deck, CardAttempt)
        .join(GameSession, CardAttempt.session_id == GameSession.id)
        .join(Deck, GameSession.deck_id == Deck.id)
        .filter(
            CardAttempt.user_id == user_id,
            Deck.id.in_(deck_ids),
        ))

    def find_by_deck(self, deck_id: int) -> List[CardAttempt]:
        """Find all attempts for a deck"""
        return (
            self.db.query(CardAttempt)
            .join(GameSession, CardAttempt.session_id == GameSession.id)
            .filter(GameSession.deck_id == deck_id)
            .all()
        )

