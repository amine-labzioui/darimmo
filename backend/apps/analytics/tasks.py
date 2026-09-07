"""
Tâches Celery — Analytics DarImmo
Calculs périodiques de statistiques agrégées.
"""

import logging
from datetime import date

from celery import shared_task
from django.db.models import Count

logger = logging.getLogger(__name__)


@shared_task
def compute_monthly_agency_performance():
    """
    Calcule les statistiques mensuelles de chaque agence (annonces publiées,
    vues totales, messages reçus, ventes/locations). À planifier en début de mois
    via django-celery-beat.
    """
    from apps.annonces.models import Annonce
    from apps.messaging.models import Conversation
    from apps.users.models import User

    from .models import AgencyPerformance

    today = date.today()
    current_month = today.replace(day=1)

    agencies = User.objects.filter(role=User.Role.AGENCE)
    created_count = 0

    for agency in agencies:
        annonces = Annonce.objects.filter(owner=agency)
        stats, _ = AgencyPerformance.objects.update_or_create(
            agency=agency,
            month=current_month,
            defaults={
                "annonces_published": annonces.filter(status=Annonce.Status.PUBLISHED).count(),
                "total_views": sum(annonces.values_list("views_count", flat=True)),
                "total_messages_received": Conversation.objects.filter(agent=agency).count(),
                "annonces_sold": annonces.filter(status=Annonce.Status.SOLD).count(),
                "annonces_rented": annonces.filter(status=Annonce.Status.RENTED).count(),
            },
        )
        created_count += 1

    logger.info("Statistiques mensuelles calculées pour %s agence(s).", created_count)
    return created_count


@shared_task
def cleanup_old_search_logs(days=90):
    """Supprime les anciens logs de recherche pour limiter la taille de la base."""
    from datetime import timedelta

    from django.utils import timezone

    from .models import SearchLog

    cutoff = timezone.now() - timedelta(days=days)
    deleted, _ = SearchLog.objects.filter(searched_at__lt=cutoff).delete()
    logger.info("%s ancien(s) log(s) de recherche supprimé(s).", deleted)
    return deleted
