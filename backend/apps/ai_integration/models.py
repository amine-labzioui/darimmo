"""
Modèles — Intégration Agent IA (N8N) DarImmo
Historise les échanges avec l'assistant IA pour le suivi et l'amélioration continue.
"""

from django.conf import settings
from django.db import models


class AIConversation(models.Model):
    """Session de discussion avec l'assistant IA DarImmo."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True,
        related_name="ai_conversations",
        help_text="Null si visiteur anonyme",
    )
    session_id = models.CharField(
        max_length=100, unique=True, help_text="Identifiant de session (cookie/anonyme ou user-based)"
    )
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Conversation IA"
        verbose_name_plural = "Conversations IA"
        ordering = ["-last_activity_at"]

    def __str__(self):
        who = self.user.email if self.user else "Anonyme"
        return f"Conversation IA — {who} ({self.session_id[:8]}…)"


class AIMessage(models.Model):
    """Message individuel échangé dans une conversation IA."""

    class Sender(models.TextChoices):
        USER = "user", "Utilisateur"
        AI = "ai", "Assistant IA"

    conversation = models.ForeignKey(
        AIConversation, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.CharField(max_length=10, choices=Sender.choices)
    content = models.TextField()

    # Métadonnées renvoyées par le workflow N8N (intention détectée, biens suggérés, etc.)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Message IA"
        verbose_name_plural = "Messages IA"
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.get_sender_display()}] {self.content[:50]}"


class AIRecommendation(models.Model):
    """Bien recommandé par l'IA au sein d'une conversation (pour suivi/analytics)."""

    conversation = models.ForeignKey(
        AIConversation, on_delete=models.CASCADE, related_name="recommendations"
    )
    annonce = models.ForeignKey(
        "annonces.Annonce", on_delete=models.CASCADE, related_name="ai_recommendations"
    )
    relevance_score = models.FloatField(
        null=True, blank=True, help_text="Score de pertinence renvoyé par N8N (0 à 1)"
    )
    was_clicked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Recommandation IA"
        verbose_name_plural = "Recommandations IA"
        ordering = ["-created_at"]

    def __str__(self):
        return f"IA recommande {self.annonce} (score={self.relevance_score})"
