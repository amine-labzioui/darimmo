"""
WSGI config — DarImmo
Point d'entrée pour les serveurs de production (Gunicorn, etc.)
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "darimmo_project.settings")

application = get_wsgi_application()
