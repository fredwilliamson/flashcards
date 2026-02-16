from fastapi import APIRouter, Depends, HTTPException, Query
from ..schemas.user import UserResponse, UserPatch, UserReplace, UserCreate, ChangePasswordRequest, ChangePasswordResponse
from ..schemas.pagination import PaginatedResponse
from ..services.impl import UserServiceImpl
from ..dependencies import get_user_service
from ..auth.dependencies import get_current_active_user
from ..models.user import User

router = APIRouter(dependencies=[Depends(get_current_active_user)])


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, service: UserServiceImpl = Depends(get_user_service)):
    """Get user by ID"""
    user = service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/", response_model=PaginatedResponse[UserResponse])
def get_users(
    limit: int = Query(default=40, ge=1, le=10000),
    offset: int = Query(default=0, ge=0),
    service: UserServiceImpl = Depends(get_user_service)
):
    """Get all users with pagination"""
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


@router.post("/", response_model=UserResponse, status_code=201)
def create_user(user: UserCreate, service: UserServiceImpl = Depends(get_user_service)):
    """Create a new user"""
    return service.create(user)


@router.patch("/{user_id}", response_model=UserResponse)
def patch_user(
    user_id: int, 
    user: UserPatch, 
    service: UserServiceImpl = Depends(get_user_service),
    current_user: User = Depends(get_current_active_user)
):
    """Partial update of a user"""
    # Prevent current user from removing admin rights or deactivating themselves
    if user_id == current_user.id:
        if user.is_admin is False:
            raise HTTPException(status_code=403, detail="Cannot remove admin rights from your own account")
        if user.is_active is False:
            raise HTTPException(status_code=403, detail="Cannot deactivate your own account")
    
    try:
        return service.patch(user_id, user)
    except ValueError as e:
        if 'already exists' in str(e):
            raise HTTPException(status_code=409, detail=str(e))
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{user_id}", response_model=UserResponse)
def replace_user(
    user_id: int, 
    user: UserReplace, 
    service: UserServiceImpl = Depends(get_user_service),
    current_user: User = Depends(get_current_active_user)
):
    """Full replacement of a user"""
    # Prevent current user from removing admin rights or deactivating themselves
    if user_id == current_user.id:
        if user.is_admin is False:
            raise HTTPException(status_code=403, detail="Cannot remove admin rights from your own account")
        if user.is_active is False:
            raise HTTPException(status_code=403, detail="Cannot deactivate your own account")
    
    try:
        return service.update(user_id, user)
    except ValueError as e:
        if 'already exists' in str(e):
            raise HTTPException(status_code=409, detail=str(e))
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int, 
    service: UserServiceImpl = Depends(get_user_service),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a user"""
    # Prevent current user from deleting themselves
    if user_id == current_user.id:
        raise HTTPException(status_code=403, detail="Cannot delete your own account")
    
    if not service.delete(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return None


@router.patch("/me/password", response_model=ChangePasswordResponse)
def change_my_password(
    request: ChangePasswordRequest,
    service: UserServiceImpl = Depends(get_user_service),
    current_user: User = Depends(get_current_active_user)
):
    """Change current user's password"""
    try:
        service.change_password(current_user.id, request)
        return ChangePasswordResponse(message="Password changed successfully")
    except ValueError as e:
        if "incorrect" in str(e).lower():
            raise HTTPException(status_code=401, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
