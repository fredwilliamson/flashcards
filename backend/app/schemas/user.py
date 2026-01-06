from pydantic import BaseModel
from typing import Optional
from .base_schema import BaseSchema


class UserBase(BaseModel):
    """Base user fields"""
    username: str
    first_name: str
    last_name: str


class UserCreate(UserBase):
    """Schema for creating a user"""
    password: str
    is_admin: bool = False
    is_active: bool = True


class UserResponse(BaseSchema, UserBase):
    """Schema for user response (what we send back)"""
    is_active: bool
    is_admin: bool


class UserPatch(BaseModel):
    """Schema for PATCH - partial update of a user"""
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


class UserReplace(UserBase):
    """Schema for PUT - full replacement of a user"""
    password: str
    is_admin: bool = False
    is_active: bool = True


class ChangePasswordRequest(BaseModel):
    """Schema for changing password"""
    current_password: str
    new_password: str


class ChangePasswordResponse(BaseModel):
    """Response after password change"""
    message: str