"""
⚠️  DEPRECATED - Use Alembic migrations instead!

This script is kept for reference but should not be used.
Use: alembic upgrade head

See MIGRATIONS.md for details.
"""
from app.database import engine, Base
from app.models import base_entity, user, deck, card, progress

print("⚠️  WARNING: This script is deprecated!")
print("📖 Please use Alembic migrations instead:")
print("")
print("  1. Create migration: alembic revision --autogenerate -m 'initial'")
print("  2. Apply migration:  alembic upgrade head")
print("")
print("See MIGRATIONS.md for full guide.")
print("")

# Uncomment below ONLY if you really need direct table creation (not recommended)
# Base.metadata.create_all(bind=engine)

