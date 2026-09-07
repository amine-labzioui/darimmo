#!/usr/bin/env python
"""
Script de création du super-utilisateur — DarImmo
Crée un compte administrateur sans passer par le prompt interactif.

Usage : python scripts/create_superuser.py
Variables d'environnement optionnelles :
  DJANGO_SUPERUSER_EMAIL, DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_PASSWORD
"""

import os
import sys

import django

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "darimmo_project.settings")
django.setup()

from django.contrib.auth import get_user_model  # noqa: E402

User = get_user_model()


def main():
    email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@darimmo.ma")
    username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
    password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "ChangeMoi123!")

    if User.objects.filter(email=email).exists():
        print(f"⚠️  Un utilisateur avec l'email {email} existe déjà.")
        return

    User.objects.create_superuser(
        username=username, email=email, password=password, role=User.Role.ADMIN
    )
    print(f"✅ Super-utilisateur créé : {email} (mot de passe : {password})")
    print("⚠️  Pensez à changer ce mot de passe en production !")


if __name__ == "__main__":
    main()
