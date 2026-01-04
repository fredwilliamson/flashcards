from abc import abstractmethod
from typing import Optional
from .base_service import BaseService
from ..models.user import User
from ..schemas.user import UserCreate, UserReplace, UserPatch, UserResponse


class UserService(BaseService[User, UserCreate, UserReplace, UserPatch, UserResponse]):
    """User service interface"""
    
    @abstractmethod
    def get_by_username(self, username: str) -> Optional[UserResponse]:
        """Get user by username"""
        pass
    
    @abstractmethod
    def authenticate(self, username: str, password: str) -> Optional[UserResponse]:
        """Authenticate user with username and password"""
        pass



