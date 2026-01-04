from abc import ABC, abstractmethod
from typing import Optional
from ..models.game_session import GameSession
from ..schemas.game_session import (
    GameSessionStart,
    GameSessionResponse,
    NextCardResponse,
    AnswerSubmit,
    AnswerResponse,
    SessionStatsResponse
)


class GamingSessionService(ABC):
    """Gaming session service interface"""
    
    @abstractmethod
    def start_session(self, user_id: int, data: GameSessionStart) -> GameSessionResponse:
        """
        Start a new game session with a deck.
        
        Args:
            user_id: ID of the user starting the session
            data: GameSessionStart with deck_id
            
        Returns:
            GameSessionResponse with session details
        """
        pass
    
    @abstractmethod
    def get_next_card(self, session_id: int, user_id: int) -> Optional[NextCardResponse]:
        """
        Get the next card from the session.
        
        Args:
            session_id: ID of the game session
            user_id: ID of the user (for permission check)
            
        Returns:
            NextCardResponse with card details, or None if no cards remaining
        """
        pass
    
    @abstractmethod
    def submit_answer(self, session_id: int, user_id: int, data: AnswerSubmit) -> AnswerResponse:
        """
        Submit an answer and validate it.
        
        Args:
            session_id: ID of the game session
            user_id: ID of the user (for permission check)
            data: AnswerSubmit with card_id and answer
            
        Returns:
            AnswerResponse with validation result
        """
        pass
    
    @abstractmethod
    def get_session_stats(self, session_id: int, user_id: int) -> SessionStatsResponse:
        """
        Get current session statistics.
        
        Args:
            session_id: ID of the game session
            user_id: ID of the user (for permission check)
            
        Returns:
            SessionStatsResponse with stats
        """
        pass
    
    @abstractmethod
    def complete_session(self, session_id: int, user_id: int) -> SessionStatsResponse:
        """
        Mark session as completed.
        
        Args:
            session_id: ID of the game session
            user_id: ID of the user (for permission check)
            
        Returns:
            SessionStatsResponse with final stats
        """
        pass



