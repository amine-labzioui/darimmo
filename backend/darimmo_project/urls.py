"""
URLs principales — DarImmo
Agrège les routes de toutes les apps sous /api/
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework_simplejwt.views import TokenRefreshView

schema_view = get_schema_view(
    openapi.Info(
        title="DarImmo API",
        default_version="v1",
        description="API REST de la plateforme immobilière DarImmo — Maroc",
        contact=openapi.Contact(email="contact@darimmo.ma"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # ===== Documentation API =====
    path("api/docs/", schema_view.with_ui("swagger", cache_timeout=0), name="api-docs"),

    # ===== Authentification JWT =====
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # ===== Apps =====
    path("api/users/", include("apps.users.urls")),
    path("api/admin-dashboard/", include("apps.admin_dashboard.urls")),
    path("api/client-dashboard/", include("apps.client_dashboard.urls")),
    path("api/annonces/", include("apps.annonces.urls")),
    path("api/messaging/", include("apps.messaging.urls")),
    path("api/payments/", include("apps.payments.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
    path("api/ai/", include("apps.ai_integration.urls")),
    path("api/agency-dashboard/", include("apps.agency_dashboard.urls"))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
