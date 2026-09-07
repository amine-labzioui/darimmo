# Guide d'installation — DarImmo Backend

## Prérequis

- Python 3.11+
- MongoDB 6.x (local ou Atlas)
- Redis (pour Celery — optionnel en développement)
- Node.js 20+ (pour le frontend)

## 1. Installation du Backend

### a) Cloner et créer l'environnement virtuel

```bash
cd darimmo/backend
python -m venv venv
source venv/bin/activate      # macOS / Linux
venv\Scripts\activate         # Windows
```

### b) Installer les dépendances

```bash
pip install -r requirements.txt
```

### c) Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditez `.env` et renseignez au minimum :
- `SECRET_KEY` — générez une clé aléatoire (50 caractères)
- `MONGO_DB_NAME`, `MONGO_HOST`, `MONGO_PORT`
- `N8N_WEBHOOK_URL` — URL de votre workflow N8N (Agent IA)

### d) Lancer MongoDB

**Option locale (Docker) :**
```bash
docker run -d -p 27017:27017 --name darimmo_mongo mongo:6
```

**Option cloud (MongoDB Atlas) :**
Renseignez `MONGO_CONNECTION_STRING` dans `.env` avec votre URI Atlas.

### e) Appliquer les migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

> ⚠️ Avec Djongo, certaines migrations Django par défaut (auth, admin,
> contenttypes) peuvent nécessiter `--run-syncdb` lors de la première
> installation : `python manage.py migrate --run-syncdb`

### f) Créer un super-utilisateur

```bash
python manage.py createsuperuser
# ou utilisez le script automatisé :
python ../scripts/create_superuser.py
```

### g) (Optionnel) Générer des données de test

```bash
python ../scripts/seed_data.py
```

### h) Lancer le serveur de développement

```bash
python manage.py runserver
```

L'API est accessible sur `http://localhost:8000/api/`
L'admin Django sur `http://localhost:8000/admin/`
La doc Swagger sur `http://localhost:8000/api/docs/`

## 2. Lancer Celery (tâches asynchrones)

Nécessite Redis en cours d'exécution.

```bash
# Terminal 1 — Worker
celery -A darimmo_project worker --loglevel=info

# Terminal 2 — Beat (tâches planifiées)
celery -A darimmo_project beat --loglevel=info
```

## 3. Installation du Frontend

```bash
cd ../frontend
npm install
cp .env.example .env   # configurez VITE_API_URL=http://localhost:8000/api
npm run dev
```

## 4. Vérification

- API : `curl http://localhost:8000/api/annonces/`
- Admin : connectez-vous sur `/admin/` avec votre super-utilisateur
- Frontend : `http://localhost:5173`

## Dépannage courant

| Problème | Solution |
|---|---|
| `djongo` erreur de connexion | Vérifiez que MongoDB tourne et que `MONGO_HOST`/`MONGO_PORT` sont corrects |
| `ModuleNotFoundError: pymongo` | `pip install pymongo==3.12.3` (version compatible Djongo) |
| Migrations échouent | Essayez `python manage.py migrate --run-syncdb` |
| Agent IA ne répond pas | Vérifiez `N8N_WEBHOOK_URL` et que le workflow N8N est actif |
| `ModuleNotFoundError: pkg_resources` (Python 3.12+) | `drf-yasg` dépend de `pkg_resources`, retiré de `setuptools` ≥ 81. Installez `pip install "setuptools<81"` dans votre environnement virtuel |
