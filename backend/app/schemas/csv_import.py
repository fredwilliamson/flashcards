from pydantic import BaseModel
from typing import List, Optional


class CSVImportError(BaseModel):
    """Error for a specific CSV line"""
    line_number: int
    error: str
    raw_line: Optional[str] = None


class CSVImportResponse(BaseModel):
    """Response for CSV import"""
    total_lines: int
    created_count: int
    error_count: int
    errors: List[CSVImportError] = []




