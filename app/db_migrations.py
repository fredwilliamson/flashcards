from alembic.config import Config
from alembic import command
import os


def run_migrations():
    """
    Run Alembic migrations (upgrade to head) automatically.
    
    This is useful for development and deployment to ensure
    the database schema is always up to date.
    """
    # Get the alembic.ini path (relative to backend/)
    alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))
    
    # Run upgrade to head
    command.upgrade(alembic_cfg, "head")
    print("✅ Database migrations completed successfully")



