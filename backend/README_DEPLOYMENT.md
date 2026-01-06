# Deployment Guide

## 🚀 Deploying to Fly.io

### Prerequisites

1. Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Create Fly.io account
3. Login: `fly auth login`

### First Deployment

**1. Setup database on Supabase:**

- Go to https://supabase.com
- Create a new project
- Get your PostgreSQL connection string from Settings > Database
- Format: `postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`

**2. Configure Fly.io:**

```bash
cd backend

# Launch (first time)
fly launch

# Set secrets
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set SECRET_KEY="your-secret-key-here"
fly secrets set ALLOWED_ORIGINS="https://your-frontend.vercel.app"
```

**3. Deploy:**

```bash
fly deploy
```

### What Happens on Deploy

The `Procfile` defines two processes:

1. **`release`**: Runs `alembic upgrade head` before deployment
   - Creates schema if needed
   - Applies all pending migrations
   - Fails deployment if migrations fail

2. **`web`**: Starts the FastAPI server

### Subsequent Deployments

```bash
# Just deploy - migrations run automatically
fly deploy
```

## 🌐 Deploying to Other Platforms

### Render

1. Connect your GitHub repo
2. Create Web Service
3. Set environment variables:
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `ALLOWED_ORIGINS`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `./start-prod.sh`

### Railway

1. Connect your GitHub repo
2. Add PostgreSQL service
3. Set environment variables
4. Start Command: `./start-prod.sh`

## 📝 Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string (from Supabase)
- `SECRET_KEY` - JWT secret (generate with `openssl rand -hex 32`)
- `ALLOWED_ORIGINS` - Comma-separated list of frontend URLs

**Optional:**
- `DEBUG` - Set to `False` in production (default)
- `PORT` - Server port (default: 8080 on Fly.io)

## 🔄 Database Migrations in Production

**Automatic:**
- Migrations run automatically on every deployment (via `release` command)

**Manual (if needed):**
```bash
# SSH into Fly.io container
fly ssh console

# Apply migrations
alembic upgrade head
```

## 🐛 Troubleshooting

**Migration fails:**
```bash
# Check migration status
fly ssh console
alembic current

# View pending migrations
alembic history

# Apply manually
alembic upgrade head
```

**Database connection issues:**
```bash
# Check secrets
fly secrets list

# Test connection
fly ssh console
psql $DATABASE_URL
```

## 📊 Health Checks

- **API**: `GET /health` - Returns 200 if healthy
- **Root**: `GET /` - Returns API info

## 🔒 Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` (32+ characters)
- [ ] `ALLOWED_ORIGINS` set to your frontend domains only
- [ ] Database credentials in secrets (not hardcoded)
- [ ] HTTPS enabled (automatic on Fly.io/Vercel)




