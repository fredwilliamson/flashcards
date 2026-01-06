# Test API Backend

Commandes pour tester que le backend fonctionne correctement.

## 1. Démarrer le backend

```bash
cd backend
./start.sh
```

Le serveur devrait démarrer sur `http://localhost:8787`

## 2. Créer un utilisateur admin (via Python)

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate

python -c "
from app.database import SessionLocal
from app.models.user import User
from argon2 import PasswordHasher

db = SessionLocal()
ph = PasswordHasher()

# Créer admin
admin = User(
    username='admin',
    first_name='Admin',
    last_name='User',
    hashed_password=ph.hash('admin123'),
    is_admin=True,
    is_active=True
)
db.add(admin)
db.commit()
print('✅ Admin créé: admin / admin123')
"
```

## 3. Tester l'API avec curl

### Login
```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Copier le `access_token` de la réponse.

### Get Me
```bash
curl http://localhost:8787/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Decks
```bash
curl http://localhost:8787/api/decks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 4. Vérifier la base de données

```bash
docker exec -it flashcard-postgres psql -U postgres -d flashcard

# Dans psql:
\dt flashcard.*
SELECT * FROM flashcard.users;
SELECT * FROM flashcard.decks;
```

## 5. Logs backend

Si erreur 401, vérifier les logs du serveur backend :
- Token invalide ou expiré ?
- Secret key manquante ?
- Base de données non accessible ?

## 6. Frontend test

Ouvrir la console du navigateur (F12) et vérifier :
```javascript
// Vérifier le token
localStorage.getItem('token')
// ou
sessionStorage.getItem('token')
```

## Problèmes communs

### 401 Unauthorized
- Token non envoyé : vérifier axios interceptor
- Token invalide : vérifier SECRET_KEY dans .env
- Token expiré : re-login

### 404 Not Found
- Route incorrecte
- Backend pas démarré

### 500 Internal Server Error
- Base de données non accessible
- Tables non créées : `alembic upgrade head`
- Erreur Python côté backend (vérifier logs)




