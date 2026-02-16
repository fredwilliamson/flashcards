from abc import ABC, abstractmethod
from typing import TypeVar, Generic, List, Optional, Tuple

T = TypeVar('T')


class BaseRepository(ABC, Generic[T]):
    """Base repository interface with CRUD operations"""
    
    @abstractmethod
    def create(self, entity: T) -> T:
        """Create a single entity"""
        pass
    
    @abstractmethod
    def create_all(self, entities: List[T]) -> List[T]:
        """Create multiple entities"""
        pass
    
    @abstractmethod
    def update(self, entity: T) -> T:
        """Update a single entity"""
        pass
    
    @abstractmethod
    def update_all(self, entities: List[T]) -> List[T]:
        """Update multiple entities"""
        pass
    
    @abstractmethod
    def delete(self, entity_id: int) -> bool:
        """Delete a single entity by ID"""
        pass
    
    @abstractmethod
    def delete_all(self, entity_ids: List[int]) -> bool:
        """Delete multiple entities by IDs"""
        pass
    
    @abstractmethod
    def find_by_id(self, entity_id: int) -> Optional[T]:
        """Find entity by ID"""
        pass
    
    @abstractmethod
    def find_by_ids(self, entity_ids: List[int]) -> List[T]:
        """Find multiple entities by IDs"""
        pass
    
    @abstractmethod
    def find_all(self) -> List[T]:
        """Find all entities"""
        pass
    
    @abstractmethod
    def find_by_creator_id(self, creator_id: int) -> List[T]:
        """Find all entities by creator ID"""
        pass

    @abstractmethod
    def find_paginated(self, offset: int = 0, limit: int = 20) -> Tuple[List[T], int]:
        """Find entities with pagination. Returns (items, total_count)."""
        pass