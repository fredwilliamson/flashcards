# 🚀 Déploiement Gratuit - FlashCard App

Guide complet pour déployer l'application **gratuitement** en production.

---

## 📋 Stack de déploiement recommandée (100% gratuit)

| Service | Hébergement | Free Tier |
|---------|------------|-----------|
| **Frontend** | Vercel | Unlimited deployments, 100GB bandwidth/mois |
| **Backend** | Render | 750h/mois (suffisant pour 1 service 24/7) |
| **Database** | Supabase | 500MB, 2GB bandwidth |

**Total: 0€/mois** ✅

---

## 🎨 Option 1: Frontend - Vercel (Recommandé)

### Pourquoi Vercel ?
- ✅ Déploiement automatique depuis Git
- ✅ CDN global
- ✅ HTTPS automatique
- ✅ Preview deployments pour chaque PR
- ✅ Très rapide
- ✅ 100GB bandwidth/mois gratuit

### Setup

1. **Push ton code sur GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Vercel account**
   - Va sur https://vercel.com
   - Sign up with GitHub

3. **Import project**
   - Click "Add New..." → "Project"
   - Select ton repo `FlashCard`
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`

4. **Configure environment variables**
   ```bash
   VITE_API_URL=https://ton-backend.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - ⏳ Attends 2-3 minutes
   - 🎉 Ton frontend est live sur `https://flashcard-xyz.vercel.app`

### Build settings
```bash
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

---

## 🔧 Option 1 bis: Frontend - Netlify

Alternative à Vercel, tout aussi bien.

### Setup rapide
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy (from frontend folder)
cd frontend
netlify deploy --prod
```

**Free tier**: 100GB bandwidth, continuous deployment, HTTPS automatique.

---

## 🐍 Option 2: Backend - Render (Recommandé)

### Pourquoi Render ?
- ✅ 750 heures/mois gratuites (= 1 service 24/7)
- ✅ Support Docker natif
- ✅ Auto-deploy depuis Git
- ✅ HTTPS automatique
- ✅ Logs gratuits
- ⚠️ Service s'endort après 15min d'inactivité (cold start ~30s)

### Setup

1. **Create Render account**
   - Va sur https://render.com
   - Sign up with GitHub

2. **Create new Web Service**
   - Click "New +" → "Web Service"
   - Connect ton repo GitHub
   - Select `FlashCard`

3. **Configure service**
   ```
   Name: flashcard-backend
   Region: Frankfurt (ou le plus proche)
   Branch: main
   Root Directory: backend
   Runtime: Docker
   Instance Type: Free
   ```

4. **Environment variables**
   ```bash
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   SECRET_KEY=your-super-secret-jwt-key-min-32-chars
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   CORS_ORIGINS=https://flashcard-xyz.vercel.app
   ENVIRONMENT=production
   ```

5. **Create Dockerfile for production** (si pas déjà fait)
   Render va automatiquement détecter le `Dockerfile` dans `backend/`

6. **Deploy**
   - Click "Create Web Service"
   - ⏳ Attends 5-10 minutes
   - 🎉 Backend live sur `https://flashcard-backend.onrender.com`

7. **Run migrations**
   ```bash
   # Via Render Shell (dans le dashboard)
   alembic upgrade head
   ```

### ⚠️ Note sur le Free Tier
- Le service s'endort après 15min d'inactivité
- Premier appel après sommeil = ~30s de cold start
- Pour éviter: utilise un cron job pour ping toutes les 14 minutes (voir section Monitoring)

---

## 🚀 Option 2 bis: Backend - Railway

Alternative moderne à Render.

### Pourquoi Railway ?
- ✅ 500h/mois gratuites
- ✅ $5 de crédit gratuit/mois
- ✅ Pas de cold start
- ✅ Support Docker
- ✅ Interface moderne

### Setup

1. **Create account**: https://railway.app
2. **New Project** → Deploy from GitHub repo
3. **Select** `backend` folder
4. **Add environment variables** (mêmes que Render)
5. **Deploy**

**URL**: `https://flashcard-backend.up.railway.app`

---

## 🐳 Option 3: Backend - Fly.io

### Pourquoi Fly.io ?
- ✅ Free tier généreux (3 VMs, 3GB RAM total)
- ✅ Pas de cold start
- ✅ Docker natif
- ✅ Deploy global (edge)

