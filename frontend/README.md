# DarImmo — Frontend (React + Tailwind CSS)

Application React (Vite) consommant l'API DarImmo. Authentification JWT,
recherche d'annonces, tableaux de bord client/agence/admin, messagerie,
paiement (boost d'annonces), et Assistant IA connecté à N8N via le backend.

## Stack

- **React 18** + **React Router v6**
- **Tailwind CSS** pour le style (palette emerald `#047857` + accents terracotta)
- **Axios** avec intercepteur JWT (rafraîchissement automatique du token)
- **Recharts** pour les graphiques (tableaux de bord admin/agence)
- **Lucide React** pour les icônes

## Installation

```bash
cd frontend
npm install
cp .env.example .env
# Éditez .env si votre backend ne tourne pas sur http://localhost:8000
npm run dev
```

L'application est accessible sur **http://localhost:5173**.

> ⚠️ Le backend Django doit être lancé en parallèle (voir
> `../backend/README` ou la racine du projet) et `CORS_ALLOWED_ORIGINS`
> dans `backend/.env` doit inclure `http://localhost:5173`.

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (hot reload) |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualise le build de production |
| `npm run lint` | Vérifie le code avec ESLint |

## Structure

```
src/
├── components/
│   ├── Auth/       # Connexion, inscription, mot de passe oublié
│   ├── Client/     # Tableau de bord client/agence (annonces, favoris, visites…)
│   ├── Admin/      # Tableau de bord administrateur (modération, stats)
│   ├── Public/     # Page d'accueil, recherche, détail annonce, Assistant IA
│   ├── Payment/    # Boost d'annonces (Stripe/CMI)
│   └── Shared/     # Navbar, Footer, Modal, Sidebar, etc.
├── pages/          # Composants de routing (wrappers + layouts dashboard)
├── services/       # Couche API (un fichier par domaine métier)
├── hooks/          # useAuth, useForm, useFetch, useNotification
├── context/        # AuthContext, NotificationContext, UserContext
├── utils/          # constants, formatters, validators, helpers
└── styles/         # CSS global + variables + animations
```

## Note sur les noms de fichiers Context

Les fichiers de contexte (`AuthContext`, `NotificationContext`,
`UserContext`) sont en `.jsx` (et non `.js` comme listé dans l'arborescence
initiale du projet), car ils exportent des composants `Provider` contenant
du JSX. Vite/React exigent l'extension `.jsx` pour que la transformation
JSX s'applique correctement.

## Authentification

Le token JWT (`access` + `refresh`) est stocké dans `localStorage`.
L'intercepteur Axios (`src/services/api.js`) rafraîchit automatiquement le
token `access` expiré via `/api/auth/token/refresh/`, et déconnecte
l'utilisateur si le `refresh` token est lui-même invalide/expiré.

## Assistant IA

Le composant `src/components/Public/AIAssistant.jsx` envoie les messages à
`POST /api/ai/chat/` (passerelle Django vers le workflow N8N). Un
`session_id` est généré et persisté en `sessionStorage` pour garder le fil
de la conversation entre les rechargements de page.

## Build de production

```bash
npm run build
```

Le contenu de `dist/` est un site statique prêt à être servi par Nginx (voir
`../docker/Dockerfile.frontend`) ou tout autre hébergeur statique.
