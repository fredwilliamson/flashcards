from typing import Optional, List

from sqlalchemy.orm import Session, joinedload, selectinload

from .base_repository_impl import BaseRepositoryImpl
from ..user_repository import UserRepository
from ...models import Deck
from ...models.user import User


class UserRepositoryImpl(BaseRepositoryImpl[User], UserRepository):
    """User repository implementation"""

    def __init__(self, db: Session):
        super().__init__(db, User)

    def find_by_username(self, username: str) -> Optional[User]:
        """Find user by username"""
        return self.db.query(User).filter(User.username == username).first()

    def find_by_ids_with_decks(self, entity_ids: List[int]) -> List[User]:
        """Find users by IDs with their decks and their cards"""
        return (
            self.db.query(User)
            .options(
                selectinload(User.decks).selectinload(Deck.cards)
            )
            .filter(User.id.in_(entity_ids))
            .all()
        )
