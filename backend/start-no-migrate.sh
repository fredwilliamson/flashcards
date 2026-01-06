#!/bin/bash

echo "🚀 Starting FlashCard API (Production Mode - No Migrations)"
echo ""
echo "⚠️ Skipping database migrations"
echo "💡 Use this if tables are already created in Supabase"
echo ""

# Start the server directly
echo "🌐 Starting server on port ${PORT:-8000}..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

