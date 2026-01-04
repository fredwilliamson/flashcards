#!/bin/bash

echo "🚀 Starting FlashCard server..."
echo ""

# Activate virtual environment
if [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate  # Windows (Git Bash/WSL)
else
    source venv/bin/activate      # Linux/Mac
fi

# Apply migrations (dev mode)
echo "📦 Checking for pending migrations..."
alembic upgrade head
echo ""

# Start the server
echo "✅ Server running on http://localhost:8787"
echo "📚 Documentation at http://localhost:8787/docs"
echo ""
echo "Press CTRL+C to stop"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8787

