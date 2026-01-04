# Dark Mode Implementation

Le dark mode a été implémenté avec Tailwind CSS et React Context.

## Fonctionnalités

- ✅ **Toggle button** : Icône soleil/lune dans le footer fixe
- ✅ **Persistence** : Sauvegarde dans `localStorage`
- ✅ **System preference** : Détection automatique du thème système au premier chargement
- ✅ **Toutes les pages** : Login, Admin Dashboard, Student Dashboard, Game Page
- ✅ **Smooth transition** : Classes Tailwind avec `dark:` prefix
- ✅ **Footer fixe** : Toujours visible en bas de page

## Architecture

### ThemeContext (`src/contexts/ThemeContext.tsx`)

```typescript
const { theme, toggleTheme } = useTheme()
```

- Gère le state `light` | `dark`
- Persiste dans `localStorage`
- Applique la classe `dark` sur `<html>`

### Footer Component (`src/components/Footer.tsx`)

Footer fixe en bas de page contenant :
- Copyright
- Toggle dark mode (icône Soleil/Lune de Lucide React)

## Utilisation

### Dans App.tsx

```tsx
<ThemeProvider>
  <AuthProvider>
    <BrowserRouter>
      <Routes>{/* ... */}</Routes>
      <Footer />
    </BrowserRouter>
  </AuthProvider>
</ThemeProvider>
```

### Padding bottom des pages

Toutes les pages doivent avoir `pb-20` pour ne pas être masquées par le footer :

```tsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
  {/* content */}
</div>
```

### Classes Tailwind

```tsx
<div className="bg-white dark:bg-gray-800">
  <h1 className="text-gray-900 dark:text-white">Title</h1>
  <p className="text-gray-600 dark:text-gray-400">Text</p>
</div>
```

## Couleurs utilisées

| Element | Light | Dark |
|---------|-------|------|
| Background | `bg-gray-50` | `dark:bg-gray-900` |
| Card | `bg-white` | `dark:bg-gray-800` |
| Text primary | `text-gray-900` | `dark:text-white` |
| Text secondary | `text-gray-600` | `dark:text-gray-400` |
| Border | `border-gray-300` | `dark:border-gray-700` |
| Button primary | `bg-blue-600` | `dark:bg-blue-700` |

## Tester

1. Lancer le frontend : `npm run dev`
2. Cliquer sur l'icône soleil/lune dans le footer en bas à droite
3. Le thème est sauvegardé et persiste au rechargement
4. Le footer reste fixé en bas sur toutes les pages

