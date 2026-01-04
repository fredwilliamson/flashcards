from typing import Dict, Any, List
from pydantic import ValidationError
from ..schemas.card import CardCreate


class CardValidator:
    """Validator for card data"""
    
    def __init__(self, deck_id: int):
        """
        Initialize validator for a specific deck.
        
        Args:
            deck_id: ID of the deck where cards will be created
        """
        self.deck_id = deck_id
    
    def validate(self, row_data: Dict[str, Any], keywords: List[str]) -> CardCreate:
        """
        Validate and transform raw row data into CardCreate DTO.
        
        Args:
            row_data: Dictionary with keys: question, answer, hint (optional)
            keywords: Parsed list of keywords
            
        Returns:
            Valid CardCreate DTO
            
        Raises:
            ValidationError: If Pydantic validation fails
            ValueError: If business rules are violated
        """
        # Clean data
        question = row_data.get('question', '').strip()
        answer = row_data.get('answer', '').strip()
        hint = row_data.get('hint', '').strip() or None
        
        # Business validation
        if not question:
            raise ValueError("Question cannot be empty")
        
        if not answer:
            raise ValueError("Answer cannot be empty")
        
        if not keywords:
            raise ValueError("Keywords list cannot be empty")
        
        # Create and validate DTO (Pydantic validation)
        card_create = CardCreate(
            deck_id=self.deck_id,
            question=question,
            answer=answer,
            keywords=keywords,
            hint=hint
        )
        
        return card_create



