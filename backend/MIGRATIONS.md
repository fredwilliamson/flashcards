# Database Migrations Guide

This project uses **Alembic** for database migrations (like EF Core or Liquibase).

## 🚀 Quick Start

**First time setup:**

```bash
cd backend

# Install dependencies (if not done)
pip install -r requirements.txt

# Create initial migration
alembic revision --autogenerate -m "initial schema with flashcard namespace"

# Apply migration
alembic upgrade head
```

## 📝 Common Commands

### Create a new migration

```bash
# Auto-generate from model changes
alembic revision --autogenerate -m "add email to users"

# Or using the helper script
./migrate.sh create "add email to users"
```

### Apply migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Or using helper
./migrate.sh up
```

### Rollback

```bash
# Rollback last migration
alembic downgrade -1

# Or using helper
./migrate.sh down

# Rollback to specific version
alembic downgrade <revision_id>
```

### View history

```bash
# See all migrations
alembic history

# See current version
alembic current

# Or using helper
./migrate.sh history
./migrate.sh current
```

## 🔄 Workflow

**1. Modify your models** (e.g., add a field to User):

```python
# app/models/user.py
class User(BaseEntity):
    email = Column(String)  # New field
```

**2. Generate migration:**

```bash
alembic revision --autogenerate -m "add email to users"
```

**3. Review the generated migration** in `alembic/versions/xxxxx_add_email_to_users.py`

**4. Apply it:**

```bash
alembic upgrade head
```

**5. If mistake, rollback:**

```bash
alembic downgrade -1
```

## 📁 Schema

All tables are in the `flashcard` schema (not `public`).

The schema is created automatically on first migration.

## 🗑️ Reset Everything (DEV ONLY)

**⚠️ This will delete ALL data!**

```bash
# In psql or pgAdmin
DROP SCHEMA flashcard CASCADE;

# Then re-run migrations
alembic upgrade head
```

## 🎯 Important Notes

- **Always review** auto-generated migrations before applying
- **Never edit** applied migrations (create a new one instead)
- **Commit migrations** to git with your code changes
- **Schema name** is `flashcard` (defined in BaseEntity)




