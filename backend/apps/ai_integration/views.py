"""
Vues — Intégration Agent IA (N8N) DarImmo
Endpoint principal du chatbot : reçoit le message utilisateur, l'envoie à N8N,
persiste l'échange et retourne la réponse (+ recommandations de biens).
"""

import logging
import uuid

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.annonces.models import Annonce

from .models import AIConversation, AIMessage, AIRecommendation
from .n8n_client import N8NClient, N8NClientError
from .serializers import (
    AIChatResponseSerializer,
    AIConversationSerializer,
    SendAIMessageSerializer,
)

logger = logging.getLogger(__name__)


class AIChatView(APIView):
    """
    POST /api/ai/chat/
    Point d'entrée principal de l'Assistant DarImmo IA.

    Body: { "message": "...", "session_id": "..." (optionnel) }
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SendAIMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message_text = serializer.validated_data["message"]
        session_id = serializer.validated_data.get("session_id") or str(uuid.uuid4())

        conversation, _ = AIConversation.objects.get_or_create(
            session_id=session_id,
            defaults={"user": request.user if request.user.is_authenticated else None},
        )

        # Persiste le message utilisateur
        AIMessage.objects.create(
            conversation=conversation, sender=AIMessage.Sender.USER, content=message_text
        )

        # Construit le contexte utilisateur transmis à N8N
        user_context = self._build_user_context(request)
        history = list(
            conversation.messages.order_by("created_at").values("sender", "content")
        )

        try:
            n8n_response = N8NClient().send_message(
                message=message_text,
                session_id=session_id,
                user_context=user_context,
                conversation_history=history,
            )
        except N8NClientError as exc:
            logger.error("Échec de l'appel N8N : %s", exc)
            return Response(
                {
                    "reply": (
                        "Désolé, notre assistant IA rencontre une difficulté technique. "
                        "Veuillez réessayer dans un instant ou contacter notre équipe."
                    ),
                    "session_id": session_id,
                    "recommendations": [],
                },
                status=status.HTTP_200_OK,
            )

        reply_text = n8n_response.get("reply", "Je n'ai pas de réponse pour le moment.")
        recommended_ids = n8n_response.get("recommended_annonce_ids", [])
        intent = n8n_response.get("intent", "")

        # Persiste la réponse de l'IA
        AIMessage.objects.create(
            conversation=conversation,
            sender=AIMessage.Sender.AI,
            content=reply_text,
            metadata=n8n_response.get("metadata", {}),
        )

        # Persiste les recommandations (si des annonces valides sont retournées)
        recommendations = []
        if recommended_ids:
            annonces = Annonce.objects.filter(
                id__in=recommended_ids, status=Annonce.Status.PUBLISHED
            )
            for annonce in annonces:
                rec = AIRecommendation.objects.create(
                    conversation=conversation, annonce=annonce
                )
                recommendations.append(rec)

        response_data = {
            "reply": reply_text,
            "session_id": session_id,
            "recommendations": recommendations,
            "intent": intent,
        }
        return Response(
            AIChatResponseSerializer(response_data, context={"request": request}).data
        )

    def _build_user_context(self, request) -> dict:
        context = {"is_authenticated": request.user.is_authenticated}
        if request.user.is_authenticated:
            context.update({
                "user_id": request.user.id,
                "city": request.user.city,
                "role": request.user.role,
            })
            try:
                profile = request.user.client_profile
                context.update({
                    "preferred_cities": profile.preferred_cities,
                    "preferred_property_types": profile.preferred_property_types,
                    "budget_range": profile.budget_range,
                })
            except Exception:
                pass
        return context


class AIConversationHistoryView(generics.RetrieveAPIView):
    """GET /api/ai/conversations/{session_id}/ — Historique complet d'une conversation."""

    serializer_class = AIConversationSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "session_id"
    queryset = AIConversation.objects.prefetch_related("messages", "recommendations__annonce")


class MyAIConversationsView(generics.ListAPIView):
    """GET /api/ai/mes-conversations/ — Conversations IA de l'utilisateur connecté."""

    serializer_class = AIConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user).prefetch_related(
            "messages", "recommendations__annonce"
        )


class MarketAdviceView(APIView):
    """
    GET /api/ai/conseils-marche/?city=Marrakech&property_type=villa
    Conseils ponctuels sur le marché immobilier marocain (sans créer de conversation persistée).
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        city = request.query_params.get("city", "")
        property_type = request.query_params.get("property_type", "")
        if not city:
            return Response({"detail": "Le paramètre 'city' est requis."}, status=400)

        try:
            n8n_response = N8NClient().get_market_advice(city, property_type)
        except N8NClientError as exc:
            return Response({"detail": str(exc)}, status=503)

        return Response({"advice": n8n_response.get("reply", "")})


class TrackRecommendationClickView(APIView):
    """POST /api/ai/recommandations/{id}/clic/ — Suivi du clic sur une recommandation IA."""

    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            rec = AIRecommendation.objects.get(pk=pk)
        except AIRecommendation.DoesNotExist:
            return Response({"detail": "Recommandation introuvable."}, status=404)

        rec.was_clicked = True
        rec.save(update_fields=["was_clicked"])
        return Response({"detail": "Clic enregistré."})
