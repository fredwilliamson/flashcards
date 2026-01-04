# Remember Me Implementation

Fonctionnalité "Remember me" sur le formulaire de login.

## Fonctionnement

### Checkbox cochée ✅
- Token JWT sauvegardé dans **`localStorage`**
- ✅ **Persiste après fermeture du navigateur**
- ✅ **Reste connecté indéfiniment** (jusqu'à expiration du token)

### Checkbox non cochée ❌
- Token JWT sauvegardé dans **`sessionStorage`**
- ❌ **Session temporaire**
- ❌ **Déconnexion automatique à la fermeture du navigateur**

## Implémentation technique

### AuthContext (`src/contexts/AuthContext.tsx`)

```typescript
const login = async (username: string, password: string, rememberMe: boolean) => {
  const token = response.data.access_token
  
  if (rememberMe) {
    localStorage.setItem('token', token)
  } else {
    sessionStorage.setItem('token', token)
  }
}
```

**Helpers ajoutés :**
- `getToken()` : Récupère le token depuis localStorage OU sessionStorage
- `saveToken(token, rememberMe)` : Sauvegarde dans le bon storage
- `removeToken()` : Supprime des deux storages

### API Service (`src/services/api.ts`)

Intercepteur mis à jour pour chercher le token dans les deux storages :

```typescript
const token = localStorage.getItem('token') || sessionStorage.getItem('token')
```

### LoginPage (`src/pages/LoginPage.tsx`)

Checkbox ajoutée dans le formulaire :

```tsx
<input
  type="checkbox"
  checked={rememberMe}
  onChange={(e) => setRememberMe(e.target.checked)}
/>
<label>Remember me</label>
```

## Use cases

### Ordinateur personnel (sécurisé)
✅ Cocher "Remember me" → Reste connecté

### Ordinateur public (bibliothèque, café)
❌ Ne PAS cocher → Déconnexion automatique

## Sécurité

- Le token JWT reste le même (pas de "long-lived token" spécial)
- La différence est uniquement le **storage** (localStorage vs sessionStorage)
- En production, configurer le backend pour JWT `expires_in` approprié

## Tester

1. Login **AVEC** "Remember me" :
   ```
   - Fermer le navigateur
   - Rouvrir → Toujours connecté ✅
   ```

2. Login **SANS** "Remember me" :
   ```
   - Fermer le navigateur
   - Rouvrir → Déconnecté, retour au login ❌
   ```

## localStorage vs sessionStorage

| Storage | Durée | Fermeture navigateur |
|---------|-------|----------------------|
| `localStorage` | Permanent | Persiste ✅ |
| `sessionStorage` | Session | Supprimé ❌ |

## Default

Par défaut, la checkbox est **non cochée** (false) pour plus de sécurité.



