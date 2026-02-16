from abc import ABC, abstractmethod
from typing import TypeVar, Generic, List, Optional, Tuple

# T = Model type, C = Create DTO, U = Update DTO, P = Patch DTO, R = Response DTO
T = TypeVar('T')  # Model
C = TypeVar('C')  # Create DTO
U = TypeVar('U')  # Update/Replace DTO
P = TypeVar('P')  # Patch DTO
R = TypeVar('R')  # Response DTO


class BaseService(ABC, Generic[T, C, U, P, R]):
    """Base service interface with business logic operations"""

    @abstractmethod
    def create(self, dto: C) -> R:
        """Create a single entity from DTO"""
        pass

    @abstractmethod
    def create_all(self, dtos: List[C]) -> List[R]:
        """Create multiple entities from DTOs"""
        pass

    @abstractmethod
    def update(self, entity_id: int, dto: U) -> R:
        """Full update (PUT) of entity"""
        pass

    @abstractmethod
    def patch(self, entity_id: int, dto: P) -> R:
        """Partial update (PATCH) of entity"""
        pass

    @abstractmethod
    def delete(self, entity_id: int) -> bool:
        """Delete entity by ID"""
        pass

    @abstractmethod
    def delete_all(self, entity_ids: List[int]) -> bool:
        """Delete multiple entities"""
        pass

    @abstractmethod
    def get_by_id(self, entity_id: int) -> Optional[R]:
        """Get entity by ID as DTO"""
        pass

    @abstractmethod
    def get_all(self) -> List[R]:
        """Get all entities as DTOs"""
        pass

    @abstractmethod
    def get_all_by_pagination(self, limit: int, offset: int) -> Tuple[List[T], int]:
        pass
