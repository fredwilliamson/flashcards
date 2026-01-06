#!/bin/bash

echo "🚀 Starting FlashCard API (Production Mode)"
echo ""

# Apply database migrations with retry logic
echo "📦 Applying database migrations..."

MAX_RETRIES=5
RETRY_DELAY=10  # Increased to 10s for DB wake-up

for i in $(seq 1 $MAX_RETRIES); do
    echo "Attempt $i/$MAX_RETRIES..."
    alembic upgrade head
    
    if [ $? -eq 0 ]; then
        echo "✅ Migrations applied successfully"
        break
    else
        if [ $i -eq $MAX_RETRIES ]; then
            echo "⚠️ Migration failed after $MAX_RETRIES attempts"
            echo "⚠️ Starting server anyway (tables may already exist)..."
        else
            echo "⚠️ Migration failed, retrying in ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        fi
    fi
done

echo ""

# Export flag to skip migrations in app startup (avoid double migration)
export SKIP_STARTUP_MIGRATIONS=true

# Start the server
echo "🌐 Starting server on port ${PORT:-8000}..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}



