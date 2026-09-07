"""
Serializers — Tableau de bord Client DarImmo
"""

from rest_framework import serializers

from .models import ClientProfile, SavedSearch, VisitRequest


class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = [
            "id",
            "preferred_cities",
            "preferred_property_types",
            "budget_range",
            "is_looking_to_buy",
            "is_looking_to_rent",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]


class VisitRequestSerializer(serializers.ModelSerializer):
    annonce_title = serializers.CharField(
        source="annonce.title",
        read_only=True,
    )

    annonce_id = serializers.IntegerField(
        source="annonce.id",
        read_only=True,
    )

    annonce_city = serializers.CharField(
        source="annonce.city",
        read_only=True,
    )

    client_name = serializers.CharField(
        source="client.get_full_name",
        read_only=True,
    )

    client_email = serializers.EmailField(
        source="client.email",
        read_only=True,
    )

    client_phone = serializers.CharField(
        source="client.phone",
        read_only=True,
        allow_blank=True,
    )

    main_image = serializers.CharField(
        source="annonce.main_image",
        read_only=True,
    )

    price = serializers.DecimalField(
        source="annonce.price",
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )



    proposed_date = serializers.SerializerMethodField()
    owner_message = serializers.SerializerMethodField()
    is_seen_by_client = serializers.SerializerMethodField()
    is_seen_by_owner = serializers.SerializerMethodField()
    completed_at = serializers.SerializerMethodField()

    class Meta:
        model = VisitRequest

        fields = [
            "id",

            "annonce",
            "annonce_id",
            "annonce_title",
            "annonce_city",

            "client",
            "client_name",
            "client_email",
            "client_phone",

            "requested_date",
            "confirmed_date",
            "proposed_date",

            "status",

            "client_message",
            "owner_message",

            "is_seen_by_client",
            "is_seen_by_owner",

            "created_at",
            "updated_at",
            "completed_at",

            "main_image",
            "price",
        ]

        read_only_fields = [
            "created_at",
            "updated_at",
            "completed_at",
        ]

    def get_proposed_date(self, obj):
        if hasattr(obj, "admin_action"):
            return obj.admin_action.proposed_date
        return None

    def get_owner_message(self, obj):
        if hasattr(obj, "admin_action"):
            return obj.admin_action.owner_message
        return ""

    def get_is_seen_by_client(self, obj):
        if hasattr(obj, "admin_action"):
            return obj.admin_action.is_seen_by_client
        return False

    def get_is_seen_by_owner(self, obj):
        if hasattr(obj, "admin_action"):
            return obj.admin_action.is_seen_by_owner
        return True

    def get_completed_at(self, obj):
        if hasattr(obj, "admin_action"):
            return obj.admin_action.completed_at
        return None


class SavedSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedSearch
        fields = [
            "id",
            "name",
            "city",
            "property_type",
            "transaction_type",
            "price_min",
            "price_max",
            "notify_by_email",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at"]


class ClientDashboardSummarySerializer(serializers.Serializer):
    """Résumé pour la page d'accueil du tableau de bord client."""

    favorites_count = serializers.IntegerField()
    visit_requests_count = serializers.IntegerField()
    pending_visits_count = serializers.IntegerField()
    saved_searches_count = serializers.IntegerField()
    unread_messages_count = serializers.IntegerField()