from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .config import get_settings
from .routes import user_route, card_route, deck_route, auth_route, game_route, admin_route, analytics_route
from .db_migrations import run_migrations
from .middleware import SecurityHeadersMiddleware

settings = get_settings()

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    swagger_ui_parameters={
        "persistAuthorization": True,  # Remember auth token in Swagger
    }
)

# Attach limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.on_event("startup")
def startup_event():
    """Run migrations on startup"""
    print("🚀 Running database migrations...")
    try:
        run_migrations()
    except Exception as e:
        print(f"⚠️ Migration warning: {e}")
        # Don't fail startup if migrations fail (for development)

# Security Headers (should be first)
app.add_middleware(SecurityHeadersMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "FlashCard API", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}

app.include_router(auth_route.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin_route.router, prefix="/api/admin", tags=["admin"])
app.include_router(user_route.router, prefix="/api/users", tags=["users"])
app.include_router(card_route.router, prefix="/api/cards", tags=["cards"])
app.include_router(deck_route.router, prefix="/api/decks", tags=["decks"])
app.include_router(game_route.router, prefix="/api/game", tags=["game"])
app.include_router(analytics_route.router, prefix="/api", tags=["analytics"])

