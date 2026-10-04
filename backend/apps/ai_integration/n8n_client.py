"""
Client N8N — Intégration Agent IA DarImmo
Communique avec le workflow ORCHESTRATEUR n8n ("Darimmo - Orchestrateur"),
exposé via un webhook de production.

Le workflow reçoit le message, le contexte utilisateur, l'historique et le
jeton JWT de l'utilisateur connecté. Il classe l'intention, route vers le bon
sous-agent (recherche, annonces, paiement, communication, FAQ) et retourne :
- une réponse texte pour l'utilisateur
- (optionnel) une liste d'annonces recommandées (par ID)
- (optionnel) des métadonnées (agent utilisé, appels d'outils, etc.)
"""

import logging
from typing import Any

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class N8NClientError(Exception):
    """Erreur levée lors d'un échec de communication avec N8N."""


class N8NClient:
    """Client HTTP pour interroger le workflow orchestrateur hébergé sur N8N."""

    # Les sous-agents enchaînent plusieurs appels (LLM + API Django) : 4 à 8 s
    # en moyenne selon les tests, davantage si le service LLM est chargé.
    # Valeur modifiable via settings.N8N_TIMEOUT_SECONDS.
    TIMEOUT_SECONDS = 45

    def __init__(self):
        self.webhook_url = settings.N8N_WEBHOOK_URL
        self.api_key = settings.N8N_API_KEY
        self.timeout = getattr(settings, "N8N_TIMEOUT_SECONDS", self.TIMEOUT_SECONDS)

    def _headers(self) -> dict:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def send_message(
        self,
        message: str,
        session_id: str,
        user_context: dict[str, Any] | None = None,
        conversation_history: list[dict] | None = None,
        auth_token: str = "",
    ) -> dict:
        """
        Envoie un message utilisateur au workflow N8N et retourne sa réponse.

        Payload envoyé à N8N :
        {
            "message": "Je cherche une villa à Marrakech avec piscine, budget 3M MAD",
            "session_id": "abc123",
            "user_context": {"city": "Casablanca", "is_authenticated": true, ...},
            "conversation_history": [{"sender": "user", "content": "..."}, ...],
            "auth_token": "<JWT de l'utilisateur connecté, vide si visiteur>"
        }

        `auth_token` permet aux sous-agents d'appeler l'API Django AU NOM de
        l'utilisateur : ce sont les permissions Django (propriétaire, etc.) qui
        décident de ce qui est autorisé, jamais le LLM.

        Réponse attendue de N8N :
        {
            "reply": "Voici quelques biens qui pourraient vous intéresser à Marrakech...",
            "recommended_annonce_ids": [12, 45, 78],
            "intent": "search_property",
            "metadata": {...}
        }
        """
        if not self.webhook_url:
            raise N8NClientError(
                "N8N_WEBHOOK_URL n'est pas configurée. Vérifiez votre fichier .env."
            )

        payload = {
            "message": message,
            "session_id": session_id,
            "user_context": user_context or {},
            "conversation_history": conversation_history or [],
            "auth_token": auth_token or "",
        }

        try:
            response = requests.post(
                self.webhook_url,
                json=payload,
                headers=self._headers(),
                timeout=self.timeout,
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout as exc:
            logger.error("Timeout en contactant N8N (session=%s)", session_id)
            raise N8NClientError("L'assistant IA met trop de temps à répondre.") from exc
        except requests.exceptions.RequestException as exc:
            logger.error("Erreur de communication avec N8N : %s", exc)
            raise N8NClientError("Impossible de contacter l'assistant IA pour le moment.") from exc
        except ValueError as exc:
            logger.error("Réponse N8N non-JSON : %s", exc)
            raise N8NClientError("Réponse invalide de l'assistant IA.") from exc

    def get_market_advice(self, city: str, property_type: str = "") -> dict:
        """
        Variante spécialisée : demande des conseils sur le marché immobilier
        marocain pour une ville/type de bien donné (utilise le même webhook
        avec une intention explicite).
        """
        return self.send_message(
            message=f"Donne-moi des conseils sur le marché immobilier à {city}"
            + (f" pour les {property_type}" if property_type else ""),
            session_id=f"market-advice-{city.lower()}",
            user_context={"intent": "market_advice", "city": city, "property_type": property_type},
        )
