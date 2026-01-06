# 🚂 Déploiement sur Railway

Railway est **recommandé** pour ce projet car il n'a pas de restrictions réseau avec Supabase.

## Prérequis

- Compte Railway : https://railway.app
- $5 de crédit gratuit/mois (largement suffisant)

## Étapes

### 1. Installer Railway CLI

```bash
npm i -g @railway/cli
```

### 2. Login

```bash
railway login
```

### 3. Créer un nouveau projet

```bash
railway init
```

Sélectionne :
- Create a new project
- Nom : FlashCard-Backend

### 4. Ajouter les variables d'environnement

```bash
# Database URL (Supabase)
railway variables set DATABASE_URL="postgresql://postgres.wxikshsaicmaboeelphe:[PASSWORD]@db.wxikshsaicmaboeelphe.supabase.co:5432/postgres"

# JWT Secret
railway variables set SECRET_KEY="your-super-secret-key-here"

# Algorithm
railway variables set ALGORITHM="HS256"

# Token expiration (minutes)
railway variables set ACCESS_TOKEN_EXPIRE_MINUTES="30"

# CORS origins
railway variables set CORS_ORIGINS="https://your-frontend.vercel.app,http://localhost:5173"
```

### 5. Déployer

```bash
cd backend
railway up
```

Railway va :
- Build le Docker image
- Exécuter les migrations Alembic
- Démarrer le serveur
- Générer une URL publique

### 6. Obtenir l'URL

```bash
railway domain
```

Ou depuis le dashboard Railway → Settings → Generate Domain

### 7. Tester

```bash
curl https://your-app.up.railway.app/health
```

## Frontend (Vercel)

Met à jour la variable `VITE_API_URL` sur Vercel :

```
VITE_API_URL=https://your-app.up.railway.app
```

Redéploie le frontend.

## Avantages Railway vs Render

✅ **Pas de restrictions IPv6**  
✅ **Déploiement ultra-rapide** (30s vs 5min)  
✅ **Logs en temps réel** dans le CLI  
✅ **Rollback en 1 clic**  
✅ **Metrics built-in**  
✅ **$5 gratuit/mois** (vs cold start sur Render)  

## Coûts

- $5 de crédit gratuit/mois
- Après : ~$5-10/mois pour usage normal
- Pas de cold start (contrairement à Render Free)

## Alternative : Fly.io

Si tu préfères Fly.io, utilise `fly.toml` déjà présent dans le projet.

```bash
fly launch --config fly.toml
fly deploy
```


