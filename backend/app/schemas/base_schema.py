from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BaseSchema(BaseModel):
    """Base schema with common fields from BaseEntity"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    creator_id: Optional[int] = None
    modifier_id: Optional[int] = None
    
    class Config:
        from_attributes = True




