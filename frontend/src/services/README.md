# Services API - Architecture

## Structure

L'API est organisée en modules séparés par domaine pour une meilleure maintenabilité et clarté.

```
services/
├── api.ts              # Configuration Axios + Interceptors + Re-exports
├── auth.api.ts         # Authentification (login, getMe)
├── user.api.ts         # Gestion des utilisateurs (CRUD)
├── deck.api.ts         # Gestion des decks (CRUD + import CSV)
├── card.api.ts         # Gestion des cartes (CRUD + import CSV)
├── game.api.ts         # Sessions de jeu (start, next, submit, stats)
└── admin.api.ts        # Statistiques admin (global, users, sessions)
```

## Utilisation

### Import depuis le fichier principal (recommandé)

```typescript
// ✅ Import depuis api.ts (toutes les fonctions sont re-exportées)
import { getAllUsers, getAllDecks, login } from '@/services/api'

// Utilisation
const users = await getAllUsers()
const decks = await getAllDecks()
```

### Import direct depuis les modules

```typescript
// ✅ Import direct depuis les modules
import { getAllUsers } from '@/services/user.api'
import { getAllDecks } from '@/services/deck.api'

// Utilisation
const users = await getAllUsers()
const decks = await getAllDecks()
```

## Fichier principal (`api.ts`)

Le fichier `api.ts` contient :

1. **Configuration Axios** : Instance configurée avec `baseURL` et headers
2. **Interceptors** :
   - Request : Ajoute automatiquement le JWT token
   - Response : Gestion centralisée des erreurs (401, 403, 404, 409, 500)
3. **Toast integration** : Fonction `setToastFunction()` pour les notifications
4. **Re-exports** : Tous les modules API sont ré-exportés pour faciliter l'import

## Modules API

### `auth.api.ts`

```typescript
export const login = (data: LoginRequest): Promise<TokenResponse>
export const getMe = (): Promise<User>
```

### `user.api.ts`

```typescript
export const getAllUsers = (): Promise<User[]>
export const getUserById = (id: number): Promise<User>
export const createUser = (data: UserCreate): Promise<User>
export const patchUser = (id: number, data: UserPatch): Promise<User>
export const deleteUser = (id: number): Promise<void>
```

### `deck.api.ts`

```typescript
export const getAllDecks = (): Promise<Deck[]>
export const getDeckById = (id: number): Promise<Deck>
export const createDeck = (data: DeckCreate): Promise<Deck>
export const patchDeck = (id: number, data: DeckPatch): Promise<Deck>
export const deleteDeck = (id: number): Promise<void>
export const importDeckCSV = (deckId: number, file: File): Promise<CSVImportResponse>
```

### `card.api.ts`

```typescript
export const getAllCards = (): Promise<Card[]>
export const getCardById = (id: number): Promise<Card>
export const getCardsByDeck = (deckId: number): Promise<Card[]>
export const createCard = (data: CardCreate): Promise<Card>
export const patchCard = (id: number, data: CardPatch): Promise<Card>
export const deleteCard = (id: number): Promise<void>
export const importCardCSV = (deckId: number, file: File): Promise<CSVImportResponse>
```

### `game.api.ts`

```typescript
export const startGameSession = (data: GameSessionStart): Promise<GameSessionResponse>
export const getNextCard = (sessionId: number): Promise<NextCardResponse>
export const submitAnswer = (sessionId: number, data: AnswerSubmit): Promise<AnswerResponse>
export const getSessionStats = (sessionId: number): Promise<SessionStatsResponse>
export const completeGameSession = (sessionId: number): Promise<SessionStatsResponse>
```

### `admin.api.ts`

```typescript
export const getGlobalStats = (): Promise<GlobalStats>
export const getUserStats = (userId: number): Promise<UserStats>
export const getAllSessions = (limit?: number): Promise<SessionListItem[]>
export const getDifficultCards = (limit?: number): Promise<CardDifficulty[]>
```

## Avantages

1. **Séparation des responsabilités** : Chaque module gère un domaine spécifique
2. **Import granulaire** : Importez seulement les fonctions nécessaires
3. **Tree-shaking** : Meilleure optimisation du bundle
4. **Maintenabilité** : Plus facile de trouver et modifier une API spécifique
5. **Testabilité** : Plus facile de mocker des fonctions individuelles
6. **Type safety** : TypeScript garantit la cohérence des types

## Configuration des interceptors

Les interceptors Axios sont configurés dans `api.ts` et s'appliquent automatiquement à toutes les requêtes :

### Request interceptor
- Ajoute automatiquement le JWT token depuis `localStorage` ou `sessionStorage`

### Response interceptor
- **401 Unauthorized** :
  - Si `/auth/me` : Déconnexion automatique (token invalide)
  - Si `/auth/login` : Pas de toast (géré par le formulaire)
  - Autres : Toast "Unauthorized access"
- **403 Forbidden** : Toast "Access forbidden"
- **404 Not Found** : Toast "Resource not found"
- **409 Conflict** : Toast avec le message du serveur (ex: username déjà utilisé)
- **500 Server Error** : Toast "Internal server error"
- **Network Error** : Toast "Cannot connect to server"

## Exemples

```typescript
// Import et utilisation
import { getAllUsers, createUser } from '@/services/api'

const users = await getAllUsers()
const newUser = await createUser({
  username: 'john',
  first_name: 'John',
  last_name: 'Doe',
  password: 'secret'
})
```

```typescript
// Avec React Query
import { useQuery } from '@tanstack/react-query'
import { getAllUsers } from '@/services/api'

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers
  })
}
```

