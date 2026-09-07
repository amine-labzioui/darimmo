"""
URLs — Tableau de bord Administrateur DarImmo
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views
from .views import AdminVisitRequestViewSet

router = DefaultRouter()

router.register(
    r"visit-requests",
    AdminVisitRequestViewSet,
    basename="admin-visit-requests",
)

router.register(
    r"users",
    views.AdminUserViewSet,
    basename="admin-user",
)

router.register(
    r"annonces",
    views.AdminAnnonceModerationViewSet,
    basename="admin-annonce",
)

urlpatterns = [
    path("stats/", views.AdminStatsView.as_view(), name="admin-stats"),
    path(
        "activity-log/",
        views.ActivityLogListView.as_view(),
        name="admin-activity-log",
    ),
    path("", include(router.urls)),
]