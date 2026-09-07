from rest_framework import serializers
from apps.client_dashboard.models import VisitRequest
from apps.admin_dashboard.models import VisitRequestAction


class AgencyVisitRequestSerializer(serializers.ModelSerializer):
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

    confirmed_date = serializers.DateTimeField(
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
            "confirmed_date",
            
            "status",

            "proposed_date",
            "owner_message",

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