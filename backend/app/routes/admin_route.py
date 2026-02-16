from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from ..schemas.user import UserResponse, UserCreate
from ..schemas.admin import (
    UserStatsResponse,
    DeckStatsResponse,
    GlobalStatsResponse,
    SessionListItem,
    CardDifficultyResponse
)
from ..schemas.pagination import PaginatedResponse
from ..services.impl import UserServiceImpl, AdminServiceImpl
from ..dependencies import get_user_service, get_admin_service
from ..auth.dependencies import get_current_admin_user
from ..models.user import User

router = APIRouter(dependencies=[Depends(get_current_admin_user)])


@router.get("/stats/global", response_model=GlobalStatsResponse)
def get_global_stats(
    service: AdminServiceImpl = Depends(get_admin_service),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Get global statistics for admin dashboard.
    
    Requires: admin access
    """
    return service.get_global_stats()


@router.get("/users", response_model=PaginatedResponse[UserResponse])
def list_all_users(
    limit: int = Query(default=40, ge=1, le=10000),
    offset: int = Query(default=0, ge=0),
    service: UserServiceImpl = Depends(get_user_service),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    List all users (admin only) with pagination.
    
    Returns paginated users including inactive ones. Default limit is 40.
    """
    users = service.get_all()
    total = len(users)
    paginated_users = users[offset:offset + limit]
    
    return PaginatedResponse(
        items=paginated_users,
        total=total,
        limit=limit,
        offset=offset,
        has_more=(offset + limit) < total
    )


@router.post("/users", response_model=UserResponse, status_code=201)
def create_user_admin(
    user: UserCreate,
    service: UserServiceImpl = Depends(get_user_service),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Create a new user (admin only).
    
    Allows admin to create users with specific usernames and admin status.
    """
    try:
        return service.create(user)
    except ValueError as e:
        if 'already exists' in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(e)
            )
        raise


@router.get("/users/{user_id}/stats", response_model=UserStatsResponse)
def get_user_stats(
    user_id: int,
    service: AdminServiceImpl = Depends(get_admin_service),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Get detailed statistics for a specific user.
    
    Includes session history, success rates, etc.
    """
    return service.get_user_stats(user_id)


@router.get("/sessions", response_model=List[SessionListItem])
def list_all_sessions(
    service: AdminServiceImpl = Depends(get_admin_service),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    List all game sessions (admin monitoring).
    
    Shows sessions from all users.
    """
    return service.get_all_sessions()


@router.get("/cards/difficult", response_model=List[CardDifficultyResponse])
def get_difficult_cards(
    limit: int = 10,
    service: AdminServiceImpl = Depends(get_admin_service),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Get the most difficult cards (lowest success rate).
    
    Useful for identifying problematic content.
    """
    return service.get_difficult_cards(limit)

