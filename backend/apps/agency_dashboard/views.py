from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.client_dashboard.models import VisitRequest
from apps.admin_dashboard.models import VisitRequestAction

from .serializers import AgencyVisitRequestSerializer


class AgencyVisitRequestViewSet(viewsets.ModelViewSet):
    """
    Gestion des demandes de visite par l'agence propriétaire.
    """

    serializer_class = AgencyVisitRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            VisitRequest.objects.filter(
                annonce__owner=self.request.user
            )
            .select_related(
                "annonce",
                "client",
            )
            .order_by("-created_at")
        )
    
    def partial_update(self, request, *args, **kwargs):
        visit = self.get_object()

        if "status" in request.data:
            visit.status = request.data["status"]

        if "confirmed_date" in request.data:
            visit.confirmed_date = request.data["confirmed_date"]

        if "owner_message" in request.data:
            visit.owner_message = request.data["owner_message"]

        visit.save()

        return Response(
           AgencyVisitRequestSerializer(visit).data
        )

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        visit = self.get_object()

        visit.status = VisitRequest.Status.ACCEPTED
        visit.save(update_fields=["status"])

        action, _ = VisitRequestAction.objects.get_or_create(
            visit_request=visit
        )

        action.owner_message = request.data.get("message", "")
        action.save()

        return Response({"success": True})

    @action(detail=True, methods=["post"])
    def refuse(self, request, pk=None):
        visit = self.get_object()

        visit.status = VisitRequest.Status.REFUSED
        visit.save(update_fields=["status"])

        action, _ = VisitRequestAction.objects.get_or_create(
            visit_request=visit
        )

        action.owner_message = request.data.get("message", "")
        action.save()

        return Response({"success": True})

    @action(detail=True, methods=["post"])
    def reschedule(self, request, pk=None):
        visit = self.get_object()

        visit.status = VisitRequest.Status.RESCHEDULED
        visit.save(update_fields=["status"])

        action, _ = VisitRequestAction.objects.get_or_create(
            visit_request=visit
        )

        action.proposed_date = request.data.get("proposed_date")
        action.owner_message = request.data.get("message", "")
        action.save()

        return Response({"success": True})