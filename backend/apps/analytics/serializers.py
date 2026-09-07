"""
Serializers — Analytics & Statistiques DarImmo
"""

from rest_framework import serializers

from .models import AgencyPerformance, PropertyView, SearchLog


class PropertyViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyView
        fields = ["id", "annonce", "user", "ip_address", "viewed_at"]
        read_only_fields = ["id", "viewed_at"]


class SearchLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchLog
        fields = [
            "id", "city", "property_type", "transaction_type",
            "price_min", "price_max", "results_count", "searched_at",
        ]
        read_only_fields = ["id", "searched_at"]


class AgencyPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgencyPerformance
        fields = [
            "id", "agency", "month", "annonces_published", "total_views",
            "total_messages_received", "annonces_sold", "annonces_rented",
        ]


class AnnonceAnalyticsSerializer(serializers.Serializer):
    """Statistiques d'une annonce spécifique pour son propriétaire."""

    annonce_id = serializers.IntegerField()
    title = serializers.CharField()
    total_views = serializers.IntegerField()
    views_last_7_days = serializers.IntegerField()
    views_last_30_days = serializers.IntegerField()
    messages_count = serializers.IntegerField()
    favorites_count = serializers.IntegerField()


class TopCitySerializer(serializers.Serializer):
    city = serializers.CharField()
    annonces_count = serializers.IntegerField()
    searches_count = serializers.IntegerField()
