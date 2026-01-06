from abc import ABC, abstractmethod
from typing import List
from ..schemas.admin import (
    UserStatsResponse,
    DeckStatsResponse,
    GlobalStatsResponse,
    SessionListItem,
    CardDifficultyResponse
)


class AdminService(ABC):
    """Admin service interface for analytics and monitoring"""
    
    @abstractmethod
    def get_global_stats(self) -> GlobalStatsResponse:
        """Get global platform statistics"""
        pass
    
    @abstractmethod
    def get_user_stats(self, user_id: int) -> UserStatsResponse:
        """Get detailed statistics for a specific user"""
        pass
    
    @abstractmethod
    def get_all_sessions(self) -> List[SessionListItem]:
        """Get all game sessions from all users"""
        pass
    
    @abstractmethod
    def get_difficult_cards(self, limit: int = 10) -> List[CardDifficultyResponse]:
        """Get the most difficult cards (lowest success rate)"""
        pass
    
    @abstractmethod
    def get_deck_stats(self, deck_id: int) -> DeckStatsResponse:
        """Get statistics for a specific deck"""
        pass




