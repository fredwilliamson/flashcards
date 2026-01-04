#!/bin/bash

echo "🎓 Installing FlashCard project"
echo ""

echo "Step 1/4: Creating virtual environment..."
python -m venv venv
if [ $? -ne 0 ]; then
    echo "❌ Error: Python is not installed or not in PATH"
    exit 1
fi
echo "✅ Virtual environment created"
echo ""

echo "Step 2/4: Activating environment..."
if [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate  # Windows (Git Bash/WSL)
else
    source venv/bin/activate      # Linux/Mac
fi
echo "✅ Environment activated"
echo ""

echo "Step 3/4: Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Error during installation"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

echo "Step 4/4: Creating database tables..."
python setup.py
echo ""

echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Make sure PostgreSQL is running (docker start flashcard-db)"
echo "2. Start the server with: ./start.sh"
echo ""

