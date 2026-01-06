from pydantic import BaseModel
from typing import Optional
from .base_schema import BaseSchema


class DeckBase(BaseModel):
    """Base deck fields"""
    name: str
    description: Optional[str] = None
    is_public: bool = False


class DeckCreate(DeckBase):
    """Schema for creating a deck"""
    pass


class DeckPatch(BaseModel):
    """Schema for PATCH - partial update of a deck"""
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None


class DeckReplace(DeckBase):
    """Schema for PUT - full replacement of a deck"""
    pass


class DeckResponse(BaseSchema, DeckBase):
    """Schema for deck response"""
    pass




