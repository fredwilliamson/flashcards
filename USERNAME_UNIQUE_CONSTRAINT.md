# Username Unique Constraint

Contrainte d'unicité sur le champ `username` avec gestion d'erreurs complète.

## 🔒 Backend

### Base de Données (`models/user.py`)

```python
username = Column(String, unique=True, index=True, nullable=False)
```

✅ **Déjà en place** : Contrainte d'unicité au niveau DB avec index pour performance.

### Service Layer (`services/impl/user_service_impl.py`)

**Gestion IntegrityError** :
- ✅ `create()` : Capture `IntegrityError` et lève `ValueError` avec message explicite
- ✅ `patch()` : Idem + gestion du hashing du password
- ✅ `update()` : Idem + gestion du hashing du password

```python
try:
    self.db.flush()
except IntegrityError as e:
    if 'username' in str(e.orig):
        raise ValueError(f"Username '{username}' already exists")
    raise
```

### Routes (`routes/admin_route.py`, `routes/user_route.py`)

**Gestion des erreurs** :
- ✅ Capture `ValueError` avec "already exists"
- ✅ Retourne **HTTP 409 Conflict** avec message détaillé
- ✅ Autres `ValueError` → HTTP 404

```python
try:
    return service.create(user)
except ValueError as e:
    if 'already exists' in str(e):
        raise HTTPException(status_code=409, detail=str(e))
    raise
```

## 🎨 Frontend

### API Interceptor (`services/api.ts`)

**Gestion HTTP 409** :
```typescript
else if (error.response?.status === 409) {
  const message = error.response?.data?.detail || 'Conflict error'
  showToastFn?.(message, 'error')
}
```

✅ Affiche automatiquement le message d'erreur du backend dans un toast.

### React Query Hooks (`hooks/query/users.query.ts`)

**Éviter les doublons de toasts** :
```typescript
onError: (error) => {
  // Don't show toast for 409 - already handled by interceptor
  if (error.response?.status !== 409) {
    showToast('Failed to create user', 'error')
  }
}
```

✅ Le toast "Failed to create user" ne s'affiche **pas** si l'erreur est un conflit d'unicité.

## 🎯 Flow Complet

### Création d'utilisateur

```
1. Frontend: Submit form avec username="john.doe"
   ↓
2. API: POST /admin/users { username: "john.doe", ... }
   ↓
3. Service: Hash password + create entity
   ↓
4. DB: INSERT INTO users ...
   ↓
5a. Si username unique: ✅ Success → Toast "User created!"
   
5b. Si username existe déjà:
    ❌ IntegrityError (DB)
    → ValueError "Username 'john.doe' already exists" (Service)
    → HTTP 409 Conflict (Route)
    → Toast "Username 'john.doe' already exists" (Frontend)
```

### Modification d'utilisateur

```
1. Frontend: Edit username dans modal
   ↓
2. API: PATCH /users/{id} { username: "new.username" }
   ↓
3. Route: Vérification self-edit protections
   ↓
4. Service: Update entity
   ↓
5. DB: UPDATE users SET username = ...
   ↓
6a. Si username unique: ✅ Success → Toast "User updated!"
   
6b. Si username existe déjà:
    ❌ IntegrityError (DB)
    → ValueError (Service)
    → HTTP 409 Conflict (Route)
    → Toast avec message d'erreur (Frontend)
```

## 📝 Messages d'Erreur

### Backend
```
Username 'john.doe' already exists
```

### Frontend Toast
```
🔴 Username 'john.doe' already exists
```

**Toast rouge** affiché pendant quelques secondes, puis disparaît automatiquement.

## ✅ Avantages

1. **Sécurité** : Contrainte DB + validation applicative
2. **UX** : Message d'erreur clair et immédiat
3. **Performance** : Index sur username pour recherche rapide
4. **Robustesse** : Gestion d'erreur à tous les niveaux
5. **Maintenance** : Code centralisé (pas de duplication)

## 🧪 Test Manual

### Scénario 1 : Créer utilisateur avec username existant
1. Login en admin
2. Dashboard → Create User
3. Username: "admin" (déjà existant)
4. Submit
5. ✅ Toast rouge : "Username 'admin' already exists"

### Scénario 2 : Modifier username vers un existant
1. Dashboard → Edit user
2. Changer username vers un déjà pris
3. Save
4. ✅ Toast rouge : "Username 'xxx' already exists"

### Scénario 3 : Créer avec nouveau username
1. Username: "nouveau.user"
2. Submit
3. ✅ Toast vert : "User 'nouveau.user' created successfully!"

## 🔍 Logs

En cas d'erreur, le backend log l'IntegrityError complet pour debug, mais le frontend ne voit que le message simplifié.



