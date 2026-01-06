# Frontend Debug Guide

## Test l'API depuis la console du navigateur

Une fois connecté sur l'app, ouvre la console (F12) et tape :

### 1. Vérifier le token
```javascript
window.debugApi.debugToken()
```

### 2. Tester la connexion backend
```javascript
window.debugApi.testBackendConnection()
```

Cela va tester:
- ✅ Health check (sans auth)
- ✅ GET /api/auth/me (avec token)
- ✅ GET /api/decks (avec token)

## Logs automatiques

Les intercepteurs axios logguent maintenant automatiquement:
- 🔐 Chaque requête avec/sans token
- ✅ Chaque réponse réussie
- ❌ Chaque erreur avec détails

## Problèmes communs

### 401 Unauthorized sur /api/decks

**Symptômes:**
```
❌ API Error from /api/decks: 401 {"detail": "..."}
```

**Causes possibles:**

1. **Token non envoyé**
   - Vérifier: `window.debugApi.debugToken()`
   - Solution: Se reconnecter

2. **Token invalide/expiré**
   - Backend logs: "Could not validate credentials"
   - Solution: Se reconnecter

3. **SECRET_KEY différente entre login et validation**
   - Backend: vérifier `.env` a bien `SECRET_KEY`
   - Solution: Redémarrer le backend

4. **CORS issue**
   - Browser console: "CORS policy blocked"
   - Solution: Vérifier `ALLOWED_ORIGINS` dans backend `.env`

### Backend non accessible

**Symptômes:**
```
❌ API Network Error: Network Error
```

**Solutions:**
```bash
# 1. Vérifier que le backend tourne
cd backend
./start.sh

# 2. Vérifier le port
# Backend devrait être sur http://localhost:8787
```

### Token présent mais 401 quand même

**Debug:**
```javascript
// Dans la console
const token = localStorage.getItem('token')
console.log('Token:', token)

// Tester manuellement
fetch('http://localhost:8787/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log).catch(console.error)
```

**Si ça marche en manuel mais pas via axios:**
- Problème d'interceptor
- Vérifier que le token est bien dans localStorage/sessionStorage
- Recharger la page

## Créer un user admin

Si tu n'as pas encore de user admin:

```bash
cd backend
python create_admin.py
# Username: admin
# Password: admin123
```

## Vérifier la BDD

```bash
docker exec -it flashcard-postgres psql -U postgres -d flashcard

# Dans psql:
SELECT id, username, is_admin FROM flashcard.users;
```




