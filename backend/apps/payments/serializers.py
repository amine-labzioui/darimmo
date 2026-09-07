"""
Serializers — Paiements DarImmo
"""

from rest_framework import serializers

from .models import BoostPlan, Transaction


class BoostPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoostPlan
        fields = [
            "id",
            "name",
            "duration_days",
            "price",
            "description",
        ]


class TransactionSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    annonce_title = serializers.CharField(
        source="annonce.title",
        read_only=True,
    )

    boost_plan_name = serializers.CharField(
        source="boost_plan.name",
        read_only=True,
    )

    class Meta:
        model = Transaction
        fields = [
            "id",
            "user",
            "annonce",
            "annonce_title",
            "boost_plan",
            "boost_plan_name",
            "provider",
            "provider_reference",
            "amount",
            "status",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "status",
            "provider_reference",
            "created_at",
        ]

    def get_user(self, obj):
        if not obj.user:
            return "-"

        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()

        if full_name:
            return full_name

        return obj.user.username or obj.user.email


class CreateCheckoutSerializer(serializers.Serializer):
    """
    Données nécessaires pour démarrer un paiement
    """

    annonce_id = serializers.IntegerField()
    boost_plan_id = serializers.IntegerField()

    provider = serializers.ChoiceField(
        choices=Transaction.Provider.choices,
        default="stripe",
    )