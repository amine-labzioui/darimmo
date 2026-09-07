# 🏠 DarImmo — Plateforme Immobilière Intelligente au Maroc

DarImmo est une application web immobilière permettant de consulter, publier
et rechercher des annonces (villas, appartements, riads, maisons, terrains)
au Maroc, enrichie d'un **Assistant IA** propulsé par **N8N**.

## 🧱 Stack technique

| Couche | Technologie |
|---|---|
| Backend | Python / Django + Django REST Framework |
| Base de données | MongoDB (via Djongo) |
| Frontend | React 18 + Vite + Tailwind CSS + React Router |
| Agent IA | N8N (automatisation no-code/low-code) |
| Paiements | Stripe + CMI (Maroc) |
| Tâches asynchrones | Celery + Redis |
| Authentification | JWT (SimpleJWT) |

## 📂 Structure du projet

```
darimmo/
├── backend/          # API Django REST Framework
│   └── apps/
│       ├── users/             # Authentification, profils, favoris
│       ├── annonces/          # CRUD des biens immobiliers
│       ├── admin_dashboard/   # Statistiques & modération admin
│       ├── client_dashboard/  # Profil client, visites, recherches sauvegardées
│       ├── messaging/         # Conversations & notifications
│       ├── payments/          # Boost d'annonces (Stripe / CMI)
│       ├── analytics/         # Statistiques & tendances marché
│       └── ai_integration/    # Agent IA via N8N
├── frontend/         # Application React (Vite + Tailwind CSS)
│   └── src/
│       ├── components/        # Auth, Client, Admin, Public, Payment, Shared
│       ├── pages/              # Routing & layouts (dashboards)
│       ├── services/           # Couche API (axios)
│       ├── hooks/, context/    # État global (auth, notifications)
│       └── utils/, styles/
├── docs/             # Documentation technique
├── docker/           # Fichiers Docker (backend + frontend)
└── scripts/          # Scripts utilitaires (init DB, seed, backup...)
```

## 🚀 Installation rapide

Voir [`docs/INSTALLATION_GUIDE.md`](docs/INSTALLATION_GUIDE.md) pour le guide complet.

### Backend

```bash
cd backend
cp .env.example .env   # puis éditez les valeurs

python -m venv venv
source venv/bin/activate   # Windows : venv\Scripts\activate
pip install -r requirements.txt

docker run -d -p 27017:27017 --name darimmo_mongo mongo:6

python ../scripts/init_db.py
python ../scripts/create_superuser.py

python manage.py runserver
```

L'API est alors disponible sur **http://localhost:8000/api/**
Documentation Swagger : **http://localhost:8000/api/docs/**

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:8000/api
npm run dev
```

L'application est disponible sur **http://localhost:5173**

## 🐳 Avec Docker (stack complète : backend + frontend + MongoDB + Redis)

```bash
docker compose -f docker/docker-compose.yml up --build
```

## 🖥️ Pages Frontend

| Route | Description | Accès |
|---|---|---|
| `/` | Accueil — hero, recherche, biens à la une | Public |
| `/recherche` | Recherche filtrée d'annonces | Public |
| `/annonces/:id` | Détail d'une annonce + contact/visite | Public |
| `/agences` | Liste des agences partenaires | Public |
| `/assistant-ia` | Chat avec l'Assistant DarImmo IA | Public |
| `/connexion`, `/inscription` | Authentification | Public |
| `/tableau-de-bord/*` | Espace client/agence (annonces, favoris, visites, stats) | Authentifié |
| `/favoris`, `/messages`, `/notifications`, `/profil` | Espace personnel | Authentifié |
| `/admin/*` | Modération, gestion utilisateurs, transactions | Admin |

## 🤖 Agent IA — Intégration N8N

L'assistant DarImmo IA répond aux questions des clients (recherche de biens,
conseils marché, FAQ) via un workflow N8N exposé sur un webhook.

Configurez `N8N_WEBHOOK_URL` et `N8N_API_KEY` dans votre `.env`.
Détails complets : [`docs/N8N_INTEGRATION.md`](docs/N8N_INTEGRATION.md)

**Endpoint principal :** `POST /api/ai/chat/`

```json
{
  "message": "Je cherche une villa à Marrakech avec piscine, budget 3M MAD",
  "session_id": "optionnel-sinon-généré"
}
```

## 📚 Documentation

- [Guide d'installation](docs/INSTALLATION_GUIDE.md)
- [Documentation API complète](docs/API_DOCUMENTATION.md)
- [Schéma de base de données](docs/DATABASE_SCHEMA.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Déploiement](docs/DEPLOYMENT.md)
- [Intégration N8N](docs/N8N_INTEGRATION.md)

## 🧪 Tests

```bash
cd backend
pytest
```

## 📄 Licence

Voir [`LICENSE`](LICENSE).
