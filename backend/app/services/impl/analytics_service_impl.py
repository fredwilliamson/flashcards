from collections import defaultdict
from collections import defaultdict
from datetime import datetime
from typing import Optional, List, Dict

from sqlalchemy import Column
from sqlalchemy.orm import Session
from sqlalchemy.testing.suite.test_reflection import users

from ..analytics_service import AnalyticsService
from ...helpers.analytics_helper import AnalyticsHelper
from ...models import Deck, Card
from ...models.card_attempt import CardAttempt
from ...models.card_status import CardStatus, AnalyticsThresholds
from ...repositories.card_attempt_repository import CardAttemptRepository
from ...repositories.card_repository import CardRepository
from ...repositories.deck_repository import DeckRepository
from ...repositories.game_session_repository import GameSessionRepository
from ...repositories.user_repository import UserRepository
from ...schemas.analytics import (
    UserProgressStats,
    UserDeckProgress,
    UserDeckCard,
    UserDeckCardsResponse,
    DeckAnalyticsStats,
    DeckUserProgress,
    CardDifficulty,
)


class AnalyticsServiceImpl(AnalyticsService):
    """Analytics service implementation"""

    def __init__(
            self,
            db: Session,
            user_repository: UserRepository,
            deck_repository: DeckRepository,
            card_repository: CardRepository,
            session_repository: GameSessionRepository,
            attempt_repository: CardAttemptRepository,
            analytics_helper: AnalyticsHelper
    ):
        self.db = db
        self.user_repository = user_repository
        self.deck_repository = deck_repository
        self.card_repository = card_repository
        self.session_repository = session_repository
        self.attempt_repository = attempt_repository
        self.analytics_helper = analytics_helper

    def get_user_progress(self, user_id: int) -> Optional[UserProgressStats]:
        """Get user progress across all decks"""
        user = self.user_repository.find_by_id(user_id)
        if not user:
            return None

        # Get all user's card attempts
        all_attempts = self.attempt_repository.find_by_user_id(user_id)

        if not all_attempts:
            return UserProgressStats(
                user_id=user_id,
                username=user.username,
                total_cards_attempted=0,
                cards_mastered=0,
                avg_success_rate=0.0,
                consecutive_success_count=0,
                decks_progress=[],
                struggling_decks=[],
            )

        # Calculate global stats
        total_cards_attempted = len(set([attempt.card_id for attempt in all_attempts]))
        correct_answers = len([attempt for attempt in all_attempts if attempt.is_correct])
        avg_success_rate = self.calculate_percent(len(all_attempts), correct_answers)

        # Calculate consecutive success count (consecutive correct answers from most recent)
        consecutive_success_count = self.analytics_helper.calculate_consecutive_success_count(all_attempts)

        # Get progress by deck
        decks = self.session_repository.get_unique_decks_for_user(user_id)
        decks_by_deck_id: dict[int, Deck] = {deck.id: deck for deck in decks}

        attempts_by_deck = self.find_attempts_by_deck(user_id)

        decks_progress = []
        for deck_id, attempts in attempts_by_deck.items():
            card_stats = self.analytics_helper.build_card_stats(attempts)
            # Count mastered cards
            mastered_cards = self.find_mastered_cards_number(card_stats)

            deck_progress = self.build_deck_progress(attempts, deck_id, decks_by_deck_id, mastered_cards)
            decks_progress.append(deck_progress)

        # Sort decks by progress
        decks_progress.sort(key=lambda x: x.progress_percentage, reverse=True)

        # Get struggling decks (success rate below threshold)
        struggling_decks = [d for d in decks_progress if d.success_rate < AnalyticsThresholds.STRUGGLING_DECK_THRESHOLD]

        # Count truly mastered cards
        all_card_stats = self.analytics_helper.build_card_stats(all_attempts)
        cards_mastered = self.find_mastered_cards_number(all_card_stats)

        return UserProgressStats(
            user_id=user_id,
            username=user.username,
            total_cards_attempted=total_cards_attempted,
            cards_mastered=cards_mastered,
            avg_success_rate=round(avg_success_rate, 1),
            consecutive_success_count=consecutive_success_count,
            decks_progress=decks_progress,
            struggling_decks=struggling_decks,
        )

    def build_deck_progress(self, attempts: list[CardAttempt], deck_id: int, decks_by_deck_id: dict[int, Deck],
                            mastered_cards: int) -> UserDeckProgress:
        deck_success_rate = self.calculate_deck_success_rate(attempts)

        last_activity = self.find_last_activity(attempts)

        total_cards = len(decks_by_deck_id[deck_id].cards)
        progress_percentage = self.calculate_percent(total_cards, mastered_cards)

        deck_progress = UserDeckProgress(
            deck_id=deck_id,
            deck_name=decks_by_deck_id[deck_id].name,
            total_cards=total_cards,
            mastered_cards=mastered_cards,
            progress_percentage=round(progress_percentage, 1),
            success_rate=round(deck_success_rate, 1),
            last_activity=last_activity,
        )
        return deck_progress

    def calculate_deck_success_rate(self, attempts: list[CardAttempt]) -> float:
        deck_correct = len([attempt for attempt in attempts if attempt.is_correct])
        deck_success_rate = self.calculate_percent(len(attempts), deck_correct)
        return deck_success_rate

    def calculate_percent(self, denominator: int, numerator: int) -> float:
        if denominator == 0:
            return 0.0
        return (numerator / denominator * 100) if denominator else 0.0

    @staticmethod
    def calculate_average(values: list[float]) -> float:
        """Calculate average of a list of values"""
        return sum(values) / len(values) if values else 0.0

    @staticmethod
    def build_card_difficulty_stats(attempts: list[CardAttempt]) -> dict[int, dict[str, any]]:
        """
        Build difficulty statistics for each card from attempts.
        
        Aggregates all attempts by card_id and calculates:
        - Total number of attempts per card
        - Number of correct attempts per card
        - List of response times per card
        
        Args:
            attempts: List of CardAttempt objects to analyze
            
        Returns:
            Dictionary mapping card_id to stats dict containing:
                - "correct": Number of correct attempts
                - "total": Total number of attempts
                - "times": List of response times in seconds
                
        Example:
            {
                123: {"correct": 8, "total": 10, "times": [2.5, 3.1, 2.8, ...]},
                456: {"correct": 3, "total": 7, "times": [5.2, 4.9, ...]}
            }
        """
        card_difficulty: dict[int, dict[str, any]] = defaultdict(lambda: {"correct": 0, "total": 0, "times": []})
        for attempt in attempts:
            card_difficulty[attempt.card_id]["total"] += 1
            if attempt.is_correct:
                card_difficulty[attempt.card_id]["correct"] += 1
            if attempt.response_time_seconds:
                card_difficulty[attempt.card_id]["times"].append(attempt.response_time_seconds)
        return dict(card_difficulty)

    def find_mastered_cards_number(self, card_stats: dict[int, dict[str, int]]) -> int:
        mastered_cards = 0
        for card_id, stats in card_stats.items():
            success_rate = self.calculate_percent(stats["total"], stats["correct"])
            if self.analytics_helper.get_card_status(success_rate, stats["total"]) == CardStatus.MASTERED.value:
                mastered_cards += 1
        return mastered_cards

    def find_attempts_by_deck(self, user_id: int) -> dict[int, list[CardAttempt]]:
        decks = self.session_repository.get_unique_decks_for_user(user_id)
        deck_ids = [deck.id for deck in decks]

        deck_attempts_result = self.attempt_repository.find_by_user_and_decks(user_id, deck_ids)

        attempts_by_deck: Dict[int, List[CardAttempt]] = defaultdict(list)

        for deck, attempt in deck_attempts_result:
            attempts_by_deck[deck.id].append(attempt)

        return dict(attempts_by_deck)

    def get_user_deck_cards(self, user_id: int, deck_id: int) -> Optional[UserDeckCardsResponse]:
        """Get user progress on individual cards within a deck"""
        user = self.user_repository.find_by_id(user_id)
        deck = self.deck_repository.find_by_id(deck_id)

        if not user or not deck:
            return None

        # Get all cards in the deck
        cards = self.card_repository.find_by_deck_id(deck_id)

        # Get user's attempts for this deck
        attempts = self.attempt_repository.find_by_user_and_deck(user_id, deck_id)

        # Calculate stats for each card
        card_answers: Dict[int, List[CardAttempt]] = defaultdict(list)
        for attempt in attempts:
            card_answers[attempt.card_id].append(attempt)

        user_cards = []
        mastered_count = 0

        for card in cards:
            answers = card_answers.get(card.id, [])

            if not answers:
                # Card never attempted
                user_cards.append(
                    UserDeckCard(
                        card_id=card.id,
                        question=card.question,
                        answer=card.answer,
                        status="new",
                        attempts=0,
                        success_rate=0.0,
                        last_seen=None,
                        next_review=None,
                        consecutive_success_count=0,
                    )
                )
                continue

            user_cards.append(
                self.build_user_deck_card(
                    answers, card, mastered_count)
            )

        # Calculate average success rate
        avg_success_rate = 0.0
        if attempts:
            avg_success_rate = self.analytics_helper.find_success_rate(attempts, len(attempts))

        # Get last activity
        last_activity = self.find_last_activity(attempts)

        return UserDeckCardsResponse(
            user_id=user_id,
            username=user.username,
            deck_id=deck_id,
            deck_name=deck.name,
            cards=user_cards,
            mastered_count=mastered_count,
            total_count=len(cards),
            avg_success_rate=round(avg_success_rate, 1),
            last_activity=last_activity,
        )

    def build_user_deck_card(self, answers, card: Card, mastered_count: int) -> UserDeckCard:
        # Calculate stats
        attempt_count = len(answers)
        success_rate = self.analytics_helper.find_success_rate(answers, attempt_count)

        # Determine status
        status = self.analytics_helper.get_card_status(success_rate, attempt_count)
        if status == CardStatus.MASTERED.value:
            mastered_count += 1

        # Get last seen
        last_seen = max([a.created_at for a in answers])
        # Simple next review calculation using spaced repetition intervals
        next_review = self.analytics_helper.find_next_review(last_seen, status)

        # Calculate consecutive success count (consecutive correct answers from most recent)
        consecutive_success_count_for_card = self.analytics_helper.calculate_consecutive_success_count(answers)
        return UserDeckCard(
            card_id=card.id,
            question=card.question,
            answer=card.answer,
            status=status,
            attempts=attempt_count,
            success_rate=round(success_rate, 1),
            last_seen=last_seen,
            next_review=next_review,
            consecutive_success_count=consecutive_success_count_for_card,
        )

    def get_deck_analytics(self, deck_id: int) -> Optional[DeckAnalyticsStats]:
        """Get analytics for a specific deck"""
        deck = self.deck_repository.find_by_id(deck_id)
        if not deck:
            return None

        # Get all attempts for this deck
        attempts = self.attempt_repository.find_by_deck(deck_id)

        if not attempts:
            return DeckAnalyticsStats(
                deck_id=deck_id,
                deck_name=deck.name,
                total_users=0,
                avg_mastery_rate=0.0,
                avg_success_rate=0.0,
                difficult_cards_count=0,
                users_progress=[],
                difficult_cards=[],
            )

        # Get unique users
        user_ids = set([a.user_id for a in attempts])
        total_users = len(user_ids)

        # Calculate stats per user
        users = self.user_repository.find_by_ids(user_ids)
        users_progress = self.build_users_progress_for_deck(users, attempts, deck)

        # Sort users by progress
        users_progress.sort(key=lambda x: x.progress_percentage, reverse=True)

        # Calculate average rates from users_progress
        mastery_rates = [u.progress_percentage for u in users_progress]
        success_rates = [u.success_rate for u in users_progress]
        avg_mastery_rate = self.calculate_average(mastery_rates)
        avg_success_rate = self.calculate_average(success_rates)

        # Find difficult cards (success rate < 50%)
        difficult_cards = self.find_difficult_cards_for_deck(attempts, deck)

        return DeckAnalyticsStats(
            deck_id=deck_id,
            deck_name=deck.name,
            total_users=total_users,
            avg_mastery_rate=round(avg_mastery_rate, 1),
            avg_success_rate=round(avg_success_rate, 1),
            difficult_cards_count=len(difficult_cards),
            users_progress=users_progress,
            difficult_cards=difficult_cards[:AnalyticsThresholds.MAX_DIFFICULT_CARDS_RETURNED],
        )

    def build_users_progress_for_deck(self, users: list, attempts: list[CardAttempt], deck: Deck) -> list[DeckUserProgress]:
        """
        Build progress statistics for each user on a specific deck.
        
        Calculates detailed progress metrics for each user including:
        - Number of mastered cards
        - Progress percentage
        - Success rate
        - Last activity timestamp
        
        Args:
            users: List of User objects to analyze
            attempts: List of all CardAttempt objects for the deck
            deck: The Deck object
            
        Returns:
            List of DeckUserProgress objects, one per user
        """
        users_progress = []
        for user in users:
            user_attempts = [a for a in attempts if a.user_id == user.id]

            # Calculate card stats
            card_stats = self.analytics_helper.build_card_stats(user_attempts)

            # Count mastered cards
            mastered_cards = self.find_mastered_cards_number(card_stats)

            total_cards = len(deck.cards)
            progress_percentage = self.calculate_percent(total_cards, mastered_cards)

            correct = len([a for a in user_attempts if a.is_correct])
            user_success_rate = self.calculate_percent(len(user_attempts), correct)

            last_activity = self.find_last_activity(user_attempts)

            users_progress.append(
                DeckUserProgress(
                    user_id=user.id,
                    username=user.username,
                    mastered_cards=mastered_cards,
                    total_cards=total_cards,
                    progress_percentage=round(progress_percentage, 1),
                    success_rate=round(user_success_rate, 1),
                    last_activity=last_activity,
                )
            )
        return users_progress

    def find_difficult_cards_for_deck(self, attempts: list[CardAttempt], deck: Deck) -> list[CardDifficulty]:
        """
        Find and analyze difficult cards for a deck.
        
        Analyzes all attempts for a deck to identify cards that students struggle with.
        Builds difficulty statistics and filters cards with success rate below threshold.
        
        Args:
            attempts: List of all CardAttempt objects for the deck
            deck: The Deck object containing the cards
            
        Returns:
            List of CardDifficulty objects sorted by success rate (lowest first)
            
        Note:
            Only includes cards with success rate < DIFFICULT_CARD_THRESHOLD (50%)
        """
        # Build difficulty statistics from attempts
        card_difficulty = self.build_card_difficulty_stats(attempts)
        
        # Create card lookup dictionary
        card_by_id: dict[int, Card] = {card.id: card for card in deck.cards}
        
        # Build and return difficult cards list
        return self.build_difficult_cards_list(card_difficulty, card_by_id)

    def build_difficult_cards_list(self, card_difficulty: dict[int, dict[str, any]], card_by_id: dict[int, Card]) -> \
            list[CardDifficulty]:
        """
        Build a list of difficult cards from card difficulty statistics.
        
        Filters cards with success rate below the difficulty threshold and creates
        CardDifficulty objects with detailed statistics including average response time.
        
        Args:
            card_difficulty: Dictionary mapping card_id to stats dict containing:
                - "correct": Number of correct attempts
                - "total": Total number of attempts
                - "times": List of response times in seconds
            card_by_id: Dictionary mapping card_id to Card objects
                
        Returns:
            List of CardDifficulty objects sorted by success rate (lowest first)
            
        Note:
            Only includes cards with success rate < DIFFICULT_CARD_THRESHOLD (50%)
        """
        difficult_cards = []
        for card_id, stats in card_difficulty.items():
            success_rate = self.calculate_percent(stats["total"], stats["correct"])
            if success_rate < AnalyticsThresholds.DIFFICULT_CARD_THRESHOLD:
                card = card_by_id[card_id]
                if card:
                    avg_time = self.calculate_average(stats["times"]) if stats["times"] else None
                    difficult_cards.append(
                        CardDifficulty(
                            card_id=card_id,
                            question=card.question,
                            attempts=stats["total"],
                            success_rate=round(success_rate, 1),
                            avg_time_seconds=round(avg_time, 1) if avg_time else None,
                        )
                    )

        # Sort by success rate (lowest first)
        difficult_cards.sort(key=lambda x: x.success_rate)
        return difficult_cards

    @staticmethod
    def find_last_activity(user_attempts: list[CardAttempt]) -> Column[datetime] | None:
        last_activity = max([a.created_at for a in user_attempts]) if user_attempts else None
        return last_activity
