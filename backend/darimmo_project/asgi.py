"""
ASGI config — DarImmo
Support WebSocket pour la messagerie temps réel et les notifications.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "darimmo_project.settings")

application = get_asgi_application()
