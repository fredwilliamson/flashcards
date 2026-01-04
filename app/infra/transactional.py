from functools import wraps
from typing import Callable, TypeVar
from sqlalchemy.orm import Session

T = TypeVar('T')


def transactional(func: Callable[..., T]) -> Callable[..., T]:
    """
    Decorator for transaction management (AOP-style).
    
    Wraps a service method with explicit commit/rollback:
    - Commits on success
    - Rollbacks on exception and re-raises
    - Preserves function metadata via @wraps
    
    Usage:
        @transactional
        def create_user(self, dto: UserCreate) -> UserResponse:
            # ... business logic ...
            return response
    """
    @wraps(func)
    def wrapper(self, *args, **kwargs) -> T:
        # self.db is the SQLAlchemy Session
        try:
            result = func(self, *args, **kwargs)
            self.db.commit()
            return result
        except Exception:
            self.db.rollback()
            raise
    
    return wrapper

