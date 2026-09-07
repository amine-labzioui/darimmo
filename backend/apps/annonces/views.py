"""
Vues — Annonces DarImmo
CRUD complet + recherche/filtrage public + gestion par le propriétaire.
"""

from django.db.models import F
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.users.permissions import IsOwnerOrAdmin

from .filters import AnnonceFilter
from .models import Annonce, AnnonceImage
from .serializers import (
    AnnonceCreateUpdateSerializer,
    AnnonceDetailSerializer,
    AnnonceImageSerializer,
    AnnonceListSerializer,
)


class AnnonceViewSet(viewsets.ModelViewSet):
    """
    GET    /api/annonces/                — liste publique (recherche/filtres)
    POST   /api/annonces/                — création (auth requise)
    GET    /api/annonces/{id}/           — détail (+ incrémente les vues)
    PUT    /api/annonces/{id}/           — édition (propriétaire/admin)
    DELETE /api/annonces/{id}/           — suppression (propriétaire/admin)
    GET    /api/annonces/mes-annonces/   — annonces de l'utilisateur connecté
    POST   /api/annonces/{id}/publier/   — publier une annonce (passe en "published")
    """

    queryset = Annonce.objects.prefetch_related("images").select_related("owner")
    filterset_class = AnnonceFilter
    search_fields = ["title", "description", "city", "neighborhood"]
    ordering_fields = ["price", "surface", "created_at", "views_count"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        if self.action in ["update", "partial_update", "destroy", "publier"]:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "list":
            return AnnonceListSerializer
        if self.action == "retrieve":
            return AnnonceDetailSerializer
        return AnnonceCreateUpdateSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == "list":
            # Le grand public ne voit que les annonces publiées
            qs = qs.filter(status=Annonce.Status.PUBLISHED)
        return qs

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        serializer = self.get_serializer(instance)

        # Ne pas compter la vue du propriétaire
        if not request.user.is_authenticated or request.user != instance.owner:
            instance.views_count += 1
            instance.save()
            
    
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def mes_annonces(self, request):
        qs = Annonce.objects.filter(owner=request.user).prefetch_related("images")
        page = self.paginate_queryset(qs)
        serializer = AnnonceListSerializer(page or qs, many=True, context={"request": request})
        return self.get_paginated_response(serializer.data) if page else Response(serializer.data)

    @action(detail=True, methods=["post"])
    def publier(self, request, pk=None):
        annonce = self.get_object()
        annonce.status = Annonce.Status.PUBLISHED
        annonce.published_at = timezone.now()
        annonce.save(update_fields=["status", "published_at"])
        return Response(AnnonceDetailSerializer(annonce, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def marquer_vendue(self, request, pk=None):
        annonce = self.get_object()
        annonce.status = Annonce.Status.SOLD
        annonce.save(update_fields=["status"])
        return Response({"detail": "Annonce marquée comme vendue."})

    @action(
        detail=True, methods=["post"], parser_classes=None,
        permission_classes=[permissions.IsAuthenticated, IsOwnerOrAdmin],
    )
    def ajouter_photos(self, request, pk=None):
        annonce = self.get_object()
        images = request.FILES.getlist("images")
        if not images:
            return Response({"detail": "Aucune image fournie."}, status=status.HTTP_400_BAD_REQUEST)
        created = []
        start = annonce.images.count()
        for idx, img in enumerate(images):
            obj = AnnonceImage.objects.create(
                annonce=annonce, image=img, order=start + idx, is_primary=(start + idx == 0)
            )
            created.append(obj)
        return Response(
            AnnonceImageSerializer(created, many=True, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
