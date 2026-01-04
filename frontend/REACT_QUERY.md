# React Query Architecture

This project uses `@tanstack/react-query` (v5) for efficient data fetching, caching, and state management.

## 📁 Structure

```
frontend/src/hooks/query/
├── index.ts           # Export all hooks
├── decks.query.ts     # Deck-related queries & mutations
├── users.query.ts     # User-related queries & mutations
├── admin.query.ts     # Admin statistics queries
└── game.query.ts      # Game session queries & mutations
```

## 🎯 Key Concepts

### Query Keys
Each domain has centralized query keys for cache management:

```typescript
export const deckKeys = {
  all: ['decks'] as const,
  lists: () => [...deckKeys.all, 'list'] as const,
  list: (filters?) => [...deckKeys.lists(), { filters }] as const,
  details: () => [...deckKeys.all, 'detail'] as const,
  detail: (id: number) => [...deckKeys.details(), id] as const,
}
```

### Queries
Hooks for fetching data:
- `useDecks()` - Fetch all decks
- `useDeck(id)` - Fetch a single deck
- `useUsers()` - Fetch all users
- `useGlobalStats()` - Fetch platform statistics
- etc.

### Mutations
Hooks for modifying data:
- `useCreateDeck()` - Create a new deck
- `useUpdateDeck()` - Update a deck
- `useDeleteDeck()` - Delete a deck
- `useCreateUser()` - Create a new user
- etc.

## 🚀 Usage

### Basic Query
```tsx
import { useDecks } from '../../hooks/query'

function DeckList() {
  const { decks, isLoading, error, refetch } = useDecks()

  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      {decks.map(deck => (
        <div key={deck.id}>{deck.name}</div>
      ))}
    </div>
  )
}
```

### Mutation with Optimistic Updates
```tsx
import { useCreateDeck } from '../../hooks/query'

function CreateDeckForm() {
  const { mutate: createDeck, isPending } = useCreateDeck()

  const handleSubmit = (formData) => {
    createDeck(formData, {
      onSuccess: () => {
        // Toast notification shown automatically
        // Cache invalidated automatically
      }
    })
  }

  return (
    <button disabled={isPending}>
      {isPending ? 'Creating...' : 'Create Deck'}
    </button>
  )
}
```

## ⚙️ Configuration

### QueryClient Setup (main.tsx)
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,        // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

## 🎨 Benefits

### Before (useState + useEffect)
```tsx
const [decks, setDecks] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  loadDecks()
}, [])

const loadDecks = async () => {
  setLoading(true)
  try {
    const res = await deckApi.getAll()
    setDecks(res.data)
  } catch (err) {
    setError(err)
  } finally {
    setLoading(false)
  }
}
```

### After (React Query)
```tsx
const { decks, isLoading, error } = useDecks()
```

### Key Improvements
✅ **Automatic caching** - No duplicate requests  
✅ **Automatic refetching** - Keep data fresh  
✅ **Optimistic updates** - Instant UI feedback  
✅ **Cache invalidation** - Smart data sync  
✅ **Loading/error states** - Built-in state management  
✅ **Request deduplication** - Efficient network usage  
✅ **Toast notifications** - Centralized user feedback  

## 🔄 Cache Invalidation

Mutations automatically invalidate related queries:

```typescript
export const useCreateDeck = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newDeck) => {
      const response = await deckApi.create(newDeck)
      return response.data
    },
    onSuccess: () => {
      // Invalidate deck list to trigger refetch
      queryClient.invalidateQueries({ queryKey: deckKeys.lists() })
    },
  })
}
```

## 📚 Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query in 100 Seconds](https://www.youtube.com/watch?v=novnyCaa7To)
- [Practical React Query](https://tkdodo.eu/blog/practical-react-query)

## 🎯 Next Steps

- [ ] Add DevTools: `<ReactQueryDevtools initialIsOpen={false} />`
- [ ] Implement optimistic updates for better UX
- [ ] Add pagination for large lists
- [ ] Add infinite scroll for long lists



