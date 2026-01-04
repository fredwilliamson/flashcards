from datetime import timedelta, datetime
from typing import Any, Dict

from ..models.card_attempt import CardAttempt
from ..models.card_status import CardStatus, CardStatusThresholds, ReviewIntervals


class AnalyticsHelper:

    @staticmethod
    def get_card_status(success_rate: float, attempts: int) -> str:
        """Determine card status based on success rate and attempts"""
        if attempts == 0:
            return CardStatus.NEW.value
        elif success_rate >= CardStatusThresholds.SUCCESS_RATE_MASTERED:
            return CardStatus.MASTERED.value
        elif success_rate >= CardStatusThresholds.SUCCESS_RATE_REVIEW:
            return CardStatus.REVIEW.value
        else:
            return CardStatus.LEARNING.value

    @staticmethod
    def find_success_rate(answers, attempt_count: int) -> float:
        correct = len([a for a in answers if a.is_correct])
        success_rate = (correct / attempt_count) * 100
        return success_rate

    @staticmethod
    def calculate_consecutive_success_count(attempts: list) -> int:
        """
        Calculate the number of consecutive successful attempts from the most recent.

        Counts how many correct answers in a row the user has, starting from their
        most recent attempt and going backwards. If the most recent attempt is incorrect,
        the count is 0.

        Args:
            attempts: List of CardAttempt objects (will be sorted by creation date)

        Returns:
            Number of consecutive correct answers from most recent attempt

        Example:
            [correct, correct, incorrect, correct] -> consecutive_success_count = 2
            [incorrect, correct, correct, correct] -> consecutive_success_count = 0
        """
        if not attempts:
            return 0

        # Sort attempts by creation date (most recent first)
        sorted_attempts = sorted(attempts, key=lambda a: a.created_at, reverse=True)

        # Count consecutive correct answers from the most recent
        consecutive_success_count = 0
        for attempt in sorted_attempts:
            if attempt.is_correct:
                consecutive_success_count += 1
            else:
                # Stop at first incorrect answer
                break

        return consecutive_success_count


    @staticmethod
    def build_card_stats(attempts: list[CardAttempt]) -> Dict[int, Dict[str, int]]:
        card_stats = {}
        for attempt in attempts:
            if attempt.card_id not in card_stats:
                card_stats[attempt.card_id] = {"correct": 0, "total": 0}
            card_stats[attempt.card_id]["total"] += 1
            if attempt.is_correct:
                card_stats[attempt.card_id]["correct"] += 1
        return card_stats

    @staticmethod
    def find_next_review(last_seen: datetime,
                         status: str) -> timedelta | Any:
        if status == CardStatus.LEARNING.value:
            next_review = last_seen + timedelta(days=ReviewIntervals.LEARNING)
        elif status == CardStatus.REVIEW.value:
            next_review = last_seen + timedelta(days=ReviewIntervals.REVIEW)
        elif status == CardStatus.MASTERED.value:
            next_review = last_seen + timedelta(days=ReviewIntervals.MASTERED)
        else:
            next_review = None
        return next_review