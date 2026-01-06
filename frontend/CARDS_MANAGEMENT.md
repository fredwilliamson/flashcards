# Cards Management - Frontend

Gestion complète des cards par deck dans l'interface admin.

## 📁 Structure

```
frontend/src/
├── hooks/query/
│   └── cards.query.ts         # React Query hooks pour cards
├── pages/admin/
│   ├── AdminDashboard.tsx     # Dashboard avec bouton "View Cards"
│   └── DeckCardsPage.tsx      # Page de gestion des cards par deck
├── services/
│   └── api.ts                 # API client (ajout cardApi.importCSV)
└── App.tsx                    # Routes: /admin/decks/:deckId/cards
```

## 🎯 Fonctionnalités

### Hooks React Query (`cards.query.ts`)

**Queries** :
- ✅ `useCards()` - Toutes les cards
- ✅ `useCardsByDeck(deckId)` - Cards d'un deck spécifique
- ✅ `useCard(cardId)` - Card par ID

**Mutations** :
- ✅ `useCreateCard()` - Créer une card
- ✅ `useUpdateCard()` - Modifier une card
- ✅ `useDeleteCard()` - Supprimer une card
- ✅ `useImportCSV()` - Importer depuis CSV

### Page DeckCardsPage (`/admin/decks/:deckId/cards`)

**Affichage** :
- Nom du deck + description
- Nombre total de cards
- Cards en grid responsive (3 colonnes desktop)
- Chaque card affiche :
  - Question
  - Réponse
  - Keywords (badges)

**Actions** :
- ➕ **New Card** : Modal de création
- 📤 **Import CSV** : Upload fichier CSV
- ✏️ **Edit** : Modal d'édition par card
- 🗑️ **Delete** : Suppression avec confirmation

### AdminDashboard

**Nouveau bouton "View Cards"** :
- Icône 👁️ (Eye) bleu
- Navigue vers `/admin/decks/:deckId/cards`
- Placé entre le badge Public/Private et Edit

## 📝 Format CSV

```csv
question,answer,keywords
"What is Python?","A programming language","python;programming;language"
"What is React?","A JavaScript library","react;javascript;ui"
```

**Règles** :
- Colonnes : `question`, `answer`, `keywords`
- Keywords séparés par des `;` (points-virgules)
- Guillemets pour les champs contenant des virgules

## 🎨 UI/UX

### Cards Grid
- Responsive : 1 col mobile, 2 cols tablet, 3 cols desktop
- Cards avec shadow et hover effect
- Dark mode support complet

### Modals
- **Create Card** : question, answer, keywords (comma-separated)
- **Edit Card** : pré-rempli avec les données existantes
- **Import CSV** : file picker + instructions format

### Actions
- ✅ Toast notifications automatiques (React Query)
- ✅ Cache invalidation après mutations
- ✅ Loading states
- ✅ Confirmation avant delete

## 🔄 Cache Management

```typescript
cardKeys = {
  all: ['cards'],
  lists: () => ['cards', 'list'],
  byDeck: (deckId) => ['cards', 'deck', deckId],
  detail: (id) => ['cards', 'detail', id],
}
```

**Invalidation automatique** :
- Create/Update/Delete → invalide `byDeck(deckId)` + `lists()`
- Import CSV → invalide `byDeck(deckId)`

## 🚀 Navigation

```
AdminDashboard
    └─> [Eye icon on deck] 
        └─> DeckCardsPage (/admin/decks/:deckId/cards)
            └─> [Arrow Left] back to AdminDashboard
```

## 🧪 Test Flow

1. Login en admin
2. Dashboard → cliquer 👁️ sur un deck
3. Page Cards du deck s'affiche
4. **Create Card** : remplir formulaire → Success toast
5. **Edit Card** : modifier question/answer/keywords → Success toast
6. **Import CSV** : sélectionner fichier → Success toast avec count
7. **Delete Card** : confirmer → Success toast
8. **Back** : retour au dashboard

## ✨ Améliorations Possibles

- [ ] Pagination pour grands decks (50+ cards)
- [ ] Recherche/filtre de cards
- [ ] Bulk actions (select multiple + delete)
- [ ] Preview CSV avant import
- [ ] Export cards to CSV
- [ ] Drag & drop pour réorganiser
- [ ] Duplicate card feature




