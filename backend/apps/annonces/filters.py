"""
Filtres — Annonces DarImmo
Permet la recherche par ville, type, etc. via query params.
Les filtres numériques (price_min/max, surface_min, bedrooms_min) et
booléens (has_pool, has_parking, is_furnished) ne sont PAS gérés ici :
Djongo ne sait pas les traduire en requête MongoDB (DatabaseError).
Ils sont appliqués manuellement en Python dans AnnonceViewSet.list().
"""

# Use the rest_framework alias which is commonly available when using
# django-filter with Django REST Framework. This also satisfies
# linters that expect an importable symbol.
from django_filters import rest_framework as filters

from .models import Annonce


class AnnonceFilter(filters.FilterSet):
    city = filters.CharFilter(field_name="city", lookup_expr="iexact")
    property_type = filters.CharFilter(field_name="property_type")
    transaction_type = filters.CharFilter(field_name="transaction_type")

    class Meta:
        model = Annonce
        fields = ["city", "property_type", "transaction_type"]