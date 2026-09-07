"""
Gestionnaire CMI — Paiements DarImmo
Centre Monétique Interbancaire — solution de paiement marocaine.
Implémentation simplifiée basée sur le protocole CMI (formulaire + hash SHA-1/HMAC).
"""

import hashlib
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


class CMIHandler:
    """
    Wrapper autour de l'intégration CMI (paiement par carte au Maroc).
    CMI fonctionne par redirection vers une page de paiement hébergée,
    avec un hash de sécurité calculé à partir des paramètres de la transaction.
    """

    BASE_URL = BASE_URL = "http://localhost:8000/api/payments/cmi/simulator/"

    @staticmethod
    def _compute_hash(params: dict) -> str:
        """
        Calcule le hash de sécurité CMI à partir des paramètres triés,
        concaténés avec la clé secrète marchande (storekey).
        """
        store_key = settings.CMI_API_KEY
        ordered_keys = sorted(params.keys())
        hash_string = "".join(f"{params[k]}|" for k in ordered_keys) + store_key
        return hashlib.sha512(hash_string.encode("utf-8")).hexdigest().upper()

    @classmethod
    def build_payment_form_data(cls, user, annonce, boost_plan, success_url, fail_url):
        """
        Construit les données du formulaire à soumettre vers la page CMI.
        Le frontend doit POSTer ces champs vers `BASE_URL`.
        """
        order_id = f"DARIMMO-{annonce.id}-{boost_plan.id}-{user.id}"
        params = {
            "clientid": settings.CMI_MERCHANT_ID,
            "amount": f"{boost_plan.price:.2f}",
            "currency": "504",  # Code ISO 4217 pour le MAD
            "oid": order_id,
            "okUrl": success_url,
            "failUrl": fail_url,
            "email": user.email,
            "shopurl": settings.FRONTEND_URL,
            "rnd": str(hash(order_id))[:10],
        }
        params["HASH"] = cls._compute_hash(params)

        logger.info("Formulaire de paiement CMI généré pour la commande %s", order_id)
        return {"action_url": cls.BASE_URL, "fields": params, "order_id": order_id}

    @classmethod
    def verify_callback(cls, callback_params: dict) -> bool:
        """Vérifie le hash retourné par CMI lors du callback de paiement."""
        received_hash = callback_params.get("HASH", "")
        params_to_check = {k: v for k, v in callback_params.items() if k != "HASH"}
        expected_hash = cls._compute_hash(params_to_check)
        is_valid = received_hash.upper() == expected_hash.upper()
        if not is_valid:
            logger.warning("Échec de vérification du hash CMI pour la commande %s", callback_params.get("oid"))
        return is_valid
