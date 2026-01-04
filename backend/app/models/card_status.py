from enum import Enum


class CardStatus(str, Enum):
    """Card learning status"""
    NEW = "new"
    LEARNING = "learning"
    REVIEW = "review"
    MASTERED = "mastered"


# Card status thresholds (constants)
class CardStatusThresholds:
    """Thresholds for determining card status"""
    SUCCESS_RATE_MASTERED = 80.0  # Minimum success rate for mastered status
    SUCCESS_RATE_REVIEW = 50.0    # Minimum success rate for review status


# Review intervals (in days)
class ReviewIntervals:
    """Review intervals for spaced repetition"""
    LEARNING = 1    # 1 day for learning cards
    REVIEW = 3      # 3 days for review cards
    MASTERED = 7    # 7 days for mastered cards


# Analytics thresholds
class AnalyticsThresholds:
    """Thresholds for analytics calculations"""
    STRUGGLING_DECK_THRESHOLD = 40.0  # Decks with < 40% success rate are struggling
    DIFFICULT_CARD_THRESHOLD = 50.0   # Cards with < 50% success rate are difficult
    MAX_DIFFICULT_CARDS_RETURNED = 20  # Maximum number of difficult cards to return in analytics

