from sqlalchemy import Column, BigInteger, DateTime, ForeignKey
from sqlalchemy.sql import func
from ..database import Base


class BaseEntity(Base):
    """Base entity with common fields for all models"""
    __abstract__ = True
    __table_args__ = {'schema': 'flashcard'}
    
    id = Column(BigInteger, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    creator_id = Column(BigInteger, ForeignKey("flashcard.users.id"), nullable=True)
    modifier_id = Column(BigInteger, ForeignKey("flashcard.users.id"), nullable=True)

