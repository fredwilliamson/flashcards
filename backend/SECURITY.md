# Security Measures - FlashCard API

Mesures de sécurité mises en place pour protéger l'application contre les attaques.

## 🔐 Sécurité Actuelle (Déjà en Place)

### ✅ 1. Authentification JWT
- **Token signé** avec SECRET_KEY (HS256)
- **Expiration** : 30 minutes par défaut
- **Bearer token** requis pour toutes les routes protégées
- **Validation automatique** via `get_current_user` dependency

### ✅ 2. Password Hashing (Argon2)
```python
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
```
- ✅ **Argon2** : Recommandé par OWASP
- ✅ **Pas de limite 72 bytes** (contrairement à bcrypt)
- ✅ **Résistant aux GPU** et attaques par force brute
- ✅ **Salting automatique**

### ✅ 3. SQL Injection Protection
- **SQLAlchemy ORM** : Requêtes paramétrées automatiques
- **Pas de SQL brut** : Toutes les queries via ORM
- **Type checking** : Python type hints + Pydantic

### ✅ 4. CORS Configuration
```python
ALLOWED_ORIGINS=https://myapp.vercel.app,https://www.myapp.com
```
- ✅ **Whitelist explicite** des origines autorisées
- ✅ **Pas de wildcard** `*` en production
- ✅ Configuré via `.env`

### ✅ 5. Input Validation (Pydantic)
- **Validation automatique** de tous les inputs
- **Type checking** strict
- **Rejection automatique** des données invalides
- **422 Unprocessable Entity** pour erreurs de validation

### ✅ 6. Authorization Checks
```python
# Route admin-only
@router.get("/admin/stats")
def get_stats(current_admin: User = Depends(get_current_admin_user)):
    ...

# Empêcher de se supprimer soi-même
if user_id == current_user.id:
    raise HTTPException(403, "Cannot delete your own account")
```

### ✅ 7. Database Constraints
- **Unique username** : Contrainte DB + index
- **Foreign keys** : Intégrité référentielle
- **NOT NULL** sur champs critiques
- **BigInteger IDs** : Pas de prédiction d'IDs

### ✅ 8. Environment Variables
- ✅ **Secrets isolés** dans `.env` (git-ignored)
- ✅ **Pas de credentials hardcodés**
- ✅ `.sample.env` pour template (sans secrets)

## 🚨 Améliorations Recommandées

### 🔴 CRITIQUE : À Implémenter Immédiatement

#### 1. Rate Limiting
**Problème** : Attaques par force brute possibles sur `/auth/login`

**Solution** :
```bash
pip install slowapi
```

```python
# main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# auth_route.py
@router.post("/login")
@limiter.limit("5/minute")  # Max 5 tentatives/minute
def login(...):
    ...
```

#### 2. HTTPS Enforcement (Production)
**Fly.io** :
```python
# main.py
if not settings.DEBUG:
    app.add_middleware(
        HTTPSRedirectMiddleware
    )
```

**Supabase** : Déjà en HTTPS par défaut ✅

#### 3. Security Headers
```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

# Content Security Policy
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

#### 4. Secrets Rotation
- ✅ **SECRET_KEY** : Générer avec `openssl rand -hex 32`
- ⚠️ **Rotation régulière** : Tous les 90 jours
- ⚠️ **Invalidation tokens** après rotation

### 🟡 IMPORTANT : À Considérer

#### 5. Logging & Monitoring
```python
import logging

logger = logging.getLogger(__name__)

# Log tentatives de login échouées
logger.warning(f"Failed login attempt for username: {username}")

# Log actions admin
logger.info(f"Admin {admin_id} created user {user_id}")
```

#### 6. Input Sanitization (XSS)
**Frontend** : React échappe automatiquement les inputs ✅

**Backend** : Ajouter validation stricte
```python
from pydantic import validator, constr

