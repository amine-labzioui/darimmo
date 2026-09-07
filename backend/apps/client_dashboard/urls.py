"""
URLs — Tableau de bord Client DarImmo
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"visit-requests", views.VisitRequestViewSet, basename="visit-request")
router.register(r"saved-searches", views.SavedSearchViewSet, basename="saved-search")

urlpatterns = [
    path("profile/", views.ClientProfileView.as_view(), name="client-profile"),
    path("summary/", views.ClientDashboardSummaryView.as_view(), name="client-summary"),
    path("", include(router.urls)),
]
