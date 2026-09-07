"""
Vues — Analytics & Statistiques DarImmo
Statistiques pour les agences (propriétaires d'annonces) et tendances marché.
"""

from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.annonces.models import Annonce
from apps.messaging.models import Conversation
from apps.users.models import FavoriteProperty

from .models import PropertyView, SearchLog
from .serializers import AnnonceAnalyticsSerializer, TopCitySerializer


class MyAnnoncesAnalyticsView(APIView):
    """
    GET /api/analytics/mes-annonces/
    Statistiques de toutes les annonces de l'utilisateur connecté (agence/client vendeur).
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        last_7_days = now - timedelta(days=7)
        last_30_days = now - timedelta(days=30)

        annonces = Annonce.objects.filter(owner=request.user)
        results = []
        for annonce in annonces:
            results.append({
                "annonce_id": annonce.id,
                "title": annonce.title,
                "total_views": annonce.views_count,
                "views_last_7_days": PropertyView.objects.filter(
                    annonce=annonce, viewed_at__gte=last_7_days
                ).count(),
                "views_last_30_days": PropertyView.objects.filter(
                    annonce=annonce, viewed_at__gte=last_30_days
                ).count(),
                "messages_count": Conversation.objects.filter(annonce=annonce).count(),
                "favorites_count": FavoriteProperty.objects.filter(annonce=annonce).count(),
            })

        serializer = AnnonceAnalyticsSerializer(results, many=True)
        return Response(serializer.data)


class MarketTrendsView(APIView):
    """
    GET /api/analytics/tendances/
    Tendances du marché : villes les plus recherchées, types de biens populaires.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        top_cities_annonces = (
            Annonce.objects.filter(status=Annonce.Status.PUBLISHED)
            .values("city")
            .annotate(annonces_count=Count("id"))
            .order_by("-annonces_count")[:10]
        )
        search_counts = dict(
            SearchLog.objects.exclude(city="")
            .values("city")
            .annotate(searches_count=Count("id"))
            .values_list("city", "searches_count")
        )

        results = [
            {
                "city": row["city"],
                "annonces_count": row["annonces_count"],
                "searches_count": search_counts.get(row["city"], 0),
            }
            for row in top_cities_annonces
        ]
        return Response(TopCitySerializer(results, many=True).data)


class RecordSearchView(APIView):
    """
    POST /api/analytics/log-recherche/
    Enregistre une recherche effectuée par un visiteur (utilisé par le frontend).
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        SearchLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            city=data.get("city", ""),
            property_type=data.get("property_type", ""),
            transaction_type=data.get("transaction_type", ""),
            price_min=data.get("price_min") or None,
            price_max=data.get("price_max") or None,
            results_count=data.get("results_count", 0),
        )
        return Response({"detail": "Recherche enregistrée."}, status=201)
