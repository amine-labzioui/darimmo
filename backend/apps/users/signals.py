"""
Signaux — Utilisateurs DarImmo
Ex : envoyer un e-mail de bienvenue après inscription.
"""

import logging

from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

User = get_user_model()
logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def on_user_created(sender, instance, created, **kwargs):
    if created:
        logger.info("Bienvenue à %s — compte %s créé.", instance.email, instance.role)
        # TODO: déclencher l'envoi d'un e-mail de bienvenue (apps.messaging)
