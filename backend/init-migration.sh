#!/bin/bash

echo "🗃️  Initial Database Migration Setup"
echo ""

# Activate virtual environment
if [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate  # Windows (Git Bash/WSL)
else
    source venv/bin/activate      # Linux/Mac
fi

echo "Step 1/2: Creating initial migration..."
alembic revision --autogenerate -m "initial schema with all tables"

if [ $? -ne 0 ]; then
    echo "❌ Failed to create migration!"
    exit 1
fi

echo ""
echo "✅ Migration file created!"
echo ""

echo "Step 2/2: Applying migration to database..."
alembic upgrade head

if [ $? -ne 0 ]; then
    echo "❌ Failed to apply migration!"
    exit 1
fi

echo ""
echo "✅ Migration applied successfully!"
echo ""
echo "🎉 Database is ready with schema 'flashcard' and all tables!"
echo ""
echo "You can now start the server with: ./start.sh"