### Setup

1. **Install Fly CLI**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Create app** (depuis `backend/`)
   ```bash
   cd backend
   fly launch --no-deploy
   ```

4. **Configure fly.toml**
   ```toml
   app = "flashcard-backend"
   primary_region = "cdg" # Paris
   
   [build]
   
   [env]
     ENVIRONMENT = "production"
   
   [[services]]
     internal_port = 8000
     protocol = "tcp"
   
     [[services.ports]]
       port = 80
       handlers = ["http"]
     
     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]
   ```

5. **Set secrets**
   ```bash
   fly secrets set DATABASE_URL="postgresql://..."
   fly secrets set SECRET_KEY="your-secret-key"
   fly secrets set CORS_ORIGINS="https://flashcard-xyz.vercel.app"
   ```

6. **Deploy**
   ```bash
   fly deploy
   ```

7. **Run migrations**
   ```bash
   fly ssh console
   alembic upgrade head
   exit
   ```

**URL**: `https://flashcard-backend.fly.dev`

---

## 🗄️ Database - Supabase (Déjà configuré)

Tu as déjà Supabase ! ✅

**Free tier**:
- 500 MB database
- 2 GB bandwidth
- Unlimited API requests
- Automatic backups
- SSL/TLS

**Rien à faire de plus**, c'est déjà prêt.

---

## 🔄 Workflow de déploiement complet

### 1. Setup initial

```bash
# 1. Create Supabase project
# https://supabase.com → New Project

# 2. Push to GitHub
git add .
git commit -m "Production ready"
git push origin main

# 3. Deploy Frontend (Vercel)
# https://vercel.com → Import Project → flashcard

# 4. Deploy Backend (Render)
# https://render.com → New Web Service → flashcard
```

### 2. Configure environment variables

**Vercel (Frontend)**:
```bash
VITE_API_URL=https://flashcard-backend.onrender.com
```

**Render (Backend)**:
```bash
DATABASE_URL=postgresql://postgres:XXX@db.xxx.supabase.co:5432/postgres
SECRET_KEY=generate-strong-random-key-32-chars-minimum
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=https://flashcard-xyz.vercel.app
ENVIRONMENT=production
```

### 3. Deploy

**Frontend** (auto):
- Chaque push sur `main` → déploiement automatique sur Vercel

**Backend** (auto):
- Chaque push sur `main` → déploiement automatique sur Render

### 4. Run migrations

**Via Render Shell**:
```bash
# Dans le dashboard Render
# Shell → Connect
alembic upgrade head
```

---

## 🛡️ Configuration de production

### Backend: `backend/app/core/config.py`

Assure-toi d'avoir:

```python
class Settings(BaseSettings):
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"
    
    # Database
    DATABASE_URL: str
    
    # Environment
    ENVIRONMENT: str = "development"
    
    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False
```

### Backend: `backend/app/main.py`

```python
from fastapi.middleware.cors import CORSMiddleware

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🎯 Résumé des URLs

Après déploiement, tu auras:

```
Frontend:  https://flashcard-xyz.vercel.app
Backend:   https://flashcard-backend.onrender.com
API Docs:  https://flashcard-backend.onrender.com/docs
Database:  https://app.supabase.com (dashboard)
```

---

## 🔍 Monitoring & Logs

### Frontend (Vercel)
- Dashboard: https://vercel.com/dashboard
- Logs en temps réel
- Analytics intégrées
- Error tracking

### Backend (Render)
- Dashboard: https://dashboard.render.com
- Logs en temps réel
- Métriques (CPU, RAM, requests)
- Events & deployments

### Database (Supabase)
- Dashboard: https://app.supabase.com
- Query performance
- Connection pooling
- Backup management

---

## ⏰ Éviter le Cold Start (Render Free Tier)

Le service Render gratuit s'endort après 15 min. Pour le garder actif:

### Option A: Cron Job (UptimeRobot)

1. **Create account**: https://uptimerobot.com (gratuit)
2. **Add Monitor**:
   - Type: HTTP(s)
   - URL: `https://flashcard-backend.onrender.com/health`
   - Interval: 5 minutes
3. **Save**

Ton backend sera pingé toutes les 5 minutes → pas de cold start.

### Option B: GitHub Actions (Cron)

