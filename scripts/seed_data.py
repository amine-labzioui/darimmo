#!/usr/bin/env python
"""
Script de génération de données de test — DarImmo
Crée des utilisateurs et annonces fictifs pour le développement.

Usage : python scripts/seed_data.py
"""

import os
import random
import sys

import django

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "darimmo_project.settings")
django.setup()

from apps.annonces.models import Annonce  # noqa: E402
from apps.users.models import User  # noqa: E402

CITIES = ["Casablanca", "Marrakech", "Rabat", "Tanger", "Fès", "Agadir"]
PROPERTY_TYPES = ["villa", "appartement", "riad", "maison", "terrain"]
TRANSACTION_TYPES = ["vente", "location"]

ANNONCE_TITLES = [
    "Villa moderne avec piscine et jardin",
    "Appartement haut standing centre-ville",
    "Riad traditionnel rénové dans la médina",
    "Maison familiale avec terrasse",
    "Terrain constructible vue mer",
    "Duplex lumineux avec parking",
    "Penthouse avec vue panoramique",
    "Villa de luxe sécurisée",
]


def create_agencies(n=5):
    agencies = []
    for i in range(n):
        email = f"agence{i+1}@darimmo.ma"
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": f"agence{i+1}",
                "role": User.Role.AGENCE,
                "company_name": f"Immobilière {['Atlas', 'Médina', 'Oasis', 'Riviera', 'Maghreb'][i]}",
                "city": random.choice(CITIES),
                "is_verified": True,
            },
        )
        if created:
            user.set_password("Passw0rd!123")
            user.save()
        agencies.append(user)
    return agencies


def create_clients(n=10):
    clients = []
    for i in range(n):
        email = f"client{i+1}@example.com"
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": f"client{i+1}",
                "role": User.Role.CLIENT,
                "city": random.choice(CITIES),
            },
        )
        if created:
            user.set_password("Passw0rd!123")
            user.save()
        clients.append(user)
    return clients


def create_annonces(agencies, n=30):
    created_count = 0
    for _ in range(n):
        owner = random.choice(agencies)
        property_type = random.choice(PROPERTY_TYPES)
        Annonce.objects.create(
            owner=owner,
            title=f"{random.choice(ANNONCE_TITLES)} — {random.choice(CITIES)}",
            description=(
                "Magnifique bien situé dans un quartier prisé, proche des commodités, "
                "écoles et axes routiers principaux. Idéal pour famille ou investissement."
            ),
            property_type=property_type,
            transaction_type=random.choice(TRANSACTION_TYPES),
            status=Annonce.Status.PUBLISHED,
            city=random.choice(CITIES),
            neighborhood=random.choice(["Centre-ville", "Maarif", "Gauthier", "Hivernage", "Agdal"]),
            price=random.randint(800, 6000) * 1000,
            surface=random.randint(80, 450),
            bedrooms=random.randint(1, 6),
            bathrooms=random.randint(1, 4),
            has_parking=random.choice([True, False]),
            has_pool=random.choice([True, False]),
            has_garden=random.choice([True, False]),
            is_furnished=random.choice([True, False]),
            is_featured=random.random() < 0.2,
        )
        created_count += 1
    return created_count


def main():
    print("👥 Création des agences...")
    agencies = create_agencies()
    print(f"   {len(agencies)} agence(s) créée(s).")

    print("👤 Création des clients...")
    clients = create_clients()
    print(f"   {len(clients)} client(s) créé(s).")

    print("🏠 Création des annonces...")
    count = create_annonces(agencies)
    print(f"   {count} annonce(s) créée(s).")

    print("✅ Données de test générées avec succès.")
    print("   Mot de passe par défaut pour tous les comptes : Passw0rd!123")


if __name__ == "__main__":
    main()
