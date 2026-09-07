from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AgencyVisitRequestViewSet

router = DefaultRouter()

router.register(
    "visit-requests",
    AgencyVisitRequestViewSet,
    basename="agency-visit-requests",
)

urlpatterns = [
    path("", include(router.urls)),
]