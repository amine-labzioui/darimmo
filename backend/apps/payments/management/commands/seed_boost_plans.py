from django.core.management.base import BaseCommand

from apps.payments.models import BoostPlan


class Command(BaseCommand):
    help = "Créer les formules de boost DarImmo"

    def handle(self, *args, **kwargs):

        plans = [

            {
                "name": "Boost 7 jours",
                "duration_days": 7,
                "price": 49,
                "description": "Annonce mise en avant pendant 7 jours.",
            },

            {
                "name": "Boost 15 jours",
                "duration_days": 15,
                "price": 89,
                "description": "Visibilité renforcée pendant 15 jours.",
            },

            {
                "name": "Boost 30 jours",
                "duration_days": 30,
                "price": 149,
                "description": "Annonce Premium pendant un mois.",
            },

        ]

        for plan in plans:

            BoostPlan.objects.update_or_create(

                name=plan["name"],

                defaults=plan,

            )

        self.stdout.write(

            self.style.SUCCESS("Boost Plans créés avec succès.")

        )