"""
Modèles — Analytics & Statistiques DarImmo
"""

from django.conf import settings
from django.db import models


class PropertyView(models.Model):
    """Enregistrement détaillé d'une consultation d'annonce (pour analytics fines)."""

    annonce = models.ForeignKey(
        "annonces.Annonce", on_delete=models.CASCADE, related_name="view_logs"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="viewed_properties",
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Vue de bien"
        verbose_name_plural = "Vues de biens"
        ordering = ["-viewed_at"]
        indexes = [models.Index(fields=["annonce", "viewed_at"])]

    def __str__(self):
        return f"Vue de {self.annonce} le {self.viewed_at:%d/%m/%Y %H:%M}"


class SearchLog(models.Model):
    """Journal des recherches effectuées (pour comprendre la demande du marché)."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="search_logs",
    )
    city = models.CharField(max_length=100, blank=True)
    property_type = models.CharField(max_length=20, blank=True)
    transaction_type = models.CharField(max_length=10, blank=True)
    price_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    price_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    results_count = models.PositiveIntegerField(default=0)
    searched_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Recherche"
        verbose_name_plural = "Recherches"
        ordering = ["-searched_at"]

    def __str__(self):
        return f"Recherche: {self.city or 'Toutes villes'} — {self.searched_at:%d/%m/%Y}"


class AgencyPerformance(models.Model):
    """Statistiques agrégées mensuelles par agence (calculées via tâche Celery)."""

    agency = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="performance_reports"
    )
    month = models.DateField(help_text="Premier jour du mois concerné")
    annonces_published = models.PositiveIntegerField(default=0)
    total_views = models.PositiveIntegerField(default=0)
    total_messages_received = models.PositiveIntegerField(default=0)
    annonces_sold = models.PositiveIntegerField(default=0)
    annonces_rented = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Performance agence"
        verbose_name_plural = "Performances agences"
        unique_together = ("agency", "month")
        ordering = ["-month"]

    def __str__(self):
        return f"{self.agency} — {self.month:%B %Y}"