Créer `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Backend Alive

on:
  schedule:
    # Toutes les 14 minutes
    - cron: '*/14 * * * *'
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping backend
        run: curl https://flashcard-backend.onrender.com/health
```

---

## 🔐 Sécurité en production

### ✅ Checklist

- [ ] **SECRET_KEY** fort (32+ chars, aléatoire)
- [ ] **CORS** configuré uniquement pour ton domaine frontend
- [ ] **HTTPS** activé (automatique sur Vercel/Render)
- [ ] **Environment variables** dans les dashboards (pas dans le code)
- [ ] **`.env`** dans `.gitignore` (ne jamais commit)
- [ ] **Database password** fort
- [ ] **Supabase Row Level Security** (optionnel mais recommandé)
- [ ] **Rate limiting** (voir section suivante)

### Rate Limiting (optionnel)

Ajouter dans `backend/requirements.txt` (ou `pyproject.toml`):
```txt
slowapi==0.1.9
```

Dans `backend/app/main.py`:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/some-endpoint")
@limiter.limit("10/minute")
async def limited_endpoint(request: Request):
    return {"message": "Limited"}
```

---

## 💰 Coûts estimés

### Free Tier Limits

**Vercel (Frontend)**:
- 100GB bandwidth/mois
- Unlimited deployments
- **Coût**: 0€
- **Largement suffisant pour**: 10,000+ utilisateurs/mois

**Render (Backend)**:
- 750h/mois (1 service 24/7 = 744h)
- 512 MB RAM
- **Coût**: 0€
- **Limitations**: Cold start après 15min
- **Upgrade to paid ($7/mois)**: Pas de cold start, 512MB RAM

**Supabase (Database)**:
- 500 MB storage
- 2 GB bandwidth
- **Coût**: 0€
- **Suffisant pour**: ~5,000 users, 50,000 cards
- **Upgrade to Pro ($25/mois)**: 8GB storage, daily backups

### Quand payer ?

**Tu peux rester 100% gratuit jusqu'à:**
- ~1,000 utilisateurs actifs/mois
- ~10,000 cartes en DB
- ~100,000 requêtes API/mois

**Après, considère:**
- Render paid ($7/mois) → Pas de cold start
- Ou Railway ($5 crédit/mois) → Meilleure performance

---

## 🚀 Commandes rapides

### Deploy tout en une fois

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy to production"
git push origin main

# 2. Vercel (Frontend) - auto deploy ✅

# 3. Render (Backend) - auto deploy ✅

# 4. Run migrations (manual)
# Via Render Shell:
alembic upgrade head
```

---

## 🆘 Troubleshooting

### Frontend ne se connecte pas au backend

**Check**:
1. `VITE_API_URL` dans Vercel env vars
2. CORS dans backend (`CORS_ORIGINS` doit inclure ton domaine Vercel)
3. Backend est bien actif (pas en cold start)

**Fix**:
```bash
# Redeploy frontend avec bonne env var
vercel env add VITE_API_URL production
# Puis redeploy
```

### Backend crash au démarrage

**Check Render logs**:
```bash
# Common issues:
- DATABASE_URL incorrect
- SECRET_KEY manquant
- Dependances manquantes
```

### Database connection failed

**Check**:
1. `DATABASE_URL` correct dans Render
2. Supabase project actif
3. Password correct (pas de caractères spéciaux non-encodés)

**Fix**:
```bash
# URL-encode le password si caractères spéciaux
# Exemple: p@ss = p%40ss
```

---

## ✅ Checklist finale

- [ ] Supabase project créé
- [ ] Repo sur GitHub
- [ ] Frontend déployé sur Vercel
- [ ] Backend déployé sur Render
- [ ] Environment variables configurées
- [ ] Migrations executées
- [ ] CORS configuré correctement
- [ ] UptimeRobot configuré (optionnel)
- [ ] App testée en production
- [ ] Compte admin créé

---

## 🎉 Félicitations !

Ton app est maintenant **en production, 100% gratuite** ! 🚀

**Prochaines étapes**:
1. Partage l'URL avec tes utilisateurs
2. Monitor les logs et performances
3. Itère et améliore
4. Scale quand nécessaire

**Liens utiles**:
- Frontend: https://vercel.com/docs
- Backend: https://render.com/docs
- Database: https://supabase.com/docs


