# 🐳 Docker Setup Guide

## Quick Start

### 1. Setup Supabase Database

**📚 Complete guide:** See [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

**Quick steps:**
1. Create account at https://supabase.com
2. Create a new project
3. Copy your database connection string from Settings > Database

### 2. Create `.env` file at project root

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# Backend
SECRET_KEY=your-super-secret-jwt-key-min-32-chars-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173,http://localhost:80
ENVIRONMENT=development
BACKEND_PORT=8000

# Frontend
VITE_API_URL=http://localhost:8000
FRONTEND_PORT=80
```

### 3. Build and run with Docker Compose

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop services
docker-compose down
```

### 4. Access the application

- **Frontend**: http://localhost (or http://localhost:80)
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Supabase Dashboard**: https://app.supabase.com (for database management)

### 5. Run database migrations

```bash
# Option 1: Using Make
make migrate

# Option 2: Using docker-compose
docker-compose exec backend alembic upgrade head
```

## Development Mode

For hot-reload during development:

```bash
# Start with volume mounts
docker-compose up

# Backend will auto-reload on code changes
# Frontend requires rebuild for changes
```

## Production Build

### Build optimized images

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d
```

### Environment variables for production

```bash
ENVIRONMENT=production
SECRET_KEY=<strong-random-key>
POSTGRES_PASSWORD=<strong-password>
CORS_ORIGINS=https://yourdomain.com
```

## Useful Commands

```bash
# View running containers
docker-compose ps

# View logs of specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Rebuild a specific service
docker-compose build backend

# Execute command in container
docker-compose exec backend python -c "print('Hello')"

# Run migrations
docker-compose exec backend alembic upgrade head

# Access backend shell
docker-compose exec backend bash

# Clean up everything
docker-compose down --rmi all
```

## Troubleshooting

### Port already in use

```bash
# Change ports in .env file
FRONTEND_PORT=3000
BACKEND_PORT=8001
```

### Database connection issues

1. **Check your DATABASE_URL** in `.env`
   - Ensure password is correct
   - No spaces in the connection string
   - Special characters should be URL-encoded

2. **Check Supabase project status**
   - Go to https://app.supabase.com
   - Verify your project is running

3. **Test connection from backend**
   ```bash
   docker-compose exec backend python -c "from app.database import engine; print(engine.connect())"
   ```

4. **Check backend logs**
   ```bash
   docker-compose logs backend
   ```

### Frontend not connecting to backend

Check `VITE_API_URL` in `.env` and CORS settings in backend.

## Architecture

```
┌─────────────────┐
│   Frontend      │ :80
│  (React/Nginx)  │
└────────┬────────┘
         │
         │ HTTP
         ▼
┌─────────────────┐
│    Backend      │ :8000
│    (FastAPI)    │
└────────┬────────┘
         │
         │ PostgreSQL (SSL)
         ▼
┌─────────────────────────┐
│      Supabase           │
│  (Managed PostgreSQL)   │
│  db.xxxxx.supabase.co   │
└─────────────────────────┘
```

**Note:** Database is hosted on Supabase, not in a Docker container.

## Security Notes

🔒 **Important for Production:**

1. Change all default passwords
2. Use strong SECRET_KEY (min 32 chars)
3. Enable HTTPS
4. Configure firewall rules
5. Use secrets management (AWS Secrets Manager, etc.)
6. Don't commit `.env` files to git
7. Enable rate limiting
8. Regular security updates

## Health Checks

Services include health checks:

```bash
# Backend health
curl http://localhost:8000/health

# Frontend health
curl http://localhost/health

# Database health (via Supabase Dashboard)
# Go to https://app.supabase.com > Your Project > Database
# Or test from backend:
docker-compose exec backend python -c "from app.database import engine; print('DB OK' if engine.connect() else 'DB ERROR')"
```

