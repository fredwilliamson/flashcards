#!/bin/bash

echo "🔄 Alembic Migration Helper"
echo ""

# Activate virtual environment
if [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate  # Windows (Git Bash/WSL)
else
    source venv/bin/activate      # Linux/Mac
fi

case "$1" in
    "create")
        echo "📝 Creating new migration: $2"
        alembic revision --autogenerate -m "$2"
        ;;
    "up")
        echo "⬆️  Applying all pending migrations..."
        alembic upgrade head
        ;;
    "down")
        echo "⬇️  Rolling back last migration..."
        alembic downgrade -1
        ;;
    "history")
        echo "📜 Migration history:"
        alembic history
        ;;
    "current")
        echo "📍 Current migration:"
        alembic current
        ;;
    *)
        echo "Usage:"
        echo "  ./migrate.sh create \"migration message\"  - Create new migration"
        echo "  ./migrate.sh up                           - Apply migrations"
        echo "  ./migrate.sh down                         - Rollback last migration"
        echo "  ./migrate.sh history                      - Show migration history"
        echo "  ./migrate.sh current                      - Show current migration"
        ;;
esac




