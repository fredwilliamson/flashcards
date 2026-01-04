from abc import abstractmethod
from typing import Optional, List
from .base_repository import BaseRepository
from ..models.user import User


class UserRepository(BaseRepository[User]):
    """User repository interface"""
    
    @abstractmethod
    def find_by_username(self, username: str) -> Optional[User]:
        """Find user by username"""
        pass

    @abstractmethod
    def find_by_ids_with_decks(self, entity_ids: List[int]) -> List[User]:
        pass