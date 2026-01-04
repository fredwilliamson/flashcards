.PHONY: help build up down logs restart clean migrate seed test

# Default target
help:
	@echo "FlashCard App - Docker Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  build      - Build all Docker images"
	@echo "  up         - Start all services"
	@echo "  down       - Stop all services"
	@echo "  logs       - View logs (all services)"
	@echo "  logs-f     - Follow logs (all services)"
	@echo "  logs-be    - View backend logs"
	@echo "  logs-fe    - View frontend logs"
	@echo "  restart    - Restart all services"
	@echo "  restart-be - Restart backend only"
	@echo "  restart-fe - Restart frontend only"
	@echo "  clean      - Stop and remove all containers"
	@echo "  migrate    - Run database migrations (Supabase)"
	@echo "  migration  - Create new migration"
	@echo "  shell-be   - Open shell in backend container"
	@echo "  ps         - Show running containers"
	@echo "  test       - Run tests"

# Build all images
build:
	docker-compose build

# Start services in detached mode
up:
	docker-compose up -d

# Start services with logs
up-logs:
	docker-compose up

# Stop all services
down:
	docker-compose down

# View logs
logs:
	docker-compose logs

# Follow logs
logs-f:
	docker-compose logs -f

# Backend logs
logs-be:
	docker-compose logs -f backend

# Frontend logs
logs-fe:
	docker-compose logs -f frontend

# Restart all services
restart:
	docker-compose restart

# Restart backend
restart-be:
	docker-compose restart backend

# Restart frontend
restart-fe:
	docker-compose restart frontend

# Show running containers
ps:
	docker-compose ps

# Clean up everything
clean:
	docker-compose down --rmi local
	@echo "✓ All containers and images removed"

# Run database migrations
migrate:
	docker-compose exec backend alembic upgrade head

# Create new migration
migration:
	@read -p "Enter migration message: " msg; \
	docker-compose exec backend alembic revision --autogenerate -m "$$msg"

# Open backend shell
shell-be:
	docker-compose exec backend bash

# Run tests (backend)
test:
	docker-compose exec backend pytest

# Rebuild specific service
rebuild-be:
	docker-compose build backend
	docker-compose up -d backend

rebuild-fe:
	docker-compose build frontend
	docker-compose up -d frontend

# Full reset (clean + build + up)
reset: clean build up
	@echo "✓ Full reset complete"

# Development setup
dev: build up migrate
	@echo "✓ Development environment ready"
	@echo "Frontend:  http://localhost"
	@echo "Backend:   http://localhost:8000"
	@echo "API Docs:  http://localhost:8000/docs"
	@echo "Database:  Supabase (https://app.supabase.com)"

