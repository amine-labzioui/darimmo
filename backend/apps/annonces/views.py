"""
Vues — Annonces DarImmo
CRUD complet + recherche/filtrage public + gestion par le propriétaire.

NOTE IMPORTANTE :
Djongo (l'ORM MongoDB utilisé ici) ne sait pas traduire correctement en
requête MongoDB les comparaisons numériques (price__gte/__lte sur un champ
Decimal128) ni les filtres booléens (has_pool, has_parking, is_furnished) —
cela provoque une DatabaseError. Ces filtres sont donc retirés de
AnnonceFilter (voir filters.py) et appliqués manuellement en Python dans
AnnonceViewSet.list(), après récupération des objets depuis la base.
"""

from decimal import Decimal, InvalidOperation

from bson.decimal128 import Decimal128
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

    # Filtres numériques appliqués côté Python (voir note en haut du fichier).
    # Format : {nom du query param : (nom du champ sur Annonce, lookup)}
    PYTHON_SIDE_NUMERIC_FILTERS = {
        "price_min": ("price", "gte"),
        "price_max": ("price", "lte"),
        "surface_min": ("surface", "gte"),
        "bedrooms_min": ("bedrooms", "gte"),
    }
    # Filtres booléens appliqués côté Python (voir note en haut du fichier).
    PYTHON_SIDE_BOOL_FILTERS = ["has_pool", "has_parking", "is_furnished"]

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

    def list(self, request, *args, **kwargs):
        """
        Liste publique des annonces, avec :
        - filtres textuels (city, property_type, transaction_type) appliqués
          via AnnonceFilter / Djongo (fonctionne correctement)
        - filtres numériques et booléens appliqués manuellement en Python
          ci-dessous, pour contourner le bug Djongo sur ces types de
          comparaisons (voir note en haut du fichier)
        """
        queryset = self.filter_queryset(self.get_queryset())
        results = list(queryset)
        params = request.query_params

        # --- Filtres numériques (price_min, price_max, surface_min, bedrooms_min) ---
        # Djongo renvoie price/surface sous forme de bson.Decimal128, qui ne
        # supporte ni float() ni la comparaison directe : on convertit tout
        # en decimal.Decimal avant de comparer.
        def to_decimal(v):
            return v.to_decimal() if isinstance(v, Decimal128) else Decimal(str(v))

        for param_name, (field_name, lookup) in self.PYTHON_SIDE_NUMERIC_FILTERS.items():
            raw_value = params.get(param_name)
            if raw_value in (None, ""):
                continue
            try:
                value = Decimal(raw_value.strip())
            except InvalidOperation:
                continue  # valeur mal formatée (ex. "abc") : filtre ignoré
            if not value.is_finite():
                continue  # "nan", "inf" : filtre ignoré
            if lookup == "gte":
                results = [a for a in results if to_decimal(getattr(a, field_name)) >= value]
            else:
                results = [a for a in results if to_decimal(getattr(a, field_name)) <= value]

        # --- Filtres booléens (has_pool, has_parking, is_furnished) ---
        for param_name in self.PYTHON_SIDE_BOOL_FILTERS:
            raw_value = params.get(param_name)
            if raw_value in (None, ""):
                continue
            wanted = raw_value.lower() in ("true", "1", "yes")
            results = [a for a in results if bool(getattr(a, param_name)) == wanted]

        page = self.paginate_queryset(results)
        serializer = self.get_serializer(page if page is not None else results, many=True)
        return (
            self.get_paginated_response(serializer.data)
            if page is not None
            else Response(serializer.data)
        )

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