#!/usr/bin/env python
"""
Script d'initialisation de la base de données — DarImmo
Applique les migrations et crée les données de base (formules de boost, etc.)

Usage : python scripts/init_db.py
"""

import os
import sys

import django

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "darimmo_project.settings")
django.setup()

from django.core.management import call_command  # noqa: E402


def main():
    print("📦 Application des migrations...")
    call_command("makemigrations")
    call_command("migrate")

    print("💰 Création des formules de boost par défaut...")
    from apps.payments.models import BoostPlan

    plans = [
        {"name": "Boost 7 jours", "duration_days": 7, "price": 199,
         "description": "Mettez votre annonce en avant pendant une semaine."},
        {"name": "Boost 15 jours", "duration_days": 15, "price": 349,
         "description": "Visibilité renforcée pendant deux semaines."},
        {"name": "Boost 30 jours", "duration_days": 30, "price": 599,
         "description": "Visibilité maximale pendant un mois complet."},
    ]
    for plan_data in plans:
        BoostPlan.objects.get_or_create(name=plan_data["name"], defaults=plan_data)

    print("✅ Base de données initialisée avec succès.")


if __name__ == "__main__":
    main()
