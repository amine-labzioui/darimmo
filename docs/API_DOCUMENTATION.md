# Documentation API — DarImmo

Base URL : `http://localhost:8000/api/`
Documentation interactive (Swagger) : `/api/docs/`

Authentification : **JWT Bearer Token**
```
Authorization: Bearer <access_token>
```

---

## 🔐 Utilisateurs (`/api/users/`)

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `register/` | ❌ | Inscription (client ou agence) |
| POST | `login/` | ❌ | Connexion — retourne `access` + `refresh` |
| POST | `logout/` | ✅ | Déconnexion (blackliste le refresh token) |
| GET/PUT/PATCH | `me/` | ✅ | Profil de l'utilisateur connecté |
| POST | `change-password/` | ✅ | Modifier le mot de passe |
| GET/POST | `favorites/` | ✅ | Biens favoris |
| DELETE | `favorites/{id}/` | ✅ | Retirer un favori |
| POST | `/api/auth/token/refresh/` | ❌ | Rafraîchir le token JWT |

---

## 🏠 Annonces (`/api/annonces/`)

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `` | ❌ | Liste publique (filtrable) |
| POST | `` | ✅ | Créer une annonce |
| GET | `{id}/` | ❌ | Détail (incrémente les vues) |
| PUT/PATCH | `{id}/` | ✅ (propriétaire) | Modifier |
| DELETE | `{id}/` | ✅ (propriétaire) | Supprimer |
| GET | `mes-annonces/` | ✅ | Mes annonces |
| POST | `{id}/publier/` | ✅ (propriétaire) | Publier |
| POST | `{id}/marquer_vendue/` | ✅ (propriétaire) | Marquer comme vendue |
| POST | `{id}/ajouter_photos/` | ✅ (propriétaire) | Ajouter des photos |

**Paramètres de filtrage (`GET /api/annonces/`) :**
`city`, `property_type`, `transaction_type`, `price_min`, `price_max`,
`surface_min`, `bedrooms_min`, `has_pool`, `has_parking`, `is_furnished`,
`search` (texte libre), `ordering` (ex: `-price`, `created_at`)

---

## 🛠 Tableau de bord Admin (`/api/admin-dashboard/`)

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `stats/` | 🔒 Admin | Statistiques globales |
| GET | `users/` | 🔒 Admin | Liste des utilisateurs |
| POST | `users/{id}/suspendre/` | 🔒 Admin | Suspendre un compte |
| POST | `users/{id}/verifier/` | 🔒 Admin | Vérifier un compte |
| POST | `users/{id}/reactiver/` | 🔒 Admin | Réactiver un compte |
| GET | `annonces/?status=pending` | 🔒 Admin | Annonces à modérer |
| POST | `annonces/{id}/approuver/` | 🔒 Admin | Approuver et publier |
| POST | `annonces/{id}/rejeter/` | 🔒 Admin | Rejeter |
| GET | `activity-log/` | 🔒 Admin | Journal d'audit |

---

## 👤 Tableau de bord Client (`/api/client-dashboard/`)

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| GET/PUT | `profile/` | ✅ | Profil client étendu (préférences) |
| GET | `summary/` | ✅ | Résumé (favoris, visites, messages non lus) |
| GET/POST | `visit-requests/` | ✅ | Demandes de visite |
| GET/POST | `saved-searches/` | ✅ | Recherches sauvegardées |

---

## 💬 Messagerie (`/api/messaging/`)

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `conversations/` | ✅ | Mes conversations |
| POST | `conversations/contacter/` | ✅ | Contacter un vendeur depuis une annonce |
| GET | `conversations/{id}/messages/` | ✅ | Messages d'une conversation |
| POST | `conversations/{id}/envoyer/` | ✅ | Envoyer un message |
| GET | `notifications/` | ✅ | Mes notifications |
| POST | `notifications/{id}/marquer-lu/` | ✅ | Marquer comme lue |
| POST | `notifications/tout-marquer-lu/` | ✅ | Tout marquer comme lu |

---

## 💳 Paiements (`/api/payments/`)

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `boost-plans/` | ❌ | Formules de mise en avant |
| GET | `transactions/` | ✅ | Mon historique de paiement |
| POST | `checkout/` | ✅ | Démarrer un paiement (Stripe/CMI) |
| POST | `webhooks/stripe/` | ❌ | Webhook Stripe (interne) |
| POST | `webhooks/cmi/` | ❌ | Callback CMI (interne) |

---

## 📊 Analytics (`/api/analytics/`)

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `mes-annonces/` | ✅ | Stats détaillées de mes annonces |
| GET | `tendances/` | ❌ | Tendances marché (villes populaires) |
| POST | `log-recherche/` | ❌ | Enregistrer une recherche |

---

## 🤖 Agent IA (`/api/ai/`)

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `chat/` | ❌ | Discuter avec l'Assistant DarImmo IA |
| GET | `conversations/{session_id}/` | ❌ | Historique d'une conversation |
| GET | `mes-conversations/` | ✅ | Mes conversations IA |
| GET | `conseils-marche/?city=...` | ❌ | Conseils ponctuels sur le marché |
| POST | `recommandations/{id}/clic/` | ❌ | Suivi de clic sur une suggestion |

Voir [`N8N_INTEGRATION.md`](N8N_INTEGRATION.md) pour le détail du contrat
de données avec le workflow N8N.

---

## Codes de statut HTTP utilisés

| Code | Signification |
|---|---|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Requête invalide / erreur de validation |
| 401 | Authentification requise |
| 403 | Accès refusé (permissions insuffisantes) |
| 404 | Ressource introuvable |
| 503 | Service externe indisponible (ex: N8N) |
