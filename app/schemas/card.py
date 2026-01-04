from pydantic import BaseModel
from typing import List, Optional
from .base_schema import BaseSchema


class CardBase(BaseModel):
    """Base card fields"""
    question: str
    answer: str
    keywords: List[str]  # List of keywords for validation
    hint: Optional[str] = None


class CardCreate(CardBase):
    """Schema for creating a card"""
    deck_id: int


class CardPatch(BaseModel):
    """Schema for PATCH - partial update of a card"""
    question: Optional[str] = None
    answer: Optional[str] = None
    keywords: Optional[List[str]] = None
    hint: Optional[str] = None


class CardReplace(CardBase):
    """Schema for PUT - full replacement of a card"""
    deck_id: int


class CardResponse(BaseSchema, CardBase):
    """Schema for card response"""
    deck_id: int

