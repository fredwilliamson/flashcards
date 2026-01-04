# ⚡ Quick Deploy Guide - 10 minutes

Guide ultra-rapide pour déployer l'app en production (gratuit).

---

## 🎯 Stack choisie

- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase (déjà configuré)

**Coût total: 0€/mois**

---

## 📝 Checklist (à faire dans l'ordre)

### ✅ 1. Database (2 minutes)

- [ ] Compte Supabase créé
- [ ] Projet créé
- [ ] Connection string copiée

**URL**: https://supabase.com

---

### ✅ 2. Backend (3 minutes)

1. **Go to** https://render.com
2. **Sign up** avec GitHub
3. **New Web Service**
4. **Connect** ton repo `FlashCard`
5. **Configure**:
   ```
   Name: flashcard-backend
   Region: Frankfurt
   Branch: main
   Root Directory: backend
   Runtime: Docker
   Instance Type: Free
   ```

6. **Add Environment Variables**:
   ```bash
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   SECRET_KEY=ton-secret-key-tres-long-minimum-32-caracteres-aleatoire
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   CORS_ORIGINS=https://ton-frontend.vercel.app
   ENVIRONMENT=production
   ```

7. **Create Web Service** → Attends 5-10 min
8. **Note l'URL** (exemple: `https://flashcard-backend.onrender.com`)
9. **Run migration**:
   - Dans le dashboard Render
   - Click "Shell"
   - Run: `alembic upgrade head`

---

### ✅ 3. Frontend (2 minutes)

1. **Go to** https://vercel.com
2. **Sign up** avec GitHub
3. **Import Project**
4. **Select** ton repo `FlashCard`
5. **Configure**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

6. **Add Environment Variable**:
   ```bash
   VITE_API_URL=https://flashcard-backend.onrender.com
   ```

7. **Deploy** → Attends 2-3 min
8. **Note l'URL** (exemple: `https://flashcard-xyz.vercel.app`)

---

### ✅ 4. Update CORS (1 minute)

1. **Return to Render** dashboard
2. **Edit** `CORS_ORIGINS` environment variable
3. **Set** ton URL Vercel: `https://flashcard-xyz.vercel.app`
4. **Save** → Backend redéploie automatiquement

---

### ✅ 5. Test (2 minutes)

- [ ] Open `https://flashcard-xyz.vercel.app`
- [ ] Login fonctionne
- [ ] Decks se chargent
- [ ] Game fonctionne

---

## 🎉 C'est fait !

Ton app est **en production** !

**URLs**:
- 🎨 Frontend: `https://flashcard-xyz.vercel.app`
- 🔧 Backend: `https://flashcard-backend.onrender.com`
- 📚 API Docs: `https://flashcard-backend.onrender.com/docs`
- 🗄️ Database: `https://app.supabase.com`

---

## 🔄 Auto-deploy

Chaque `git push` sur `main` → déploiement automatique ! ✅

```bash
git add .
git commit -m "Update feature X"
git push origin main

# Vercel redeploy ✅
# Render redeploy ✅
```

---

## ⏰ Éviter le Cold Start (optionnel)

Le backend Render gratuit s'endort après 15 min.

**Solution rapide**: UptimeRobot (gratuit)

1. Go to https://uptimerobot.com
2. Sign up
3. Add Monitor:
   - Type: HTTP(s)
   - URL: `https://flashcard-backend.onrender.com/health`
   - Interval: 5 minutes
4. Save

Ton backend sera toujours actif ! 🚀

---

## 🆘 Problèmes ?

### Frontend ne charge pas
- Check: `VITE_API_URL` dans Vercel env vars
- Check: Backend URL est correct

### Backend errors
- Check: Logs dans Render dashboard
- Check: `DATABASE_URL` est correct
- Check: Migrations ont run (`alembic upgrade head`)

### CORS errors
- Check: `CORS_ORIGINS` dans Render inclut ton domaine Vercel exact
- Exemple: `https://flashcard-xyz.vercel.app` (sans `/` à la fin)

---

## 📖 Guide complet

Pour plus de détails, voir [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Time to production: ~10 minutes** ⚡

