# FileUpload Component

Un composant réutilisable pour l'upload de fichiers avec drag & drop, validation, et feedback visuel.

## Fonctionnalités

- ✅ **Drag & Drop** : Glissez-déposez des fichiers directement
- ✅ **Click to Upload** : Cliquez pour ouvrir le sélecteur de fichier
- ✅ **Validation automatique** :
  - Taille du fichier (configurable)
  - Type de fichier (basé sur l'extension)
- ✅ **Feedback visuel** :
  - État drag actif
  - Fichier sélectionné avec nom et taille
  - Messages d'erreur clairs
- ✅ **Dark mode compatible**
- ✅ **Bouton de suppression** : Retirez facilement le fichier sélectionné

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `accept` | `string` | `'.csv'` | Extensions de fichiers acceptées (ex: `.csv`, `.pdf`, `.jpg,.png`) |
| `onFileSelect` | `(file: File \| null) => void` | **Required** | Callback appelé quand un fichier est sélectionné ou retiré |
| `maxSizeMB` | `number` | `10` | Taille maximale du fichier en MB |
| `helpText` | `string` | `undefined` | Texte d'aide affiché sous le composant |
| `exampleText` | `string` | `undefined` | Exemple de format de fichier |

## Usage

### Exemple basique

```tsx
import FileUpload from '../../components/FileUpload'

function MyComponent() {
  const [file, setFile] = useState<File | null>(null)

  return (
    <FileUpload
      accept=".csv"
      onFileSelect={setFile}
    />
  )
}
```

### Exemple avec toutes les options

```tsx
<FileUpload
  accept=".csv"
  onFileSelect={(file) => {
    if (file) {
      console.log('File selected:', file.name)
      // Process the file
    }
  }}
  maxSizeMB={5}
  helpText="CSV format: column1,column2,column3"
  exampleText='"value1","value2","value3"'
/>
```

### Exemple avec plusieurs types de fichiers

```tsx
<FileUpload
  accept=".jpg,.png,.pdf"
  onFileSelect={setFile}
  maxSizeMB={20}
  helpText="Upload images or PDF documents"
/>
```

### Intégration dans un formulaire

```tsx
function UploadForm() {
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    // Upload logic here
    const formData = new FormData()
    formData.append('file', file)
    
    // await uploadFile(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <FileUpload
        accept=".csv"
        onFileSelect={setFile}
        maxSizeMB={5}
      />
      
      <button type="submit" disabled={!file}>
        Upload
      </button>
    </form>
  )
}
```

## Validation

Le composant valide automatiquement :

1. **Taille du fichier** : Si le fichier dépasse `maxSizeMB`, une erreur est affichée
2. **Type de fichier** : Si l'extension du fichier ne correspond pas à `accept`, une erreur est affichée

## États visuels

### Normal
- Bordure grise en pointillés
- Icône d'upload
- Message "Click to upload or drag and drop"

### Drag Active
- Bordure bleue
- Fond bleu clair
- Message "Drop file here"

### Fichier sélectionné
- Badge vert avec icône de fichier
- Nom et taille du fichier
- Bouton X pour retirer

### Erreur
- Bordure rouge
- Fond rouge clair
- Message d'erreur explicite

## Format de fichier

Le composant affiche automatiquement :
- Le nom du fichier
- La taille formatée (Bytes, KB, MB, GB)

## Notes

- Le composant ne gère pas l'upload lui-même, il retourne simplement le `File` sélectionné via `onFileSelect`
- Pour réinitialiser le composant, appelez `onFileSelect(null)`
- Les erreurs de validation sont affichées automatiquement



