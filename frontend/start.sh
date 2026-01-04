#!/bin/bash

echo "🚀 Starting FlashCard Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start dev server
echo "✅ Starting Vite dev server on http://localhost:5173"
npm run dev



