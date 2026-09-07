"""
Gestionnaire Stripe — Paiements DarImmo
Encapsule les appels à l'API Stripe pour le boost d'annonces.
"""

import logging

import stripe
from django.conf import settings
from decimal import Decimal
from bson.decimal128 import Decimal128

stripe.api_key = settings.STRIPE_SECRET_KEY


logger = logging.getLogger(__name__)


class StripeHandler:
    """Wrapper autour de l'API Stripe pour les paiements DarImmo."""

    @staticmethod
    def create_checkout_session(user, boost_plan, annonce, success_url, cancel_url):
        """Crée une session de paiement Stripe Checkout pour booster une annonce."""

        # Conversion du prix Mongo Decimal128 -> Decimal
        price = boost_plan.price

        if isinstance(price, Decimal128):
            price = price.to_decimal()

        if not isinstance(price, Decimal):
            price = Decimal(str(price))

        unit_amount = int(price * 100)

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "mad",
                            "product_data": {
                                "name": f"Boost annonce — {boost_plan.name}",
                                "description": (
                                    f"Mise en avant de '{annonce.title}' "
                                    f"pendant {boost_plan.duration_days} jours"
                                ),
                            },
                            "unit_amount": unit_amount,
                        },
                        "quantity": 1,
                    }
                ],
                mode="payment",
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=user.email,
                metadata={
                    "user_id": str(user.id),
                    "annonce_id": str(annonce.id),
                    "boost_plan_id": str(boost_plan.id),
                },
            )

            return session

        except stripe.error.StripeError as exc:
            logger.error(
                "Erreur Stripe lors de la création de session : %s",
                exc,
            )
            raise

    @staticmethod
    def verify_webhook(payload, sig_header, webhook_secret):
        """Vérifie la signature d'un webhook Stripe entrant."""
        try:
            return stripe.Webhook.construct_event(
                payload,
                sig_header,
                webhook_secret,
            )
        except (ValueError, stripe.error.SignatureVerificationError) as exc:
            logger.error("Webhook Stripe invalide : %s", exc)
            raise

    @staticmethod
    def retrieve_session(session_id):
        return stripe.checkout.Session.retrieve(session_id)