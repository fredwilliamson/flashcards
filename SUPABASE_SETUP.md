# 🗄️ Supabase Database Setup

## Why Supabase?

✅ **PostgreSQL managé** - Pas besoin de gérer l'infrastructure  
✅ **Gratuit jusqu'à 500MB** - Parfait pour débuter  
✅ **Backups automatiques** - Sécurité des données  
✅ **Interface web** - Visualisation facile des données  
✅ **SSL/TLS** - Connexions sécurisées  
✅ **Monitoring intégré** - Performance et logs  

---

## 📝 Step 1: Create a Supabase Project

1. **Go to** https://supabase.com
2. **Sign up** or log in
3. **Click "New Project"**
4. **Fill in:**
   - **Project name**: `flashcard-app` (ou autre)
   - **Database password**: Générer un mot de passe fort (⚠️ **IMPORTANT**: Sauvegarde-le !)
   - **Region**: Choisis le plus proche de toi (e.g., `Europe West`)
   - **Pricing plan**: `Free` (500MB, 2 CPU, 500k Edge Functions invocations)

5. **Click "Create new project"**
   - ⏳ Attends 2-3 minutes que le projet soit créé

---

## 🔑 Step 2: Get Connection String

1. Dans ton projet Supabase, va dans **Settings** (⚙️ icône en bas à gauche)
2. Click **Database** dans le menu de gauche
3. Scroll jusqu'à **Connection string**
4. Sélectionne l'onglet **URI**
5. **Copy** la connection string qui ressemble à :
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```

6. **⚠️ IMPORTANT**: Remplace `[YOUR-PASSWORD]` par ton vrai mot de passe (celui choisi à l'étape 1)

---

## 🔧 Step 3: Configure Environment Variables

1. **Create `.env` file** à la racine du projet :
   ```bash
   cp env.example.txt .env
   ```

2. **Edit `.env`** et remplace la valeur de `DATABASE_URL`:
   ```bash
   # Avant
   DATABASE_URL=postgresql://postgres:your-password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   
   # Après (exemple)
   DATABASE_URL=postgresql://postgres:MyStr0ngP@ssw0rd@db.abcdefghijklmnop.supabase.co:5432/postgres
   ```

3. **Vérifie** que le reste des variables sont configurées :
   ```bash
   SECRET_KEY=your-super-secret-jwt-key-change-this-to-random-string-min-32-chars
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   CORS_ORIGINS=http://localhost:5173,http://localhost:80
   ENVIRONMENT=development
   BACKEND_PORT=8000
   VITE_API_URL=http://localhost:8000
   FRONTEND_PORT=80
   ```

---

## 🛠️ Step 4: Run Database Migrations

1. **Start backend container**:
   ```bash
   docker-compose up -d backend
   ```

2. **Run Alembic migrations**:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

   Ou avec Make:
   ```bash
   make migrate
   ```

3. **Verify migration**:
   - Va dans **Supabase Dashboard > Table Editor**
   - Tu devrais voir les tables : `users`, `decks`, `cards`, `game_sessions`, `card_attempts`, etc.

---

## 🎨 Step 5: Create Initial Admin User (Optional)

Tu peux créer un utilisateur admin via l'API ou directement dans Supabase:

### Option A: Via API (recommandé)

```bash
# Start the app
docker-compose up -d

# Use the API to create admin
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!",
    "email": "admin@flashcard.com",
    "first_name": "Admin",
    "last_name": "User",
    "is_admin": true,
    "is_active": true
  }'
```

### Option B: Via Supabase Table Editor

1. Va dans **Table Editor** > **users**
2. Click **Insert row**
3. Fill les champs (⚠️ le password doit être hashé avec bcrypt)

---

## 📊 Step 6: Verify Connection

1. **Check backend logs**:
   ```bash
   docker-compose logs backend
   ```

   Tu devrais voir:
   ```
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