class CardCreate(BaseModel):
    question: constr(min_length=1, max_length=500)
    answer: constr(min_length=1, max_length=1000)
    
    @validator('question', 'answer')
    def no_html_tags(cls, v):
        if '<script' in v.lower() or '<iframe' in v.lower():
            raise ValueError('HTML tags not allowed')
        return v
```

#### 7. Database Backups
**Supabase** :
- ✅ Backups automatiques quotidiens
- ⚠️ Tester la restauration régulièrement

#### 8. API Versioning
```python
app.include_router(auth_route, prefix="/api/v1/auth")
```
→ Permet de déprécier les anciennes versions

#### 9. CSRF Protection (si forms HTML)
**Pas nécessaire** : API REST stateless avec JWT ✅

#### 10. SQL Injection Double-Check
**Audit** : Vérifier qu'il n'y a pas de `text()` ou SQL brut
```bash
cd backend
grep -r "text(" app/
```

### 🟢 BONUS : Améliorations Avancées

#### 11. 2FA (Two-Factor Authentication)
Pour comptes admin critiques

#### 12. IP Whitelisting (Admin)
Restreindre `/admin/*` à certaines IPs

#### 13. Audit Logs (Immutable)
Table dédiée pour tracer toutes les actions critiques

#### 14. Encryption at Rest
**Supabase** : Encryption automatique ✅

#### 15. DDoS Protection
**Fly.io** : Protection intégrée ✅

## 🛡️ Checklist Sécurité Deployment

### Avant de déployer en production :

- [ ] ✅ `DEBUG=False` dans `.env` production
- [ ] ✅ SECRET_KEY fort (32+ caractères aléatoires)
- [ ] ✅ ALLOWED_ORIGINS configuré (pas de `*`)
- [ ] ✅ HTTPS activé (Fly.io + Vercel)
- [ ] ✅ Credentials Supabase dans secrets Fly.io
- [ ] ⚠️ Rate limiting activé
- [ ] ⚠️ Security headers ajoutés
- [ ] ⚠️ Logs configurés
- [ ] ✅ `.env` dans `.gitignore`
- [ ] ✅ Dépendances à jour (`pip list --outdated`)

## 🔍 Tests de Sécurité

### Tester manuellement :

1. **SQL Injection** :
```bash
curl -X POST /api/auth/login \
  -d '{"username": "admin' OR '1'='1", "password": "anything"}'
# → Devrait échouer (401)
```

2. **Brute Force** :
```bash
for i in {1..10}; do
  curl -X POST /api/auth/login -d '{"username":"admin","password":"wrong"}'
done
# → Devrait rate-limiter après 5 tentatives
```

3. **CORS** :
```bash
curl -H "Origin: https://evil-site.com" http://localhost:8787/api/decks
# → Devrait bloquer (403)
```

4. **Authorization** :
```bash
# Sans token
curl http://localhost:8787/api/admin/users
# → 401 Unauthorized

# Avec token user normal
curl -H "Authorization: Bearer $USER_TOKEN" http://localhost:8787/api/admin/users
# → 403 Forbidden
```

## 📊 Surveillance Continue

### Métriques à monitorer :
- Nombre de tentatives de login échouées
- Requêtes vers `/admin/*` avec tokens invalides
- Spike anormal de requêtes (DDoS)
- Erreurs 500 (potentiel bug exploitable)

### Outils recommandés :
- **Sentry** : Error tracking
- **Datadog** : APM monitoring
- **Fly.io Logs** : Surveillance infrastructure

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Argon2 Spec](https://github.com/P-H-C/phc-winner-argon2)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

## 🚀 Priorités d'Implémentation

1. **Maintenant** : Rate limiting (`slowapi`)
2. **Avant prod** : Security headers
3. **Semaine 1** : Logging
4. **Semaine 2** : Input sanitization XSS
5. **Mois 1** : Audit logs

---

**En résumé** : L'app est déjà bien sécurisée (JWT, Argon2, SQLAlchemy, CORS), mais rate limiting et security headers sont **CRITIQUES** avant le déploiement en production.




