"""
Modèles — Paiements DarImmo
Boost d'annonces (mise en avant payante) via Stripe ou CMI.
"""

from django.conf import settings
from django.db import models
from core.mixins import Decimal128Mixin

class BoostPlan(Decimal128Mixin, models.Model):
    """Formule de mise en avant d'annonce (ex : 7 jours, 30 jours)."""

    name = models.CharField(max_length=100)
    duration_days = models.PositiveSmallIntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2, verbose_name="Prix (MAD)")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Formule de boost"
        verbose_name_plural = "Formules de boost"
        ordering = ["price"]

    def __str__(self):
        return f"{self.name} — {self.price} MAD / {self.duration_days}j"


class Transaction(Decimal128Mixin, models.Model):
    """Transaction de paiement (boost d'annonce, abonnement agence, etc.)."""

    class Provider(models.TextChoices):
        STRIPE = "stripe", "Stripe"
        CMI = "cmi", "CMI (Maroc)"

    class Status(models.TextChoices):
        PENDING = "pending", "En attente"
        SUCCEEDED = "succeeded", "Réussie"
        FAILED = "failed", "Échouée"
        REFUNDED = "refunded", "Remboursée"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions"
    )
    annonce = models.ForeignKey(
        "annonces.Annonce", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="transactions",
    )
    boost_plan = models.ForeignKey(
        BoostPlan, on_delete=models.SET_NULL, null=True, blank=True
    )
    provider = models.CharField(max_length=10, choices=Provider.choices)
    provider_reference = models.CharField(
        max_length=255, blank=True, help_text="ID de transaction côté fournisseur"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Montant (MAD)")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Transaction"
        verbose_name_plural = "Transactions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} — {self.amount} MAD ({self.get_status_display()})"

class Invoice(Decimal128Mixin, models.Model):
    """Facture générée après un paiement réussi."""

    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.CASCADE,
        related_name="invoice",
    )

    invoice_number = models.CharField(
        max_length=30,
        unique=True,
    )

    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-issued_at"]

    def __str__(self):
        return self.invoice_number    
