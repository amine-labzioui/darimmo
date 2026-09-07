from django.utils import timezone

from apps.annonces.models import Annonce


def remove_expired_boosts():
    annonces = Annonce.objects.filter(
        is_boosted=True,
        boosted_until__lt=timezone.now(),
    )

    annonces.update(
        is_boosted=False,
        is_featured=False,
        boosted_until=None,
    )