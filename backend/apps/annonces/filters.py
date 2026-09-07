"""
Filtres — Annonces DarImmo
Permet la recherche par ville, type, prix, etc. via query params.
Ex : /api/annonces/?city=Casablanca&property_type=villa&price_min=500000&price_max=3000000
"""

import django_filters

from .models import Annonce


class AnnonceFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(field_name="city", lookup_expr="iexact")
    property_type = django_filters.CharFilter(field_name="property_type")
    transaction_type = django_filters.CharFilter(field_name="transaction_type")
    price_min = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    price_max = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    surface_min = django_filters.NumberFilter(field_name="surface", lookup_expr="gte")
    bedrooms_min = django_filters.NumberFilter(field_name="bedrooms", lookup_expr="gte")
    has_pool = django_filters.BooleanFilter(field_name="has_pool")
    has_parking = django_filters.BooleanFilter(field_name="has_parking")
    is_furnished = django_filters.BooleanFilter(field_name="is_furnished")

    class Meta:
        model = Annonce
        fields = [
            "city", "property_type", "transaction_type", "price_min", "price_max",
            "surface_min", "bedrooms_min", "has_pool", "has_parking", "is_furnished",
        ]
