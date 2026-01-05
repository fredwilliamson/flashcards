#!/bin/bash

echo "🚀 Starting FlashCard API (Production Mode)"
echo ""

# Apply database migrations
echo "📦 Applying database migrations..."
alembic upgrade head

if [ $? -ne 0 ]; then
    echo "❌ Migration failed!"
    exit 1
fi

echo "✅ Migrations applied successfully"
echo ""

# Start the server
echo "🌐 Starting server on port ${PORT:-8000}..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}



