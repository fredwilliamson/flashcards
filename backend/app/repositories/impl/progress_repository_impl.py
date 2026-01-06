from typing import List
from sqlalchemy.orm import Session
from ..progress_repository import ProgressRepository
from .base_repository_impl import BaseRepositoryImpl
from ...models.progress import UserProgress


class ProgressRepositoryImpl(BaseRepositoryImpl[UserProgress], ProgressRepository):
    """User progress repository implementation"""
    
    def __init__(self, db: Session):
        super().__init__(db, UserProgress)
    
    def find_by_user_id(self, user_id: int) -> List[UserProgress]:
        """Find all progress records by user ID"""
        return self.db.query(UserProgress).filter(UserProgress.user_id == user_id).all()
    
    def find_by_deck_id(self, deck_id: int) -> List[UserProgress]:
        """Find all progress records by deck ID"""
        return self.db.query(UserProgress).filter(UserProgress.deck_id == deck_id).all()
    
    def find_by_card_id(self, card_id: int) -> List[UserProgress]:
        """Find all progress records by card ID"""
        return self.db.query(UserProgress).filter(UserProgress.card_id == card_id).all()
    
    def find_by_user_and_deck(self, user_id: int, deck_id: int) -> List[UserProgress]:
        """Find progress records by user and deck"""
        return self.db.query(UserProgress).filter(
            UserProgress.user_id == user_id,
            UserProgress.deck_id == deck_id
        ).all()




