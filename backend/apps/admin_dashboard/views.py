"""
Vues — Tableau de bord Administrateur DarImmo
Statistiques globales, gestion utilisateurs, modération des annonces.
"""
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .serializers import AdminVisitRequestSerializer
from .models import VisitRequestAction

from django.db.models import Sum, Case, When, IntegerField
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.annonces.models import Annonce
from apps.users.models import User
from apps.users.permissions import IsAdminRole
from apps.client_dashboard.models import VisitRequest

from .models import ActivityLog
from .serializers import (
    AdminAnnonceSerializer,
    AdminStatsSerializer,
    AdminUserSerializer,
    ActivityLogSerializer,
)


class AdminStatsView(APIView):
    """GET /api/admin-dashboard/stats/ — Vue d'ensemble du tableau de bord."""

    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get(self, request):
        data = {
            "total_users": User.objects.count(),
            "total_clients": User.objects.filter(role=User.Role.CLIENT).count(),
            "total_agences": User.objects.filter(role=User.Role.AGENCE).count(),
            "total_annonces": Annonce.objects.count(),
            "annonces_published": Annonce.objects.filter(status=Annonce.Status.PUBLISHED).count(),
            "annonces_pending": Annonce.objects.filter(status=Annonce.Status.PENDING).count(),
            "annonces_sold": Annonce.objects.filter(status=Annonce.Status.SOLD).count(),
            "annonces_rented": Annonce.objects.filter(status=Annonce.Status.RENTED).count(),
            "annonces_archived": Annonce.objects.filter(status=Annonce.Status.ARCHIVED).count(),
            "total_views": Annonce.objects.aggregate(total=Sum("views_count"))["total"] or 0,
            "visit_requests_count": VisitRequest.objects.count(),
            "visit_pending_count": VisitRequest.objects.filter(status="pending").count(),
            "visit_accepted_count": VisitRequest.objects.filter(status="accepted").count(),
            "visit_refused_count": VisitRequest.objects.filter(status="refused").count(),
        }
        return Response(AdminStatsSerializer(data).data)


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Gestion complète des utilisateurs par l'administrateur.
    GET    /api/admin-dashboard/users/
    PATCH  /api/admin-dashboard/users/{id}/
    POST   /api/admin-dashboard/users/{id}/suspendre/
    POST   /api/admin-dashboard/users/{id}/verifier/
    """

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    filterset_fields = ["role", "is_active", "is_verified", "city"]
    search_fields = ["email", "username", "first_name", "last_name"]

    @action(detail=True, methods=["post"])
    def suspendre(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save(update_fields=["is_active"])
        ActivityLog.objects.create(
            admin=request.user, action_type=ActivityLog.ActionType.USER_SUSPENDED,
            target_id=user.id, description=f"Compte {user.email} suspendu.",
        )
        return Response({"detail": "Utilisateur suspendu."})

    @action(detail=True, methods=["post"])
    def verifier(self, request, pk=None):
        user = self.get_object()
        user.is_verified = True
        user.save(update_fields=["is_verified"])
        ActivityLog.objects.create(
            admin=request.user, action_type=ActivityLog.ActionType.USER_VERIFIED,
            target_id=user.id, description=f"Compte {user.email} vérifié.",
        )
        return Response({"detail": "Utilisateur vérifié."})

    @action(detail=True, methods=["post"])
    def reactiver(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save(update_fields=["is_active"])
        return Response({"detail": "Utilisateur réactivé."})

class AdminAnnonceModerationViewSet(viewsets.ModelViewSet):
    """
    Modération des annonces par l'administrateur.
    GET   /api/admin-dashboard/annonces/?status=pending
    POST  /api/admin-dashboard/annonces/{id}/approuver/
    POST  /api/admin-dashboard/annonces/{id}/rejeter/
    """

    queryset = Annonce.objects.all().order_by("-created_at")

    serializer_class = AdminAnnonceSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    filterset_fields = [
        "status",
        "property_type",
        "transaction_type",
        "city",
    ]

    @action(detail=True, methods=["post"])
    def approuver(self, request, pk=None):
        from django.utils import timezone

        annonce = self.get_object()
        annonce.status = Annonce.Status.PUBLISHED
        annonce.published_at = timezone.now()
        annonce.save(update_fields=["status", "published_at"])

        ActivityLog.objects.create(
            admin=request.user,
            action_type=ActivityLog.ActionType.ANNONCE_APPROVED,
            target_id=annonce.id,
            description=f"Annonce '{annonce.title}' approuvée.",
        )

        return Response({"detail": "Annonce approuvée et publiée."})

    @action(detail=True, methods=["post"])
    def rejeter(self, request, pk=None):
        annonce = self.get_object()
        annonce.status = Annonce.Status.DRAFT
        annonce.save(update_fields=["status"])
        ActivityLog.objects.create(
            admin=request.user, action_type=ActivityLog.ActionType.ANNONCE_REJECTED,
            target_id=annonce.id,
            description=f"Annonce '{annonce.title}' rejetée. Motif : {request.data.get('reason', 'N/A')}",
        )
        return Response({"detail": "Annonce rejetée."})

    @action(detail=True, methods=["post"])
    def mettre_en_avant(self, request, pk=None):
        annonce = self.get_object()
        annonce.is_featured = not annonce.is_featured
        annonce.save(update_fields=["is_featured"])
        return Response({"is_featured": annonce.is_featured})


class ActivityLogListView(generics.ListAPIView):
    """GET /api/admin-dashboard/activity-log/ — Journal d'audit."""

    queryset = ActivityLog.objects.select_related("admin").all()
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

class AdminVisitRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminVisitRequestSerializer

    queryset = (
        VisitRequest.objects
        .select_related(
            "annonce",
            "client",
        )
        .order_by("-created_at")
    )

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        visit = self.get_object()

        visit.status = VisitRequest.Status.ACCEPTED
        visit.save()

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
        visit.save()

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
        visit.save()

        action, _ = VisitRequestAction.objects.get_or_create(
            visit_request=visit
        )

        action.proposed_date = request.data.get("requested_date")
        action.owner_message = request.data.get("message", "")
        action.save()

        return Response({"success": True})