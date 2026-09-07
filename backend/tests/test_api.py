"""
Tests — API générale & Intégration IA (N8N) DarImmo
"""

from unittest.mock import patch

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.ai_integration.models import AIConversation, AIMessage
from apps.ai_integration.n8n_client import N8NClientError


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestAIChat:
    @patch("apps.ai_integration.views.N8NClient.send_message")
    def test_chat_creates_conversation_and_messages(self, mock_send, api_client):
        mock_send.return_value = {
            "reply": "Voici quelques villas à Marrakech qui correspondent à votre budget.",
            "recommended_annonce_ids": [],
            "intent": "property_search",
        }
        url = reverse("ai-chat")
        response = api_client.post(
            url,
            {"message": "Je cherche une villa à Marrakech, budget 3M MAD", "session_id": "test-session-1"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert "Marrakech" in response.data["reply"]

        conversation = AIConversation.objects.get(session_id="test-session-1")
        assert conversation.messages.count() == 2  # message user + réponse IA
        assert AIMessage.objects.filter(sender="user").exists()
        assert AIMessage.objects.filter(sender="ai").exists()

    @patch("apps.ai_integration.views.N8NClient.send_message")
    def test_chat_handles_n8n_failure_gracefully(self, mock_send, api_client):
        mock_send.side_effect = N8NClientError("Service indisponible")
        url = reverse("ai-chat")
        response = api_client.post(
            url, {"message": "Bonjour", "session_id": "test-session-2"}, format="json"
        )
        # Le endpoint doit répondre 200 avec un message de fallback, pas planter
        assert response.status_code == status.HTTP_200_OK
        assert "réessayer" in response.data["reply"].lower() or "difficulté" in response.data["reply"].lower()

    def test_chat_requires_message(self, api_client):
        url = reverse("ai-chat")
        response = api_client.post(url, {"session_id": "test-session-3"}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @patch("apps.ai_integration.views.N8NClient.send_message")
    def test_conversation_persists_across_messages(self, mock_send, api_client):
        mock_send.return_value = {"reply": "Réponse 1", "recommended_annonce_ids": []}
        url = reverse("ai-chat")
        api_client.post(url, {"message": "Salut", "session_id": "persist-session"}, format="json")

        mock_send.return_value = {"reply": "Réponse 2", "recommended_annonce_ids": []}
        api_client.post(url, {"message": "Autre question", "session_id": "persist-session"}, format="json")

        conversation = AIConversation.objects.get(session_id="persist-session")
        assert conversation.messages.count() == 4


@pytest.mark.django_db
class TestAPIDocsAccessible:
    def test_swagger_docs_load(self, api_client):
        url = reverse("api-docs")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
