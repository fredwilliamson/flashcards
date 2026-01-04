#!/bin/bash

echo "🗄️  Creating flashcard database..."
echo ""

# Extract database info from .env
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

# Try to create database using docker (assumes postgres container is running)
echo "Attempting to create database in Docker container..."
echo ""
echo "If you see 'database already exists', that's OK!"
echo ""

# Common container names to try
containers=("postgres" "flashcard-db" "postgres-db" "db")

for container in "${containers[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        echo "Found container: $container"
        docker exec -it $container psql -U postgres -c "CREATE DATABASE flashcard;" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ Database 'flashcard' created successfully!"
            exit 0
        fi
    fi
done

echo ""
echo "⚠️  Could not find a running PostgreSQL container."
echo ""
echo "Run this manually:"
echo "  docker exec -it YOUR_CONTAINER_NAME psql -U postgres -c \"CREATE DATABASE flashcard;\""
echo ""
echo "Or connect to your PostgreSQL and run:"
echo "  CREATE DATABASE flashcard;"



