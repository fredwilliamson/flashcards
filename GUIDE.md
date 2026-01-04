# 🎓 Guide Débutant Python - FlashCard

Guide pas-à-pas pour quelqu'un qui ne connaît pas Python.

## ✅ Étape 1: Installer Python

**Windows:**
1. Va sur https://www.python.org/downloads/
2. Télécharge Python 3.11+
3. **IMPORTANT:** Coche "Add Python to PATH" pendant l'installation
4. Vérifie: ouvre PowerShell et tape `python --version`

## ✅ Étape 2: Installer PostgreSQL (base de données)

**Option la plus simple - Docker:**

1. Installe Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Lance Docker Desktop
3. Dans PowerShell:
```powershell
docker run --name flashcard-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=flashcard -p 5432:5432 -d postgres:16
```

**Vérifier que ça marche:**
```powershell
docker ps
# Tu dois voir "flashcard-db" dans la liste
```

## ✅ Étape 3: Setup du projet

**Dans PowerShell, à la racine du projet:**

```powershell
# Va dans le dossier backend
cd backend

# Crée un environnement virtuel (isole les dépendances)
python -m venv venv

# Active l'environnement (IMPORTANT!)
.\venv\Scripts\activate

# Tu verras (venv) au début de ta ligne de commande

# Installe toutes les dépendances
pip install -r requirements.txt
```

**⚠️ Note:** À chaque fois que tu ouvres un nouveau terminal, fais `.\venv\Scripts\activate` dans le dossier backend!

## ✅ Étape 4: Configuration

**Crée un fichier `.env` dans le dossier `backend/`:**

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flashcard
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
```

**Pour le créer:**
- Clic droit dans `backend/` → Nouveau fichier → `.env`
- Copie-colle le contenu ci-dessus

## ✅ Étape 5: Créer les tables de la base de données

```powershell
# Dans backend/ avec venv activé
python setup.py
```

Tu devrais voir "✅ Tables créées avec succès!"

## ✅ Étape 6: Lancer l'application

```powershell
# Dans backend/ avec venv activé
uvicorn app.main:app --reload
```

**Ça devrait afficher:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

## ✅ Étape 7: Tester

Ouvre ton navigateur:
- API: http://localhost:8000
- Documentation interactive: http://localhost:8000/docs (très utile!)

## 🛠️ Commandes utiles

**Arrêter le serveur:**
- `CTRL+C` dans le terminal

**Arrêter PostgreSQL:**
```powershell
docker stop flashcard-db
```

**Redémarrer PostgreSQL:**
```powershell
docker start flashcard-db
```

**Désactiver l'environnement virtuel:**
```powershell
deactivate
```

## ❓ Problèmes courants

**"python n'est pas reconnu"**
- Python n'est pas installé ou pas dans le PATH
- Réinstalle Python en cochant "Add to PATH"

**"docker n'est pas reconnu"**
- Docker Desktop n'est pas installé ou pas lancé
- Lance Docker Desktop avant les commandes docker

**"Connection refused" ou erreur de connexion DB**
- PostgreSQL n'est pas lancé: `docker start flashcard-db`
- Vérifie que le port 5432 n'est pas utilisé

**"No module named 'app'"**
- Tu n'es pas dans le bon dossier ou venv pas activé
- Fais `cd backend` puis `.\venv\Scripts\activate`

## 📚 Prochaines étapes

Une fois que le serveur tourne:
1. Va sur http://localhost:8000/docs
2. Tu verras tous les endpoints disponibles
3. Tu peux les tester directement depuis cette interface!

## 🆘 Besoin d'aide?

Si quelque chose ne marche pas, note exactement:
1. La commande que tu as tapée
2. Le message d'erreur complet
3. Ce que tu as déjà essayé



