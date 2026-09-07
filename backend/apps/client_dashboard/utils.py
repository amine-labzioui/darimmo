"""
Fonctions utilitaires — Tableau de bord Client DarImmo
"""

from apps.annonces.models import Annonce


def get_matching_annonces(saved_search):
    """
    Retourne les annonces publiées correspondant aux critères
    d'une recherche sauvegardée (utilisé pour les alertes par e-mail).
    """
    qs = Annonce.objects.filter(status=Annonce.Status.PUBLISHED)

    if saved_search.city:
        qs = qs.filter(city__iexact=saved_search.city)
    if saved_search.property_type:
        qs = qs.filter(property_type=saved_search.property_type)
    if saved_search.transaction_type:
        qs = qs.filter(transaction_type=saved_search.transaction_type)
    if saved_search.price_min is not None:
        qs = qs.filter(price__gte=saved_search.price_min)
    if saved_search.price_max is not None:
        qs = qs.filter(price__lte=saved_search.price_max)

    return qs.order_by("-created_at")


def parse_preferred_list(raw_value: str) -> list[str]:
    """Convertit 'Casablanca, Marrakech' -> ['Casablanca', 'Marrakech']."""
    if not raw_value:
        return []
    return [item.strip() for item in raw_value.split(",") if item.strip()]
