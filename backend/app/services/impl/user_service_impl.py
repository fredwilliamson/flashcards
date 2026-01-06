from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from ..user_service import UserService
from .base_service_impl import BaseServiceImpl
from ...repositories.user_repository import UserRepository
from ...models.user import User
from ...schemas.user import UserCreate, UserReplace, UserPatch, UserResponse, ChangePasswordRequest
from ...infra import transactional

# Password hashing context using Argon2 (recommended by OWASP, no 72-byte limit)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class UserServiceImpl(BaseServiceImpl[User, UserCreate, UserReplace, UserPatch, UserResponse], UserService):
    """User service implementation"""
    
    def __init__(self, db: Session, repository: UserRepository):
        super().__init__(db, repository, User, UserResponse)
        self.repository: UserRepository = repository  # Type hint for IDE
    
    @transactional
    def create(self, dto: UserCreate) -> UserResponse:
        """Create user with hashed password"""
        # Hash the password before creating entity
        user_data = dto.model_dump(exclude_unset=True)
        raw_password = user_data.pop('password')
        user_data['hashed_password'] = pwd_context.hash(raw_password)
        
        entity = User(**user_data)
        created = self.repository.create(entity)
        
        try:
            self.db.flush()
        except IntegrityError as e:
            if 'username' in str(e.orig):
                raise ValueError(f"Username '{user_data['username']}' already exists")
            raise
            
        self.db.refresh(created)
        return self._to_response(created)
    
    def get_by_username(self, username: str) -> Optional[UserResponse]:
        """Get user by username"""
        user = self.repository.find_by_username(username)
        return self._to_response(user) if user else None
    
    def authenticate(self, username: str, password: str) -> Optional[UserResponse]:
        """Authenticate user with username and password"""
        user = self.repository.find_by_username(username)
        if not user:
            return None
        
        if not pwd_context.verify(password, user.hashed_password):
            return None
        
        return self._to_response(user)
    
    @transactional
    def patch(self, entity_id: int, dto: UserPatch) -> UserResponse:
        """Partial update with username uniqueness check"""
        entity = self.repository.find_by_id(entity_id)
        if not entity:
            raise ValueError(f"User with id {entity_id} not found")
        
        # Update only provided fields
        update_data = dto.model_dump(exclude_unset=True)
        
        # Hash password if provided
        if 'password' in update_data:
            raw_password = update_data.pop('password')
            update_data['hashed_password'] = pwd_context.hash(raw_password)
        
        for key, value in update_data.items():
            if value is not None:
                setattr(entity, key, value)
        
        updated = self.repository.update(entity)
        
        try:
            self.db.flush()
        except IntegrityError as e:
            if 'username' in str(e.orig):
                raise ValueError(f"Username '{update_data.get('username', '')}' already exists")
            raise
            
        self.db.refresh(updated)
        return self._to_response(updated)
    
    @transactional
    def update(self, entity_id: int, dto: UserReplace) -> UserResponse:
        """Full update with username uniqueness check"""
        entity = self.repository.find_by_id(entity_id)
        if not entity:
            raise ValueError(f"User with id {entity_id} not found")
        
        # Update all fields from DTO
        update_data = dto.model_dump(exclude_unset=True)
        
        # Hash password
        raw_password = update_data.pop('password')
        update_data['hashed_password'] = pwd_context.hash(raw_password)
        
        for key, value in update_data.items():
            setattr(entity, key, value)
        
        updated = self.repository.update(entity)
        
        try:
            self.db.flush()
        except IntegrityError as e:
            if 'username' in str(e.orig):
                raise ValueError(f"Username '{update_data.get('username', '')}' already exists")
            raise
            
        self.db.refresh(updated)
        return self._to_response(updated)
    
    @transactional
    def change_password(self, user_id: int, dto: ChangePasswordRequest) -> bool:
        """Change user password after verifying current password"""
        user = self.repository.find_by_id(user_id)
        if not user:
            raise ValueError(f"User with id {user_id} not found")
        
        # Verify current password
        if not pwd_context.verify(dto.current_password, user.hashed_password):
            raise ValueError("Current password is incorrect")
        
        # Verify new password is different
        if pwd_context.verify(dto.new_password, user.hashed_password):
            raise ValueError("New password must be different from current password")
        
        # Hash and update new password
        user.hashed_password = pwd_context.hash(dto.new_password)
        self.repository.update(user)
        self.db.flush()
        
        return True

