from typing import TypeVar, Generic, List, Optional, Type
from sqlalchemy.orm import Session
from ...models.base_entity import BaseEntity

T = TypeVar('T', bound=BaseEntity)


class BaseRepositoryImpl(Generic[T]):
    """Base repository implementation with generic CRUD operations
    
    Note: No commit() is done here - commits should be managed at service/transaction level
    """
    
    def __init__(self, db: Session, model: Type[T]):
        self.db = db
        self.model = model
    
    def create(self, entity: T) -> T:
        """Add entity to session (no commit)"""
        self.db.add(entity)
        return entity
    
    def create_all(self, entities: List[T]) -> List[T]:
        """Add multiple entities to session (no commit)"""
        self.db.add_all(entities)
        return entities
    
    def update(self, entity: T) -> T:
        """Merge entity into session (no commit)"""
        return self.db.merge(entity)
    
    def update_all(self, entities: List[T]) -> List[T]:
        """Merge multiple entities into session (no commit)"""
        merged = []
        for entity in entities:
            merged.append(self.db.merge(entity))
        return merged
    
    def delete(self, entity_id: int) -> bool:
        """Mark entity for deletion (no commit)"""
        entity = self.find_by_id(entity_id)
        if entity:
            self.db.delete(entity)
            return True
        return False
    
    def delete_all(self, entity_ids: List[int]) -> bool:
        """Mark multiple entities for deletion (no commit)"""
        entities = self.find_by_ids(entity_ids)
        if entities:
            for entity in entities:
                self.db.delete(entity)
            return True
        return False
    
    def find_by_id(self, entity_id: int) -> Optional[T]:
        """Find entity by ID"""
        return self.db.query(self.model).filter(self.model.id == entity_id).first()
    
    def find_by_ids(self, entity_ids: List[int]) -> List[T]:
        """Find multiple entities by IDs"""
        return self.db.query(self.model).filter(self.model.id.in_(entity_ids)).all()
    
    def find_all(self) -> List[T]:
        """Find all entities"""
        return self.db.query(self.model).all()
    
    def find_by_creator_id(self, creator_id: int) -> List[T]:
        """Find all entities by creator ID"""
        return self.db.query(self.model).filter(self.model.creator_id == creator_id).all()

