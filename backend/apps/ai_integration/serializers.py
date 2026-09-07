"""
Serializers — Intégration Agent IA (N8N) DarImmo
"""

from rest_framework import serializers

from .models import AIConversation, AIMessage, AIRecommendation


class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = ["id", "sender", "content", "metadata", "created_at"]
        read_only_fields = ["id", "created_at"]


class AIRecommendationSerializer(serializers.ModelSerializer):
    annonce_title = serializers.CharField(source="annonce.title", read_only=True)
    annonce_price = serializers.DecimalField(
        source="annonce.price", max_digits=12, decimal_places=2, read_only=True
    )
    annonce_city = serializers.CharField(source="annonce.city", read_only=True)
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = AIRecommendation
        fields = [
            "id", "annonce", "annonce_title", "annonce_price", "annonce_city",
            "main_image", "relevance_score", "was_clicked", "created_at",
        ]

    def get_main_image(self, obj):
        request = self.context.get("request")
        if obj.annonce.main_image and request:
            return request.build_absolute_uri(obj.annonce.main_image)
        return obj.annonce.main_image


class AIConversationSerializer(serializers.ModelSerializer):
    messages = AIMessageSerializer(many=True, read_only=True)
    recommendations = AIRecommendationSerializer(many=True, read_only=True)

    class Meta:
        model = AIConversation
        fields = [
            "id", "session_id", "started_at", "last_activity_at",
            "messages", "recommendations",
        ]
        read_only_fields = fields


class SendAIMessageSerializer(serializers.Serializer):
    """Payload pour envoyer un message à l'assistant IA."""

    message = serializers.CharField(max_length=2000, allow_blank=False)
    session_id = serializers.CharField(max_length=100, required=False, allow_blank=True)


class AIChatResponseSerializer(serializers.Serializer):
    """Réponse renvoyée au frontend après échange avec N8N."""

    reply = serializers.CharField()
    session_id = serializers.CharField()
    recommendations = AIRecommendationSerializer(many=True, required=False)
    intent = serializers.CharField(required=False, allow_blank=True)
