from typing import List
from pydantic import ValidationError
from ..schemas.csv_import import CSVImportError, CSVImportResponse
from ..services.impl import CardServiceImpl
from ..parsers import CSVParser
from ..validators import CardValidator


class CSVImportService:
    """
    Service for importing cards from CSV (Option B: Best Effort).
    
    Orchestrates:
    - CSVParser: technical parsing of CSV
    - CardValidator: business validation
    - CardService: persistence
    """
    
    def __init__(self, card_service: CardServiceImpl, deck_id: int):
        self.card_service = card_service
        self.deck_id = deck_id
        self.validator = CardValidator(deck_id)
    
    def import_csv(self, file_content: bytes) -> CSVImportResponse:
        """
        Import cards from CSV file content.
        
        Strategy: Best effort - creates valid cards, reports errors for invalid lines.
        
        Args:
            file_content: Raw bytes of CSV file
            
        Returns:
            CSVImportResponse with stats and errors
            
        Raises:
            ValueError: If CSV parsing fails globally (file format, encoding, columns)
        """
        # Step 1: Parse CSV (technical)
        parser = CSVParser(file_content)
        rows = parser.parse()
        
        # Step 2: Process each row
        created_count = 0
        errors: List[CSVImportError] = []
        
        for idx, row in enumerate(rows, start=2):  # Line 2 = first data row (header is line 1)
            try:
                # Parse keywords
                keywords_str = row.get('keywords', '')
                keywords = parser.parse_keywords(keywords_str)
                
                # Validate and transform (business)
                card_create = self.validator.validate(row, keywords)
                
                # Persist
                self.card_service.create(card_create)
                created_count += 1
                
            except ValidationError as e:
                # Pydantic validation error
                error_msg = "; ".join([f"{err['loc'][0]}: {err['msg']}" for err in e.errors()])
                errors.append(CSVImportError(
                    line_number=idx,
                    error=error_msg,
                    raw_line=str(row)
                ))
            except ValueError as e:
                # Business validation error
                errors.append(CSVImportError(
                    line_number=idx,
                    error=str(e),
                    raw_line=str(row)
                ))
            except Exception as e:
                # Unexpected error
                errors.append(CSVImportError(
                    line_number=idx,
                    error=f"Unexpected error: {str(e)}",
                    raw_line=str(row)
                ))
        
        return CSVImportResponse(
            total_lines=len(rows),
            created_count=created_count,
            error_count=len(errors),
            errors=errors
        )

