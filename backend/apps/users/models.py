"""
Modèles — Gestion des utilisateurs DarImmo
Un seul modèle User personnalisé avec rôles (client, agence, admin).
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Utilisateur DarImmo — étend le User Django standard.
    Rôles : client (acheteur/locataire), agence (vendeur professionnel), admin.
    """

    class Role(models.TextChoices):
        CLIENT = "client", "Client"
        AGENCE = "agence", "Agence immobilière"
        ADMIN = "admin", "Administrateur"

    email = models.EmailField(unique=True, verbose_name="Adresse e-mail")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone")
    role = models.CharField(
        max_length=10, choices=Role.choices, default=Role.CLIENT, verbose_name="Rôle"
    )
    avatar = models.ImageField(
        upload_to="profiles/", blank=True, null=True, verbose_name="Photo de profil"
    )
    city = models.CharField(max_length=100, blank=True, verbose_name="Ville")
    is_verified = models.BooleanField(default=False, verbose_name="Compte vérifié")
    company_name = models.CharField(
        max_length=150, blank=True, verbose_name="Nom de l'agence (si agence)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"

    @property
    def is_agence(self):
        return self.role == self.Role.AGENCE

    @property
    def is_client(self):
        return self.role == self.Role.CLIENT


class FavoriteProperty(models.Model):
    """Biens favoris d'un utilisateur (liste de souhaits)."""

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="favorites"
    )
    annonce = models.ForeignKey(
        "annonces.Annonce", on_delete=models.CASCADE, related_name="favorited_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Bien favori"
        verbose_name_plural = "Biens favoris"
        unique_together = ("user", "annonce")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} ❤ {self.annonce}"
