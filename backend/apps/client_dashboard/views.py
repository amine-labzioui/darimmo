"""
Vues — Tableau de bord Client DarImmo
"""
from django.utils import timezone
from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.messaging.models import Message
from apps.users.models import FavoriteProperty
from apps.annonces.models import Annonce

from .models import ClientProfile, SavedSearch, VisitRequest
from .serializers import (
    ClientDashboardSummarySerializer,
    ClientProfileSerializer,
    SavedSearchSerializer,
    VisitRequestSerializer,
)


class ClientProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ClientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = ClientProfile.objects.get_or_create(user=self.request.user)
        return profile


class ClientDashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        data = {
            "favorites_count": FavoriteProperty.objects.filter(user=user).count(),
            "visit_requests_count": VisitRequest.objects.filter(client=user).count(),
            "pending_visits_count": VisitRequest.objects.filter(
                client=user,
                status=VisitRequest.Status.PENDING,
            ).count(),
            "saved_searches_count": SavedSearch.objects.filter(user=user).count(),
            "unread_messages_count": Message.objects.filter(
                recipient=user,
                is_read=False,
            ).count(),
        }

        return Response(ClientDashboardSummarySerializer(data).data)


class VisitRequestViewSet(viewsets.ModelViewSet):
    serializer_class = VisitRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            VisitRequest.objects.filter(client=self.request.user)
            .select_related("annonce", "client")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    def partial_update(self, request, *args, **kwargs):

        visit = self.get_object()

        status = request.data.get("status")
        confirmed_date = request.data.get("confirmed_date")
        owner_message = request.data.get("owner_message")

        if status:
            visit.status = status

        if confirmed_date:
            visit.confirmed_date = confirmed_date

        if owner_message is not None:
            visit.owner_message = owner_message

        if status == VisitRequest.Status.COMPLETED:
            visit.completed_at = timezone.now()

        visit.is_seen_by_client = False

        visit.save()

        serializer = self.get_serializer(visit)

        return Response(serializer.data)


class SavedSearchViewSet(viewsets.ModelViewSet):
    serializer_class = SavedSearchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedSearch.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)