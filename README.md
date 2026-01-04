# 🎴 FlashCard App

A modern, full-stack flashcard application for efficient learning and spaced repetition.

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

## ✨ Features

### 👨‍🎓 For Students
- 📚 Browse and practice public flashcard decks
- 📊 Track your progress and performance
- 🎯 Spaced repetition algorithm for optimal learning
- 📈 Detailed statistics per deck and card
- 🔥 Current streak tracking
- 🌓 Dark mode support
- 🌍 Bilingual interface (English/French)

### 👨‍🏫 For Administrators
- 👥 User management (create, edit, deactivate)
- 📦 Deck management (public/private visibility)
- 🃏 Card management with CSV import
- 📊 Analytics dashboard (platform overview)
- 📉 User progress tracking
- 🎯 Deck analytics (difficult cards, success rates)
- 🔍 Advanced search and filtering

## 🏗️ Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │─────▶│   Backend    │─────▶│  PostgreSQL  │
│  React/Vite  │      │   FastAPI    │      │   Database   │
│    Nginx     │      │    Python    │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
```

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Query (data fetching)
- React Router (routing)
- i18next (internationalization)

**Backend:**
- FastAPI (Python framework)
- SQLAlchemy (ORM)
- Alembic (migrations)
- Supabase (PostgreSQL managed)
- JWT authentication
- Pydantic (validation)

**DevOps:**
- Docker & Docker Compose
- Nginx (reverse proxy)
- Multi-stage builds

## 🚀 Quick Start with Docker

### Prerequisites
- Docker & Docker Compose installed
- Git
- Supabase account (free tier available)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd FlashCard
   ```

2. **Setup Supabase database**
   - Create a free account at https://supabase.com
   - Create a new project
   - Get your database connection string
   - See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions

3. **Create `.env` file**
   ```bash
   cp env.example.txt .env
   # Edit .env with your Supabase DATABASE_URL and other values
   ```

4. **Start the application**
   ```bash
   make dev
   # OR
   docker-compose up -d
   ```

5. **Run migrations**
   ```bash
   make migrate
   # OR
   docker-compose exec backend alembic upgrade head
   ```

5. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Useful Commands

```bash
make build      # Build Docker images
make up         # Start services
make down       # Stop services
make logs       # View logs
make migrate    # Run migrations
make test       # Run tests
make clean      # Clean up everything
```

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed Docker instructions.

## 🛠️ Local Development (without Docker)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
# Edit app/config.py with your database URL

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: User accounts (admin/student roles)
- **Decks**: Collections of flashcards
- **Cards**: Individual flashcards with Q&A
- **GameSessions**: Practice sessions
- **CardAttempts**: Individual card attempts for analytics
- **Progress**: User progress tracking

## 🔐 Authentication

- JWT-based authentication
- Role-based access control (Admin/Student)
- Secure password hashing (bcrypt)
- Token expiration and refresh

## 📝 API Documentation

Interactive API documentation available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test
```

## 🚀 Deployment to Production

Deploy your app **for FREE** in ~10 minutes!

### Quick Deploy (Recommended)

**Step-by-step guide**: [QUICK_DEPLOY.md](QUICK_DEPLOY.md) ⚡

**Recommended stack (100% free)**:
- 🎨 **Frontend**: Vercel (unlimited deployments, 100GB bandwidth/month)
- 🔧 **Backend**: Render (750h/month = 24/7 free)
- 🗄️ **Database**: Supabase (500MB, auto backups) ✅

### Complete Deployment Guide

For all deployment options and detailed instructions:

📚 **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete guide with:
- Multiple hosting options (Vercel, Netlify, Render, Railway, Fly.io)
- Step-by-step setup for each platform
- Environment configuration
- Security best practices
- Monitoring & logging
- Troubleshooting
- Cost breakdown

### Documentation

- 🐳 [Docker Setup](DOCKER_SETUP.md) - Run locally with Docker
- 🗄️ [Supabase Setup](SUPABASE_SETUP.md) - Database configuration
- ⚡ [Quick Deploy](QUICK_DEPLOY.md) - 10-minute production deploy
- 📚 [Full Deployment](DEPLOYMENT.md) - Complete deployment guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- FastAPI framework
- React ecosystem
- PostgreSQL database
- Docker containerization

---

**Made with ❤️ for efficient learning**
