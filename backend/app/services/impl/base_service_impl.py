from typing import TypeVar, Generic, List, Optional, Type
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ...repositories.base_repository import BaseRepository
from ...models.base_entity import BaseEntity
from ...infra import transactional

T = TypeVar('T', bound=BaseEntity)  # Model
C = TypeVar('C', bound=BaseModel)   # Create DTO
U = TypeVar('U', bound=BaseModel)   # Update/Replace DTO
P = TypeVar('P', bound=BaseModel)   # Patch DTO
R = TypeVar('R', bound=BaseModel)   # Response DTO


class BaseServiceImpl(Generic[T, C, U, P, R]):
    """Base service implementation with business logic
    
    Services manage transactions (via @transactional) and orchestrate repositories.
    No explicit commit/rollback here - handled by @transactional decorator.
    """
    
    def __init__(
        self,
        db: Session,
        repository: BaseRepository[T],
        model_class: Type[T],
        response_class: Type[R]
    ):
        self.db = db
        self.repository = repository
        self.model_class = model_class
        self.response_class = response_class
    
    @transactional
    def create(self, dto: C) -> R:
        """Create entity from DTO"""
        entity = self.model_class(**dto.model_dump(exclude_unset=True))
        created = self.repository.create(entity)
        self.db.flush()  # Get ID before commit
        self.db.refresh(created)
        return self._to_response(created)
    
    @transactional
    def create_all(self, dtos: List[C]) -> List[R]:
        """Create multiple entities"""
        entities = [self.model_class(**dto.model_dump(exclude_unset=True)) for dto in dtos]
        created = self.repository.create_all(entities)
        self.db.flush()
        for entity in created:
            self.db.refresh(entity)
        return [self._to_response(e) for e in created]
    
    @transactional
    def update(self, entity_id: int, dto: U) -> R:
        """Full update (PUT)"""
        entity = self.repository.find_by_id(entity_id)
        if not entity:
            raise ValueError(f"Entity with id {entity_id} not found")
        
        # Update all fields from DTO
        for key, value in dto.model_dump(exclude_unset=True).items():
            setattr(entity, key, value)
        
        updated = self.repository.update(entity)
        self.db.flush()
        self.db.refresh(updated)
        return self._to_response(updated)
    
    @transactional
    def patch(self, entity_id: int, dto: P) -> R:
        """Partial update (PATCH)"""
        entity = self.repository.find_by_id(entity_id)
        if not entity:
            raise ValueError(f"Entity with id {entity_id} not found")
        
        # Update only provided fields
        for key, value in dto.model_dump(exclude_unset=True).items():
            if value is not None:
                setattr(entity, key, value)
        
        updated = self.repository.update(entity)
        self.db.flush()
        self.db.refresh(updated)
        return self._to_response(updated)
    
    @transactional
    def delete(self, entity_id: int) -> bool:
        """Delete entity"""
        return self.repository.delete(entity_id)
    
    @transactional
    def delete_all(self, entity_ids: List[int]) -> bool:
        """Delete multiple entities"""
        return self.repository.delete_all(entity_ids)
    
    def get_by_id(self, entity_id: int) -> Optional[R]:
        """Get entity by ID as response DTO (read-only, no transaction)"""
        entity = self.repository.find_by_id(entity_id)
        return self._to_response(entity) if entity else None
    
    def get_all(self) -> List[R]:
        """Get all entities as response DTOs (read-only, no transaction)"""
        entities = self.repository.find_all()
        return [self._to_response(e) for e in entities]
    
    def _to_response(self, entity: T) -> R:
        """Convert SQLAlchemy model to Pydantic response DTO"""
        return self.response_class.model_validate(entity)




