"""
Signaux — Messagerie & Notifications DarImmo
"""

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Message, Notification

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Message)
def on_message_created(sender, instance, created, **kwargs):
    if created:
        logger.info(
            "Nouveau message dans la conversation #%s : %s → %s",
            instance.conversation_id, instance.sender, instance.recipient,
        )


@receiver(post_save, sender=Notification)
def on_notification_created(sender, instance, created, **kwargs):
    if created:
        logger.info("Notification créée pour %s : %s", instance.user, instance.title)
        # TODO: déclencher un envoi WebSocket / push temps réel ici
