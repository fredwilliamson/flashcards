from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from ..auth.schemas import LoginRequest, TokenResponse
from ..auth.jwt import create_access_token
from ..schemas.user import UserResponse
from ..services.impl import UserServiceImpl
from ..dependencies import get_user_service
from ..auth.dependencies import get_current_active_user
from ..models.user import User

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")  # Max 5 login attempts per minute per IP
def login(
    request: Request,
    credentials: LoginRequest,
    service: UserServiceImpl = Depends(get_user_service)
):
    """
    Login with username and password, returns JWT token.
    
    Rate limit: 5 attempts per minute per IP address to prevent brute force attacks.
    """
    # Authenticate user
    user = service.authenticate(credentials.username, credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.username})
    
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    """
    Get current authenticated user info.
    """
    from ..schemas.user import UserResponse
    return UserResponse.model_validate(current_user)

