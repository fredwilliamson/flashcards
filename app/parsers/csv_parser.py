import csv
import io
from typing import List, Dict, Any


class CSVParser:
    """Parser for CSV files"""
    
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    REQUIRED_COLUMNS = {'question', 'answer', 'keywords'}
    OPTIONAL_COLUMNS = {'hint'}
    
    def __init__(self, content: bytes):
        """
        Initialize parser with file content.
        
        Args:
            content: Raw bytes of CSV file
            
        Raises:
            ValueError: If file is too large or not UTF-8
        """
        if len(content) > self.MAX_FILE_SIZE:
            raise ValueError(f"File too large. Max size: {self.MAX_FILE_SIZE / 1024 / 1024} MB")
        
        try:
            self.content = content.decode('utf-8')
        except UnicodeDecodeError:
            raise ValueError("File must be UTF-8 encoded")
    
    def parse(self) -> List[Dict[str, Any]]:
        """
        Parse CSV content and return list of row dictionaries.
        
        Returns:
            List of dicts, each representing a CSV row
            
        Raises:
            ValueError: If CSV is invalid or missing required columns
        """
        reader = csv.DictReader(io.StringIO(self.content))
        
        # Validate header
        if not reader.fieldnames:
            raise ValueError("CSV file is empty or has no header")
        
        fieldnames = set(reader.fieldnames)
        missing_columns = self.REQUIRED_COLUMNS - fieldnames
        if missing_columns:
            raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")
        
        # Read all rows
        rows = []
        for row in reader:
            rows.append(row)
        
        return rows
    
    @staticmethod
    def parse_keywords(keywords_str: str) -> List[str]:
        """
        Parse comma-separated keywords string into list.
        
        Args:
            keywords_str: Comma-separated keywords (e.g., "key1,key2,key3")
            
        Returns:
            List of trimmed keywords
            
        Raises:
            ValueError: If keywords string is empty or results in empty list
        """
        if not keywords_str or not keywords_str.strip():
            raise ValueError("Keywords cannot be empty")
        
        keywords = [k.strip() for k in keywords_str.split(',') if k.strip()]
        
        if not keywords:
            raise ValueError("Keywords list is empty after parsing")
        
        return keywords



