"""
Modèles — Annonces immobilières DarImmo
Couvre : villas, appartements, riads, maisons, terrains.
"""

from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator


from core.mixins import Decimal128Mixin


class Annonce(Decimal128Mixin, models.Model):
    """Annonce immobilière publiée par une agence ou un client."""

    class PropertyType(models.TextChoices):
        VILLA = "villa", "Villa"
        APPARTEMENT = "appartement", "Appartement"
        RIAD = "riad", "Riad"
        MAISON = "maison", "Maison"
        TERRAIN = "terrain", "Terrain"

    class TransactionType(models.TextChoices):
        VENTE = "vente", "À Vendre"
        LOCATION = "location", "À Louer"

    class Status(models.TextChoices):
        DRAFT = "draft", "Brouillon"
        PENDING = "pending", "En attente de validation"
        PUBLISHED = "published", "Publiée"
        SOLD = "sold", "Vendue"
        RENTED = "rented", "Louée"
        ARCHIVED = "archived", "Archivée"

    # ===== Relations =====
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="annonces"
    )

    # ===== Informations principales =====
    title = models.CharField(max_length=200, verbose_name="Titre")
    description = models.TextField(verbose_name="Description")
    property_type = models.CharField(
        max_length=20, choices=PropertyType.choices, verbose_name="Type de bien"
    )
    transaction_type = models.CharField(
        max_length=10, choices=TransactionType.choices, verbose_name="Type de transaction"
    )
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.PENDING, verbose_name="Statut"
    )

    # ===== Localisation =====
    city = models.CharField(max_length=100, verbose_name="Ville")
    neighborhood = models.CharField(max_length=150, blank=True, verbose_name="Quartier")
    address = models.CharField(max_length=255, blank=True, verbose_name="Adresse")
    latitude = models.DecimalField(max_digits=12, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=12, decimal_places=7, null=True, blank=True)

    # ===== Prix & caractéristiques =====
    price = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)],
        verbose_name="Prix (MAD)",
    )
    surface = models.DecimalField(
        max_digits=8, decimal_places=2, validators=[MinValueValidator(0)],
        verbose_name="Surface (m²)",
    )
    bedrooms = models.PositiveSmallIntegerField(default=0, verbose_name="Chambres")
    bathrooms = models.PositiveSmallIntegerField(default=0, verbose_name="Salles de bain")
    has_parking = models.BooleanField(default=False, verbose_name="Parking")
    has_pool = models.BooleanField(default=False, verbose_name="Piscine")
    has_garden = models.BooleanField(default=False, verbose_name="Jardin")
    is_furnished = models.BooleanField(default=False, verbose_name="Meublé")

    # ===== Mise en avant =====
    is_featured = models.BooleanField(default=False, verbose_name="Mis en avant")
    is_boosted = models.BooleanField(default=False, verbose_name="Boosté (payant)")
    boosted_until = models.DateTimeField(null=True, blank=True)

    # ===== Stats =====
    views_count = models.PositiveIntegerField(default=0, verbose_name="Nombre de vues")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Annonce"
        verbose_name_plural = "Annonces"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["city", "property_type"]),
            models.Index(fields=["transaction_type", "status"]),
        ]

    def __str__(self):
        return f"{self.title} — {self.city} ({self.get_property_type_display()})"

    @property
    def main_image(self):
        first = self.images.first()
        return first.image.url if first else None


class AnnonceImage(models.Model):
    """Photos associées à une annonce."""

    annonce = models.ForeignKey(Annonce, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="annonces/")
    is_primary = models.BooleanField(default=False, verbose_name="Photo principale")
    order = models.PositiveSmallIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Photo d'annonce"
        verbose_name_plural = "Photos d'annonces"
        ordering = ["order", "uploaded_at"]

    def __str__(self):
        return f"Photo de {self.annonce.title}"
