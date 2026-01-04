from sqlalchemy.orm import Session
from .database import get_db
from .repositories.impl import (
    UserRepositoryImpl,
    DeckRepositoryImpl,
    CardRepositoryImpl,
    GameSessionRepositoryImpl,
    ProgressRepositoryImpl
)
from .repositories.impl.card_attempt_repository_impl import CardAttemptRepositoryImpl
from .services.impl import (
    UserServiceImpl,
    DeckServiceImpl,
    CardServiceImpl,
    GamingSessionServiceImpl,
    AdminServiceImpl,
    AnalyticsServiceImpl
)
from .helpers.analytics_helper import AnalyticsHelper
from fastapi import Depends


def get_user_service(db: Session = Depends(get_db)) -> UserServiceImpl:
    """Dependency for UserService"""
    repo = UserRepositoryImpl(db)
    return UserServiceImpl(db, repo)


def get_deck_service(db: Session = Depends(get_db)) -> DeckServiceImpl:
    """Dependency for DeckService"""
    repo = DeckRepositoryImpl(db)
    return DeckServiceImpl(db, repo)


def get_card_service(db: Session = Depends(get_db)) -> CardServiceImpl:
    """Dependency for CardService"""
    repo = CardRepositoryImpl(db)
    return CardServiceImpl(db, repo)


def get_gaming_session_service(db: Session = Depends(get_db)) -> GamingSessionServiceImpl:
    """Dependency for GamingSessionService"""
    session_repo = GameSessionRepositoryImpl(db)
    card_repo = CardRepositoryImpl(db)
    attempt_repo = CardAttemptRepositoryImpl(db)
    return GamingSessionServiceImpl(db, session_repo, card_repo, attempt_repo)


def get_admin_service(db: Session = Depends(get_db)) -> AdminServiceImpl:
    """Dependency for AdminService"""
    user_repo = UserRepositoryImpl(db)
    deck_repo = DeckRepositoryImpl(db)
    card_repo = CardRepositoryImpl(db)
    session_repo = GameSessionRepositoryImpl(db)
    progress_repo = ProgressRepositoryImpl(db)
    return AdminServiceImpl(db, user_repo, deck_repo, card_repo, session_repo, progress_repo)


def get_analytics_service(db: Session = Depends(get_db)) -> AnalyticsServiceImpl:
    """Dependency for AnalyticsService"""
    user_repo = UserRepositoryImpl(db)
    deck_repo = DeckRepositoryImpl(db)
    card_repo = CardRepositoryImpl(db)
    session_repo = GameSessionRepositoryImpl(db)
    attempt_repo = CardAttemptRepositoryImpl(db)
    analytics_helper = AnalyticsHelper()
    return AnalyticsServiceImpl(db, user_repo, deck_repo, card_repo, session_repo, attempt_repo, analytics_helper)