2. **Test API**:
   ```bash
   curl http://localhost:8000/health
   # Response: {"status":"ok"}
   ```

3. **Check database connection**:
   ```bash
   curl http://localhost:8000/docs
   # Opens Swagger UI
   ```

---

## 🔍 Monitoring & Management

### Supabase Dashboard Features

1. **Table Editor** - Visualise et édite les données
2. **SQL Editor** - Execute des requêtes SQL custom
3. **Database** - Vois les connexions, performance
4. **Logs** - Vois les logs PostgreSQL
5. **Backups** - Gère les backups (Pro plan)

### Useful SQL Queries

```sql
-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'flashcard';

-- Count users
SELECT COUNT(*) FROM flashcard.users;

-- Check recent card attempts
SELECT * FROM flashcard.card_attempts 
ORDER BY created_at DESC 
LIMIT 10;

-- View deck statistics
SELECT d.name, COUNT(c.id) as card_count
FROM flashcard.decks d
LEFT JOIN flashcard.cards c ON d.id = c.deck_id
GROUP BY d.id, d.name;
```

---

## 🔒 Security Best Practices

1. ✅ **Never commit `.env`** to git
2. ✅ **Use strong database password**
3. ✅ **Enable Row Level Security (RLS)** in Supabase (optional but recommended)
4. ✅ **Regular backups** (automatic on Supabase)
5. ✅ **Monitor connections** in Supabase Dashboard
6. ✅ **Use connection pooling** for production (Supavisor)

---

## 🚀 Production Deployment

### Connection Pooling (Recommended for Production)

Supabase fournit **Supavisor** (connection pooler):

1. Dans **Database Settings** > **Connection Pooling**
2. Use la **Transaction mode** connection string:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[HOST]:6543/postgres
   ```
3. Update `DATABASE_URL` dans ton `.env` de production

### Connection Pool Settings

```python
# In backend/app/database.py (optional optimization)
engine = create_engine(
    DATABASE_URL,
    pool_size=20,           # Max connections in pool
    max_overflow=0,         # No overflow
    pool_pre_ping=True,     # Verify connections
    pool_recycle=3600,      # Recycle after 1 hour
)
```

---

## 🆘 Troubleshooting

### Error: "password authentication failed"
- ✅ Vérifie que tu as remplacé `[YOUR-PASSWORD]` dans la connection string
- ✅ Pas d'espaces avant/après le mot de passe
- ✅ Caractères spéciaux doivent être URL-encoded

### Error: "Connection refused"
- ✅ Vérifie que ton projet Supabase est bien démarré
- ✅ Check la région (parfois latence élevée)
- ✅ Firewall/VPN peut bloquer

### Error: "SSL connection required"
- ✅ Supabase requiert SSL par défaut
- ✅ SQLAlchemy le gère automatiquement
- ✅ Si problème, ajoute `?sslmode=require` à l'URL

### Migrations fail
```bash
# Reset and retry
docker-compose exec backend alembic downgrade base
docker-compose exec backend alembic upgrade head
```

---

## 📈 Pricing & Limits

### Free Tier (Hobby)
- ✅ 500 MB database space
- ✅ 2 GB bandwidth
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests
- ✅ 500,000 Edge Function invocations

### When to Upgrade to Pro ($25/month)
- More than 500 MB data
- Need daily backups
- Need more compute resources
- Production-grade performance

---

## ✅ Checklist

- [ ] Compte Supabase créé
- [ ] Projet créé avec mot de passe fort
- [ ] Connection string copiée
- [ ] `.env` configuré avec `DATABASE_URL`
- [ ] Migrations executées (`alembic upgrade head`)
- [ ] Tables visibles dans Supabase Dashboard
- [ ] Backend se connecte avec succès
- [ ] Utilisateur admin créé

---

**🎉 Ta base de données Supabase est prête !**

Next steps:
- Start l'application : `docker-compose up -d`
- Access frontend : http://localhost
- Access API docs : http://localhost:8000/docs


