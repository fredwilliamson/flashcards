# Guide d'authentification

## Routes publiques (sans Bearer token)

- `GET /` - Root
- `GET /health` - Health check
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

## Routes protégées (Bearer token requis)

Toutes les autres routes nécessitent un token JWT :
- `/api/users/*` - Gestion des utilisateurs
- `/api/decks/*` - Gestion des decks
- `/api/cards/*` - Gestion des cartes
- `GET /api/auth/me` - Profil utilisateur

## Utilisation dans Swagger

1. **S'inscrire** : `POST /api/auth/register`
   ```json
   {
     "username": "john",
     "first_name": "John",
     "last_name": "Doe",
     "password": "test123"
   }
   ```

2. **Se connecter** : `POST /api/auth/login`
   ```json
   {
     "username": "john",
     "password": "test123"
   }
   ```
   → Copie le `access_token` reçu

3. **Configurer Swagger** :
   - Clique sur le bouton **"Authorize"** 🔒 (en haut à droite)
   - Colle le token (juste le token, sans "Bearer")
   - Clique sur "Authorize"
   - Toutes les routes protégées ont maintenant un cadenas fermé 🔒

4. **Tester une route protégée** : `GET /api/auth/me`
   - Le token est automatiquement envoyé dans le header `Authorization: Bearer <token>`

## Dans Postman/Insomnia

```http
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Token expiration

Le token expire après **30 minutes** (configurable dans `.env` : `ACCESS_TOKEN_EXPIRE_MINUTES`).




