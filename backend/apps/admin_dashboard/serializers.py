"""
Serializers — Tableau de bord Administrateur DarImmo
"""

from rest_framework import serializers
from apps.client_dashboard.models import VisitRequest
from .models import VisitRequestAction

from apps.annonces.models import Annonce
from apps.users.models import User

from .models import ActivityLog


class AdminStatsSerializer(serializers.Serializer):
    """Statistiques globales pour le tableau de bord admin."""

    total_users = serializers.IntegerField()
    total_clients = serializers.IntegerField()
    total_agences = serializers.IntegerField()
    total_annonces = serializers.IntegerField()
    annonces_published = serializers.IntegerField()
    annonces_pending = serializers.IntegerField()
    annonces_sold = serializers.IntegerField()
    annonces_rented = serializers.IntegerField()
    annonces_archived = serializers.IntegerField()
    total_views = serializers.IntegerField()
    visit_requests_count = serializers.IntegerField()
    visit_pending_count = serializers.IntegerField()
    visit_accepted_count = serializers.IntegerField()
    visit_refused_count = serializers.IntegerField()


class AdminUserSerializer(serializers.ModelSerializer):
    """Vue admin sur un utilisateur — inclut champs de modération."""

    annonces_count = serializers.IntegerField(source="annonces.count", read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name", "phone",
            "role", "city", "company_name", "is_verified", "is_active",
            "annonces_count", "date_joined", "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login", "annonces_count"]


class AdminAnnonceSerializer(serializers.ModelSerializer):
    """Vue admin sur une annonce — pour modération."""

    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    class Meta:
        model = Annonce
        fields = [
            "id", "title", "property_type", "transaction_type", "status",
            "city", "price", "owner", "owner_email", "is_featured",
            "views_count", "created_at",
        ]


class ActivityLogSerializer(serializers.ModelSerializer):
    admin_name = serializers.CharField(source="admin.get_full_name", read_only=True)

    class Meta:
        model = ActivityLog
        fields = ["id", "admin", "admin_name", "action_type", "target_id", "description", "created_at"]
        read_only_fields = ["id", "created_at"]

class AdminVisitRequestSerializer(serializers.ModelSerializer):
    annonce_title = serializers.CharField(source="annonce.title", read_only=True)
    annonce_city = serializers.CharField(source="annonce.city", read_only=True)

    client_name = serializers.CharField(
        source="client.get_full_name",
        read_only=True,
    )

    client_email = serializers.EmailField(
        source="client.email",
        read_only=True,
    )

    proposed_date = serializers.SerializerMethodField()
    owner_message = serializers.SerializerMethodField()

    class Meta:
        model = VisitRequest
        fields = [
            "id",
            "annonce",
            "annonce_title",
            "annonce_city",

            "client",
            "client_name",
            "client_email",

            "requested_date",

            "status",

            "owner_message",
            "proposed_date",

            "created_at",
        ]

    def get_proposed_date(self, obj):
        if hasattr(obj, "admin_action"):
            return obj.admin_action.proposed_date
        return None

    def get_owner_message(self, obj):
        if hasattr(obj, "admin_action"):
            return obj.admin_action.owner_message
        return ""
