"""
Modèles — Tableau de bord Client DarImmo
Profil étendu, demandes de visite, recherches sauvegardées.
"""

from django.conf import settings
from django.db import models


class ClientProfile(models.Model):
    """Informations complémentaires propres au tableau de bord client."""

    class BudgetRange(models.TextChoices):
        UNDER_1M = "under_1m", "Moins de 1M MAD"
        FROM_1M_3M = "1m_3m", "1M – 3M MAD"
        FROM_3M_6M = "3m_6m", "3M – 6M MAD"
        ABOVE_6M = "above_6m", "6M+ MAD"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="client_profile"
    )
    preferred_cities = models.CharField(
        max_length=255, blank=True, help_text="Villes préférées, séparées par des virgules"
    )
    preferred_property_types = models.CharField(
        max_length=255, blank=True, help_text="Types de biens préférés, séparés par des virgules"
    )
    budget_range = models.CharField(
        max_length=20, choices=BudgetRange.choices, blank=True
    )
    is_looking_to_buy = models.BooleanField(default=True)
    is_looking_to_rent = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profil client"
        verbose_name_plural = "Profils clients"

    def __str__(self):
        return f"Profil de {self.user}"


class VisitRequest(models.Model):

    class Status(models.TextChoices):
        PENDING = "pending", "En attente"
        ACCEPTED = "accepted", "Acceptée"
        RESCHEDULED = "rescheduled", "Nouvelle date proposée"
        REFUSED = "refused", "Refusée"
        COMPLETED = "completed", "Effectuée"

    annonce = models.ForeignKey(
        "annonces.Annonce",
        on_delete=models.CASCADE,
        related_name="visit_requests",
    )

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="visit_requests",
    )

    requested_date = models.DateTimeField()

    confirmed_date = models.DateTimeField(
        null=True,
        blank=True,
    )

    client_message = models.TextField(
        blank=True,
    )

    owner_message = models.TextField(
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    owner_message = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.client} - {self.annonce}"


class SavedSearch(models.Model):
    """Recherche sauvegardée par un client pour recevoir des alertes."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_searches"
    )
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100, blank=True)
    property_type = models.CharField(max_length=20, blank=True)
    transaction_type = models.CharField(max_length=10, blank=True)
    price_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    price_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    notify_by_email = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Recherche sauvegardée"
        verbose_name_plural = "Recherches sauvegardées"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.user})"
