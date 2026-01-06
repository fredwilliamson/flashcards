#!/bin/bash

echo "🚀 Starting FlashCard API (Production Mode)"
echo ""

# Skip migrations for now - run manually after server is up
echo "⏭️ Skipping migrations (run manually if needed)"
echo ""

# Export flag to skip migrations in app startup (avoid double migration)
export SKIP_STARTUP_MIGRATIONS=true

# Start the server
echo "🌐 Starting server on port ${PORT:-8000}..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}



