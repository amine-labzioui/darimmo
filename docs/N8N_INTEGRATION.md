# Intégration de l'Agent IA via N8N — DarImmo

## Vue d'ensemble

DarImmo délègue l'intelligence conversationnelle de son assistant à un
**workflow N8N** externe, contacté via un webhook HTTP. Le backend Django
agit comme une passerelle : il reçoit les messages du frontend, les transmet
à N8N avec du contexte utilisateur, persiste l'échange, puis renvoie la
réponse enrichie (texte + recommandations de biens) au client.

```
Frontend React
      │  POST /api/ai/chat/
      ▼
Django (apps.ai_integration)
      │  POST {webhook}  { message, session_id, user_context, history }
      ▼
Workflow N8N
      │  { reply, recommended_annonce_ids, intent, metadata }
      ▼
Django (persiste + résout les annonces) ──► Frontend
```

## Configuration côté Django

Dans `backend/.env` :

```env
N8N_WEBHOOK_URL=https://votre-instance-n8n.com/webhook/darimmo-ai
N8N_API_KEY=votre-clé-si-authentification-requise
```

Le client HTTP est implémenté dans `apps/ai_integration/n8n_client.py`
(classe `N8NClient`).

## Contrat d'API attendu par N8N

### Requête envoyée par Django → N8N

```json
{
  "message": "Je cherche une villa à Marrakech avec piscine, budget 3M MAD",
  "session_id": "abc123-session",
  "user_context": {
    "is_authenticated": true,
    "user_id": 42,
    "city": "Casablanca",
    "role": "client",
    "preferred_cities": "Marrakech, Rabat",
    "budget_range": "3m_6m"
  },
  "conversation_history": [
    {"sender": "user", "content": "Bonjour"},
    {"sender": "ai", "content": "Bonjour ! Comment puis-je vous aider ?"}
  ]
}
```

### Réponse attendue de N8N → Django

```json
{
  "reply": "Voici 3 villas à Marrakech avec piscine dans votre budget...",
  "recommended_annonce_ids": [12, 45, 78],
  "intent": "property_search",
  "metadata": {
    "detected_budget": 3000000,
    "detected_city": "Marrakech"
  }
}
```

- `reply` (obligatoire) : texte affiché à l'utilisateur
- `recommended_annonce_ids` (optionnel) : liste d'IDs d'annonces DarImmo à
  afficher comme suggestions. Django filtre automatiquement pour ne garder
  que les annonces **publiées**.
- `intent` (optionnel) : intention détectée (`property_search`,
  `market_advice`, `faq`, etc.) — utile pour l'analytics.
- `metadata` (optionnel) : tout champ additionnel, stocké tel quel.

## Construction du workflow N8N (recommandations)

1. **Webhook Trigger** — reçoit le POST de Django.
2. **Nœud IA** (OpenAI, Anthropic, etc. via le nœud correspondant) — génère
   la réponse en utilisant `message` + `conversation_history` + `user_context`
   comme contexte de prompt.
3. **Nœud HTTP Request** (optionnel) — interroge l'API DarImmo
   (`GET /api/annonces/?city=...&property_type=...`) pour récupérer des
   biens correspondant aux critères extraits par l'IA.
4. **Nœud Function/Code** — formate la réponse finale au format attendu
   (`reply`, `recommended_annonce_ids`, `intent`).
5. **Respond to Webhook** — renvoie le JSON à Django.

## Endpoints Django exposés

| Méthode | URL | Description |
|---|---|---|
| POST | `/api/ai/chat/` | Envoie un message à l'assistant IA |
| GET | `/api/ai/conversations/{session_id}/` | Historique d'une conversation |
| GET | `/api/ai/mes-conversations/` | Conversations de l'utilisateur connecté |
| GET | `/api/ai/conseils-marche/?city=...` | Conseils ponctuels sur le marché |
| POST | `/api/ai/recommandations/{id}/clic/` | Suivi de clic sur une recommandation |

## Gestion des erreurs

Si N8N est indisponible ou met trop de temps à répondre (timeout 15s), le
backend renvoie une réponse de secours (HTTP 200) avec un message générique,
afin de ne jamais casser l'expérience utilisateur côté frontend :

```json
{
  "reply": "Désolé, notre assistant IA rencontre une difficulté technique...",
  "session_id": "abc123-session",
  "recommendations": []
}
```

## Sécurité

- Le webhook N8N doit être protégé (authentification par token via le header
  `Authorization: Bearer {N8N_API_KEY}`, ou par IP allowlisting côté N8N).
- Ne jamais exposer publiquement les credentials du workflow N8N dans le
  frontend — tous les appels passent obligatoirement par le backend Django.
