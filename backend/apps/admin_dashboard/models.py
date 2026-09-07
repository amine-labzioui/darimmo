"""
Modèles — Tableau de bord Administrateur DarImmo
"""

from django.conf import settings
from django.db import models


class ActivityLog(models.Model):
    """Journal des actions administratives importantes (audit trail)."""

    class ActionType(models.TextChoices):
        ANNONCE_APPROVED = "annonce_approved", "Annonce approuvée"
        ANNONCE_REJECTED = "annonce_rejected", "Annonce rejetée"
        USER_SUSPENDED = "user_suspended", "Utilisateur suspendu"
        USER_VERIFIED = "user_verified", "Utilisateur vérifié"
        ANNONCE_DELETED = "annonce_deleted", "Annonce supprimée"

    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="admin_actions"
    )
    action_type = models.CharField(max_length=30, choices=ActionType.choices)
    target_id = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Journal d'activité"
        verbose_name_plural = "Journal d'activité"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_action_type_display()} par {self.admin} le {self.created_at:%d/%m/%Y}"
from django.db import models
from apps.client_dashboard.models import VisitRequest


class VisitRequestAction(models.Model):
    visit_request = models.OneToOneField(
        VisitRequest,
        on_delete=models.CASCADE,
        related_name="admin_action",
    )

    proposed_date = models.DateTimeField(
        null=True,
        blank=True,
    )

    owner_message = models.TextField(
        blank=True,
        default="",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )
    is_seen_by_client = models.BooleanField(
    default=False,
    )

    is_seen_by_owner = models.BooleanField(
        default=True,
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"Visit #{self.visit_request_id}"