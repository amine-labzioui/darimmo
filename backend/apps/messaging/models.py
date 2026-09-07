"""
Modèles — Messagerie & Notifications DarImmo
"""

from django.conf import settings
from django.db import models


class Conversation(models.Model):
    """Fil de discussion entre un client et le propriétaire d'une annonce."""

    annonce = models.ForeignKey(
        "annonces.Annonce", on_delete=models.CASCADE, related_name="conversations"
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="client_conversations"
    )
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="agent_conversations"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Conversation"
        verbose_name_plural = "Conversations"
        unique_together = ("annonce", "client", "agent")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Conversation: {self.client} ↔ {self.agent} ({self.annonce})"


class Message(models.Model):
    """Message individuel au sein d'une conversation."""

    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages"
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_messages"
    )
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender} → {self.recipient}: {self.content[:40]}"


class Notification(models.Model):
    """Notification système (nouvelle visite, message, annonce approuvée, etc.)."""

    class NotificationType(models.TextChoices):
        NEW_MESSAGE = "new_message", "Nouveau message"
        VISIT_REQUEST = "visit_request", "Demande de visite"
        VISIT_CONFIRMED = "visit_confirmed", "Visite confirmée"
        ANNONCE_APPROVED = "annonce_approved", "Annonce approuvée"
        ANNONCE_REJECTED = "annonce_rejected", "Annonce rejetée"
        NEW_MATCH = "new_match", "Nouveau bien correspondant"
        PAYMENT_SUCCESS = "payment_success", "Paiement réussi"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices)
    title = models.CharField(max_length=150)
    body = models.TextField(blank=True)
    link = models.CharField(max_length=255, blank=True, help_text="URL frontend associée")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_notification_type_display()} pour {self.user}"
