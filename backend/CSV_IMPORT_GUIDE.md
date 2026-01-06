# Guide d'import CSV

## Format CSV

Le fichier CSV doit avoir ces colonnes (avec header) :

```csv
question,answer,keywords,hint
"Question 1","Answer 1","keyword1,keyword2","Optional hint"
```

### Colonnes

- **`question`** (requis) : Texte de la question
- **`answer`** (requis) : Réponse attendue
- **`keywords`** (requis) : Mots-clés séparés par virgules (pour validation case-insensitive)
- **`hint`** (optionnel) : Indice pour aider l'utilisateur

### Règles

- Encoding : **UTF-8**
- Taille max : **10 MB**
- Keywords : au moins 1 mot-clé non vide
- Les champs avec virgules/guillemets doivent être entre guillemets

## Utilisation

### 1. Créer un deck

```http
POST /api/decks
{
  "name": "Géographie",
  "description": "Questions de géographie",
  "is_public": false
}
```
→ Note le `id` du deck (ex: `1`)

### 2. Importer le CSV

```http
POST /api/decks/1/import-csv
Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: file=example_cards.csv
```

### 3. Réponse

**Succès partiel (200) :**
```json
{
  "total_lines": 5,
  "created_count": 4,
  "error_count": 1,
  "errors": [
    {
      "line_number": 3,
      "error": "question: field required",
      "raw_line": "{'question': '', 'answer': 'test', ...}"
    }
  ]
}
```

**Erreur globale (400) :**
- Fichier trop gros
- Pas UTF-8
- Colonnes manquantes
- Pas un fichier CSV

**Erreur permissions (403) :**
- Vous n'êtes pas le créateur du deck (et pas admin)

## Exemple de fichier

Voir `backend/example_cards.csv`

## Comportement (Option B: Best Effort)

- ✅ Crée les cartes valides
- ❌ Skip les lignes invalides (reportées dans `errors`)
- Pas de rollback : les cartes valides sont créées même si d'autres échouent

## Tester dans Swagger

1. `POST /api/decks` → créer un deck (note l'ID)
2. `POST /api/decks/{deck_id}/import-csv` → cliquer "Try it out"
3. Upload `example_cards.csv`
4. Execute




