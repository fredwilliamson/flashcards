from typing import Optional, List
import random
import re
from sqlalchemy.orm import Session
from unidecode import unidecode
from thefuzz import process, fuzz

from ..gaming_session_service import GamingSessionService
from ...repositories.game_session_repository import GameSessionRepository
from ...repositories.card_repository import CardRepository
from ...repositories.card_attempt_repository import CardAttemptRepository
from ...models.game_session import GameSession, GameSessionStatus
from ...models.card_attempt import CardAttempt
from ...schemas.game_session import (
    GameSessionStart,
    GameSessionResponse,
    NextCardResponse,
    AnswerSubmit,
    AnswerResponse,
    SessionStatsResponse
)
from ...infra import transactional


class GamingSessionServiceImpl(GamingSessionService):
    """Gaming session service implementation"""
    
    def __init__(
        self,
        db: Session,
        session_repository: GameSessionRepository,
        card_repository: CardRepository,
        attempt_repository: CardAttemptRepository
    ):
        self.db = db
        self.session_repository = session_repository
        self.card_repository = card_repository
        self.attempt_repository = attempt_repository
    
    # Validation functions (Command pattern)
    @staticmethod
    def _validate_session_exists(session: Optional[GameSession]) -> None:
        """Validate that session exists"""
        if not session:
            raise ValueError("Session not found")
    
    @staticmethod
    def _validate_user_permission(session: GameSession, user_id: int) -> None:
        """Validate that user has permission to access session"""
        if session.user_id != user_id:
            raise PermissionError("You don't have permission to access this session")
    
    @staticmethod
    def _validate_session_active(session: GameSession) -> None:
        """Validate that session is active"""
        if session.status != GameSessionStatus.ACTIVE:
            raise ValueError("Session is not active")
    
    def _get_and_validate_session(
        self,
        session_id: int,
        user_id: int,
        validators: List
    ) -> GameSession:
        """
        Get session and apply validation functions (Command pattern).
        
        Args:
            session_id: ID of the session
            user_id: ID of the user (for permission check)
            validators: List of validation functions to apply
            
        Returns:
            Validated GameSession
        """
        session = self.session_repository.find_by_id(session_id)
        
        # Apply each validation function
        for validator in validators:
            # Handle validators that need user_id parameter
            if validator.__name__ == '_validate_user_permission':
                validator(session, user_id)
            else:
                validator(session)
        
        return session

    def normalize(self, text: str) -> str:
        text = text.lower()
        text = unidecode(text)  # é → e
        text = re.sub(r"[\(\)-]", "", text)  #  (), -
        text = re.sub(r"[^a-z0-9]", "", text)  
        return text

    def is_length_ok(self, user: str, expected: str, max_diff_ratio: float = 0.2) -> bool:
        len_user = len(user)
        len_expected = len(expected)
        if len_expected == 0:
            return False
        return abs(len_expected - len_user) / len_expected <= max_diff_ratio

    def check_answer(
        self,
        user_answer: str,
        valid_answers: List[str],
        threshold: int = 80,
        max_diff_ratio: float = 0.2,
        use_partial: bool = True
    ) -> bool:
        if not valid_answers:
            return False

        normalized_user = self.normalize(user_answer)
        normalized_choices = [self.normalize(v) for v in valid_answers]
        scorer = fuzz.partial_ratio if use_partial and len(normalized_user) > 2 else fuzz.ratio

        match, score = process.extractOne(
            normalized_user,
            normalized_choices,
            scorer=scorer
        )

        if not self.is_length_ok(normalized_user, match, max_diff_ratio=max_diff_ratio):
            return False

        return score >= threshold

    def split_answers(self,answers: List[str]) -> List[str]:
        result = []
        for a in answers:
            parts = [part.strip() for part in a.split(",")]
            result.extend(parts)
        return result

    def validate_answer(
            self,
            user_answer: str,
            absolute_answers: List[str],
            keywords: Optional[List[str]] = None,
            threshold: int = 80,
            max_diff_ratio: float = 0.2
    ) -> bool:
        keywords = keywords or []

        absolute_list = self.split_answers(absolute_answers)
        keywords_list = self.split_answers(keywords)

        if self.check_answer(user_answer, absolute_list, threshold, max_diff_ratio, use_partial=False):
            return True

        if self.check_answer(user_answer, keywords_list, threshold, max_diff_ratio, use_partial=True):
            return True

        return False

    @transactional
    def start_session(self, user_id: int, data: GameSessionStart) -> GameSessionResponse:
        """
        Start a new game session with a deck.
        
        - Loads all cards from the deck
        - Shuffles them randomly
        - Creates a new session with status ACTIVE
        """
        # Get all cards from the deck
        cards = self.card_repository.find_by_deck_id(data.deck_id)
        
        if not cards:
            raise ValueError("Deck has no cards")
        
        # Extract card IDs and shuffle
        card_ids = [card.id for card in cards]
        random.shuffle(card_ids)
        
        # Create new session
        session = GameSession(
            user_id=user_id,
            deck_id=data.deck_id,
            status=GameSessionStatus.ACTIVE,
            remaining_cards=card_ids,
            success_cards=[],
            creator_id=user_id
        )
        
        created_session = self.session_repository.create(session)
        self.db.flush()
        self.db.refresh(created_session)
        
        return GameSessionResponse(
            id=created_session.id,
            created_at=created_session.created_at,
            updated_at=created_session.updated_at,
            creator_id=created_session.creator_id,
            modifier_id=created_session.modifier_id,
            user_id=created_session.user_id,
            deck_id=created_session.deck_id,
            status=created_session.status.value,
            remaining_count=len(created_session.remaining_cards),
            success_count=len(created_session.success_cards),
            completion_percentage=0.0
        )
    
    def get_next_card(self, session_id: int, user_id: int) -> Optional[NextCardResponse]:
        """
        Get the next card from the session.
        
        Returns the card at position 0 in remaining_cards.
        Does NOT remove it from the array (removal happens in submit_answer).
        """
        # Get and validate session
        session = self._get_and_validate_session(
            session_id,
            user_id,
            [
                self._validate_session_exists,
                self._validate_user_permission,
                self._validate_session_active
            ]
        )
        
        # Check if there are remaining cards
        if not session.remaining_cards or len(session.remaining_cards) == 0:
            return None
        
        # Get first card (position 0)
        card_id = session.remaining_cards[0]
        card = self.card_repository.find_by_id(card_id)
        
        if not card:
            raise ValueError(f"Card {card_id} not found")
        
        return NextCardResponse(
            card_id=card.id,
            question=card.question,
            hint=card.hint,
            remaining_count=len(session.remaining_cards)
        )
    
    @transactional
    def submit_answer(self, session_id: int, user_id: int, data: AnswerSubmit) -> AnswerResponse:
        """
        Submit an answer and validate it.
        
        Logic:
        - Correct answer: card removed from remaining_cards, added to success_cards
        - Incorrect answer: card removed then reinserted at random position in remaining_cards (not position 0)
        
        Flow:
        1. User calls get_next_card() → receives card at position 0
        2. User submits answer for that card
        3. Card is removed from remaining_cards
        4. If correct → goes to success_cards
        5. If incorrect → reinserted randomly in remaining_cards (position 1 to N)
        """
        # Get and validate session
        session = self._get_and_validate_session(
            session_id,
            user_id,
            [
                self._validate_session_exists,
                self._validate_user_permission,
                self._validate_session_active
            ]
        )
        
        # Get card
        card = self.card_repository.find_by_id(data.card_id)
        if not card:
            raise ValueError("Card not found")
        
        # Verify card belongs to session's deck
        if card.deck_id != session.deck_id:
            raise ValueError("Card does not belong to this session's deck")

        # Validate answer (checks expected answer and keywords, case-insensitive)
        is_correct = self.validate_answer(data.answer, [card.answer], card.keywords)

        # Record the attempt for analytics
        attempt = CardAttempt(
            session_id=session_id,
            card_id=data.card_id,
            user_id=user_id,
            is_correct=is_correct,
            response_time_seconds=data.response_time_seconds,
            creator_id=user_id
        )
        self.attempt_repository.create(attempt)
        
        # Copy arrays for modification
        remaining_cards = list(session.remaining_cards or [])
        success_cards = list(session.success_cards or [])
        
        # Verify card is in remaining_cards (should always be true if flow is correct)
        if data.card_id not in remaining_cards:
            raise ValueError("Card is not in the remaining cards pile")
        
        if is_correct:
            remaining_cards.remove(data.card_id)
            success_cards.append(data.card_id)
        else:
            if len(remaining_cards) > 1:
                # More than 1 card: remove and reinsert at random position
                remaining_cards.remove(data.card_id)
                # Insert at random position from 1 to len(remaining_cards)
                insert_position = random.randint(1, len(remaining_cards))
                remaining_cards.insert(insert_position, data.card_id)
            # else: only 1 card remaining, leave it in place (position 0)
        
        # Update session with new card positions
        session.remaining_cards = remaining_cards
        session.success_cards = success_cards
        self.session_repository.update(session)
        
        # Flush to ensure changes are persisted before returning
        self.db.flush()
        
        # Prepare response message
        if is_correct:
            message = "Correct answer!"
            expected_answer = None
        else:
            message = "Incorrect"
            expected_answer = card.answer
        
        # Keywords are already a list (JSON column)
        keywords = card.keywords if isinstance(card.keywords, list) else []
        
        return AnswerResponse(
            is_correct=is_correct,
            message=message,
            expected_answer=expected_answer,
            expected_keywords=keywords,
            remaining_count=len(remaining_cards),
            success_count=len(success_cards)
        )

    def get_session_stats(self, session_id: int, user_id: int) -> SessionStatsResponse:
        """
        Get current session statistics.
        
        Returns session info, card counts, and completion percentage.
        """
        # Get and validate session (no need to check if active for stats)
        session = self._get_and_validate_session(
            session_id,
            user_id,
            [
                self._validate_session_exists,
                self._validate_user_permission
            ]
        )
        
        # Calculate stats
        remaining_count = len(session.remaining_cards or [])
        success_count = len(session.success_cards or [])
        total_cards = remaining_count + success_count
        
        completion_percentage = (success_count / total_cards * 100) if total_cards > 0 else 0.0
        
        return SessionStatsResponse(
            session_id=session.id,
            status=session.status.value,
            total_cards=total_cards,
            remaining_count=remaining_count,
            success_count=success_count,
            completion_percentage=round(completion_percentage, 2)
        )
    
    @transactional
    def complete_session(self, session_id: int, user_id: int) -> SessionStatsResponse:
        """
        Mark session as completed.
        
        Updates session status to COMPLETED and returns final stats.
        """
        # Get and validate session
        session = self._get_and_validate_session(
            session_id,
            user_id,
            [
                self._validate_session_exists,
                self._validate_user_permission,
                self._validate_session_active
            ]
        )
        
        # Update status
        session.status = GameSessionStatus.COMPLETED
        session.modifier_id = user_id
        self.session_repository.update(session)
        
        self.db.flush()
        
        # Calculate final stats
        remaining_count = len(session.remaining_cards or [])
        success_count = len(session.success_cards or [])
        total_cards = remaining_count + success_count
        
        completion_percentage = (success_count / total_cards * 100) if total_cards > 0 else 0.0
        
        return SessionStatsResponse(
            session_id=session.id,
            status=session.status.value,
            total_cards=total_cards,
            remaining_count=remaining_count,
            success_count=success_count,
            completion_percentage=round(completion_percentage, 2)
        )

