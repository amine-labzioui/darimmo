"""
URLs — Messagerie & Notifications DarImmo
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"conversations", views.ConversationViewSet, basename="conversation")
router.register(r"notifications", views.NotificationViewSet, basename="notification")

urlpatterns = [
    path("", include(router.urls)),
]
