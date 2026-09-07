# Architecture — DarImmo

## Vue d'ensemble

```
┌──────────────────┐      HTTPS/JSON       ┌───────────────────────┐
│  Frontend React   │ ───────────────────► │   Backend Django REST  │
│  (Tailwind CSS)   │ ◄─────────────────── │   (apps Django)        │
└──────────────────┘                       └──────────┬─────────────┘
                                                        │
                      ┌─────────────────────────────────┼────────────────────────┐
                      │                                  │                        │
                      ▼                                  ▼                        ▼
              ┌──────────────┐                  ┌────────────────┐      ┌─────────────────┐
              │   MongoDB     │                  │  Redis + Celery │      │  Workflow N8N    │
              │  (via Djongo) │                  │  (tâches async) │      │  (Agent IA)      │
              └──────────────┘                  └────────────────┘      └─────────────────┘
                                                        │
                                              ┌─────────┴─────────┐
                                              ▼                   ▼
                                        ┌──────────┐        ┌──────────┐
                                        │  Stripe  │        │   CMI    │
                                        │ (paiement)│       │ (Maroc)  │
                                        └──────────┘        └──────────┘
```

## Organisation modulaire (apps Django)

Le backend suit une architecture en **apps Django découplées**, chacune
responsable d'un domaine métier précis (Domain-Driven Design léger) :

| App | Responsabilité |
|---|---|
| `users` | Authentification JWT, profils, rôles (client/agence/admin), favoris |
| `annonces` | CRUD des biens immobiliers, recherche/filtrage, photos |
| `admin_dashboard` | Statistiques globales, modération, journal d'audit |
| `client_dashboard` | Profil étendu client, demandes de visite, recherches sauvegardées |
| `messaging` | Conversations entre clients/agences, notifications |
| `payments` | Boost d'annonces payant (Stripe / CMI) |
| `analytics` | Logs de vues/recherches, tendances marché, performance agence |
| `ai_integration` | Passerelle vers l'Agent IA hébergé sur N8N |

Chaque app expose ses propres `models.py`, `serializers.py`, `views.py`,
`urls.py`, `admin.py`, garantissant un couplage faible et une testabilité
élevée.

## Flux d'authentification

1. `POST /api/users/register/` ou `/login/` → retourne `access` + `refresh`
   (JWT, via `djangorestframework-simplejwt`).
2. Le frontend stocke les tokens et envoie `Authorization: Bearer <access>`
   sur chaque requête authentifiée.
3. `POST /api/auth/token/refresh/` renouvelle l'`access` token à partir du
   `refresh` token.
4. `POST /api/users/logout/` blackliste le `refresh` token (rotation +
   blacklist activées dans `SIMPLE_JWT`).

## Flux d'une recherche immobilière

```
Utilisateur (frontend)
   │  GET /api/annonces/?city=Marrakech&property_type=villa&price_max=3000000
   ▼
AnnonceViewSet.list()
   │  applique AnnonceFilter (django-filter) + recherche texte + tri
   │  ne retourne que status=published
   ▼
AnnonceListSerializer (version allégée, pour cartes)
   ▼
Réponse JSON paginée → Frontend
```

## Flux de l'Agent IA (N8N)

Voir [`N8N_INTEGRATION.md`](N8N_INTEGRATION.md) pour le détail complet.
Résumé : Django agit comme **passerelle stateful** — il persiste l'historique
de conversation et résout les recommandations d'annonces, tandis que N8N
gère la logique conversationnelle (LLM) sans accès direct à la base de
données DarImmo.

## Flux de paiement (boost d'annonce)

```
Agence sélectionne une formule de boost
   │  POST /api/payments/checkout/ { annonce_id, boost_plan_id, provider }
   ▼
CreateCheckoutView
   │  crée une Transaction (status=pending)
   │  délègue à StripeHandler ou CMIHandler selon `provider`
   ▼
Redirection vers la page de paiement du fournisseur
   ▼
Webhook (Stripe) ou Callback (CMI) confirme le paiement
   │  POST /api/payments/webhooks/stripe/  ou  /webhooks/cmi/
   ▼
Transaction.status = succeeded
Annonce.is_boosted = True, boosted_until = now + durée du plan
```

## Sécurité

- **JWT** avec rotation + blacklist des refresh tokens.
- **Permissions par rôle** : `IsOwnerOrAdmin`, `IsAdminRole`, `IsAgence`
  (dans `apps/users/permissions.py`), appliquées par vue/action.
- **CORS** restreint aux origines listées dans `CORS_ALLOWED_ORIGINS`.
- **Throttling** DRF : 100 req/h (anonyme), 1000 req/h (authentifié).
- **Webhooks** (Stripe/CMI) vérifiés par signature/hash avant traitement.
- Les secrets (clés API, mots de passe DB) vivent uniquement dans `.env`,
  jamais commités (voir `.gitignore`).

## Asynchrone — Celery

Tâches planifiées (`apps/analytics/tasks.py`), exécutées via
`django-celery-beat` :
- `compute_monthly_agency_performance` — agrège les stats mensuelles par agence.
- `cleanup_old_search_logs` — purge les vieux logs de recherche (> 90 jours).

## Pourquoi MongoDB (Djongo) ?

Les annonces immobilières ont des **caractéristiques très variables** selon
le type de bien (un terrain n'a ni chambres ni salle de bain, un riad a des
patios, etc.). La structure orientée documents de MongoDB permet de stocker
ces variations sans souffrir de tables rigides à colonnes majoritairement
vides, tout en conservant l'ORM Django (via Djongo) pour la productivité de
développement, les migrations, et l'admin Django auto-généré.
