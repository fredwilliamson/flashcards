from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer
from ..admin_service import AdminService
from ...repositories.user_repository import UserRepository
from ...repositories.deck_repository import DeckRepository
from ...repositories.card_repository import CardRepository
from ...repositories.game_session_repository import GameSessionRepository
from ...repositories.progress_repository import ProgressRepository
from ...models.user import User
from ...models.deck import Deck
from ...models.card import Card
from ...models.game_session import GameSession, GameSessionStatus
from ...models.progress import UserProgress
from ...schemas.admin import (
    UserStatsResponse,
    DeckStatsResponse,
    GlobalStatsResponse,
    SessionListItem,
    CardDifficultyResponse
)


class AdminServiceImpl(AdminService):
    """Admin service implementation for analytics and monitoring"""
    
    def __init__(
        self,
        db: Session,
        user_repository: UserRepository,
        deck_repository: DeckRepository,
        card_repository: CardRepository,
        session_repository: GameSessionRepository,
        progress_repository: ProgressRepository
    ):
        self.db = db
        self.user_repository = user_repository
        self.deck_repository = deck_repository
        self.card_repository = card_repository
        self.session_repository = session_repository
        self.progress_repository = progress_repository
    
    def get_global_stats(self) -> GlobalStatsResponse:
        """Get global platform statistics"""
        # Count totals
        total_users = self.db.query(func.count(User.id)).scalar() or 0
        total_decks = self.db.query(func.count(Deck.id)).scalar() or 0
        total_cards = self.db.query(func.count(Card.id)).scalar() or 0
        total_sessions = self.db.query(func.count(GameSession.id)).scalar() or 0
        
        # Count active sessions
        active_sessions = self.db.query(func.count(GameSession.id)).filter(
            GameSession.status == GameSessionStatus.ACTIVE
        ).scalar() or 0
        
        # Count progress records (total attempts)
        total_attempts = self.db.query(func.count(UserProgress.id)).scalar() or 0
        
        # Calculate global success rate
        if total_attempts > 0:
            success_count = self.db.query(func.count(UserProgress.id)).filter(
                UserProgress.correct == True
            ).scalar() or 0
            global_success_rate = (success_count / total_attempts) * 100
        else:
            global_success_rate = 0.0
        
        return GlobalStatsResponse(
            total_users=total_users,
            total_decks=total_decks,
            total_cards=total_cards,
            total_sessions=total_sessions,
            active_sessions=active_sessions,
            total_attempts=total_attempts,
            global_success_rate=round(global_success_rate, 2)
        )
    
    def get_user_stats(self, user_id: int) -> UserStatsResponse:
        """Get detailed statistics for a specific user"""
        # Get user
        user = self.user_repository.find_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        # Count sessions
        all_sessions = self.db.query(GameSession).filter(GameSession.user_id == user_id).all()
        total_sessions = len(all_sessions)
        active_sessions = sum(1 for s in all_sessions if s.status == GameSessionStatus.ACTIVE)
        completed_sessions = sum(1 for s in all_sessions if s.status == GameSessionStatus.COMPLETED)
        
        # Count progress records
        progress_records = self.progress_repository.find_by_user_id(user_id)
        total_attempts = len(progress_records)
        success_attempts = sum(1 for p in progress_records if p.correct)
        success_rate = (success_attempts / total_attempts * 100) if total_attempts > 0 else 0.0
        
        # Last activity
        last_activity = None
        if progress_records:
            last_activity = max(p.answered_at for p in progress_records)
        
        return UserStatsResponse(
            user_id=user.id,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            total_sessions=total_sessions,
            active_sessions=active_sessions,
            completed_sessions=completed_sessions,
            total_cards_attempted=total_attempts,
            total_cards_success=success_attempts,
            success_rate_percentage=round(success_rate, 2),
            last_activity=last_activity
        )
    
    def get_all_sessions(self) -> List[SessionListItem]:
        """Get all game sessions from all users"""
        sessions = self.session_repository.find_all()
        
        result = []
        for session in sessions:
            # Get user and deck info
            user = self.user_repository.find_by_id(session.user_id)
            deck = self.deck_repository.find_by_id(session.deck_id)
            
            if not user or not deck:
                continue
            
            remaining_count = len(session.remaining_cards or [])
            success_count = len(session.success_cards or [])
            total = remaining_count + success_count
            completion = (success_count / total * 100) if total > 0 else 0.0
            
            result.append(SessionListItem(
                session_id=session.id,
                user_id=user.id,
                username=user.username,
                deck_id=deck.id,
                deck_name=deck.name,
                status=session.status.value,
                remaining_count=remaining_count,
                success_count=success_count,
                completion_percentage=round(completion, 2),
                created_at=session.created_at
            ))
        
        return result
    
    def get_difficult_cards(self, limit: int = 10) -> List[CardDifficultyResponse]:
        """Get the most difficult cards (lowest success rate)"""
        # Query progress grouped by card_id
        card_stats = self.db.query(
            UserProgress.card_id,
            func.count(UserProgress.id).label('total_attempts'),
            func.sum(func.cast(UserProgress.correct, Integer)).label('success_count'),
            func.count(func.distinct(UserProgress.user_id)).label('unique_users')
        ).group_by(UserProgress.card_id).all()
        
        # Calculate success rates and build response
        results = []
        for stat in card_stats:
            card = self.card_repository.find_by_id(stat.card_id)
            if not card:
                continue
            
            deck = self.deck_repository.find_by_id(card.deck_id)
            if not deck:
                continue
            
            total = stat.total_attempts
            success = stat.success_count or 0
            failure = total - success
            success_rate = (success / total * 100) if total > 0 else 0.0
            
            results.append(CardDifficultyResponse(
                card_id=card.id,
                question=card.question,
                deck_id=deck.id,
                deck_name=deck.name,
                total_attempts=total,
                success_count=success,
                failure_count=failure,
                success_rate_percentage=round(success_rate, 2),
                unique_users=stat.unique_users
            ))
        
        # Sort by success rate (ascending = most difficult first)
        results.sort(key=lambda x: x.success_rate_percentage)
        
        return results[:limit]
    
    def get_deck_stats(self, deck_id: int) -> DeckStatsResponse:
        """Get statistics for a specific deck"""
        # Get deck
        deck = self.deck_repository.find_by_id(deck_id)
        if not deck:
            raise ValueError("Deck not found")
        
        # Count cards in deck
        cards = self.card_repository.find_by_deck_id(deck_id)
        total_cards = len(cards)
        
        # Count sessions with this deck
        sessions = self.db.query(GameSession).filter(GameSession.deck_id == deck_id).all()
        total_sessions = len(sessions)
        
        # Count unique users
        unique_users = len(set(s.user_id for s in sessions))
        
        # Calculate average success rate from progress
        progress_records = self.progress_repository.find_by_deck_id(deck_id)
        if progress_records:
            success_count = sum(1 for p in progress_records if p.correct)
            avg_success_rate = (success_count / len(progress_records) * 100)
        else:
            avg_success_rate = 0.0
        
        return DeckStatsResponse(
            deck_id=deck.id,
            deck_name=deck.name,
            creator_id=deck.creator_id,
            is_public=deck.is_public,
            total_cards=total_cards,
            total_sessions=total_sessions,
            unique_users=unique_users,
            average_success_rate=round(avg_success_rate, 2)
        )

