"""
Vues — Paiements DarImmo
Gère le démarrage des paiements (Stripe Checkout / CMI) et les webhooks.
"""

import traceback
from .stripe_handler import StripeHandler
import logging

from django.http import FileResponse

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.annonces.models import Annonce

from .cmi_handler import CMIHandler
from .invoice_pdf import build_invoice_pdf
from .models import BoostPlan, Transaction
from .serializers import BoostPlanSerializer, CreateCheckoutSerializer, TransactionSerializer

logger = logging.getLogger(__name__)
from decimal import Decimal

class BoostPlanListView(generics.ListAPIView):
    serializer_class = BoostPlanSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return BoostPlan.objects.all()

class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role == "admin":
            return (
                Transaction.objects
                .select_related("user", "annonce", "boost_plan")
                .order_by("-created_at")
            )

        return (
            Transaction.objects
            .filter(user=self.request.user)
            .select_related("annonce", "boost_plan")
            .order_by("-created_at")
        )


from decimal import Decimal
from bson.decimal128 import Decimal128

class CreateCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        annonce = get_object_or_404(
            Annonce,
            pk=data["annonce_id"],
            owner=request.user,
        )

        boost_plan = get_object_or_404(
            BoostPlan,
            pk=data["boost_plan_id"],
        )

        amount = boost_plan.price

        if isinstance(amount, Decimal128):
            amount = amount.to_decimal()

        transaction = Transaction(
            user=request.user,
            annonce=annonce,
            boost_plan=boost_plan,
            provider=data["provider"],
        )

        transaction.amount = Decimal(str(amount))

        transaction.save()

        transaction.provider_reference = f"CMI-{transaction.id}"
        transaction.save(update_fields=["provider_reference"])

        return Response(
            {
                "checkout_url": f"{settings.FRONTEND_URL}/cmi-simulator?transaction={transaction.id}",
                "transaction_id": str(transaction.id),
            }
        )

class StripeWebhookView(APIView):
    """POST /api/payments/webhooks/stripe/ — Webhook de confirmation Stripe."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        webhook_secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", "")

        try:
            event = StripeHandler.verify_webhook(payload, sig_header, webhook_secret)
        except Exception:
            return Response({"detail": "Signature invalide."}, status=status.HTTP_400_BAD_REQUEST)

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            self._mark_transaction_succeeded(session["id"])

        return Response({"received": True})

    def _mark_transaction_succeeded(self, session_id):
        try:
            transaction = Transaction.objects.get(provider_reference=session_id)
        except Transaction.DoesNotExist:
            logger.warning("Transaction Stripe introuvable pour la session %s", session_id)
            return

        transaction.status = Transaction.Status.SUCCEEDED
        transaction.save(update_fields=["status"])
        self._apply_boost(transaction)

    def _apply_boost(self, transaction):
        from datetime import timedelta

        annonce = transaction.annonce
        if annonce and transaction.boost_plan:
            annonce.is_boosted = True
            annonce.boosted_until = timezone.now() + timedelta(days=transaction.boost_plan.duration_days)
            annonce.is_featured = True
            annonce.save(update_fields=["is_boosted", "boosted_until", "is_featured"])
            logger.info("Annonce #%s boostée jusqu'au %s", annonce.id, annonce.boosted_until)


class CMICallbackView(APIView):
    """POST /api/payments/webhooks/cmi/ — Callback de confirmation CMI."""
    
    
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        params = request.data
        is_valid = CMIHandler.verify_callback(params)
        if not is_valid:
            return Response({"detail": "Hash invalide."}, status=status.HTTP_400_BAD_REQUEST)

        order_id = params.get("oid")
        try:
            transaction = Transaction.objects.get(provider_reference=order_id)
        except Transaction.DoesNotExist:
            return Response({"detail": "Transaction introuvable."}, status=status.HTTP_404_NOT_FOUND)

        if params.get("ProcReturnCode") == "00":
            transaction.status = Transaction.Status.SUCCEEDED
            from datetime import timedelta
            if transaction.annonce and transaction.boost_plan:
                transaction.annonce.is_boosted = True
                transaction.annonce.boosted_until = timezone.now() + timedelta(
                    days=transaction.boost_plan.duration_days
                )
                
                transaction.annonce.is_featured = True
                transaction.annonce.save(update_fields=["is_boosted", "boosted_until", "is_featured"])
        else:
            transaction.status = Transaction.Status.FAILED

        transaction.save(update_fields=["status"])
        return Response({"detail": "Callback traité."})
    
    
class SimulatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):

        print("USER =", request.user)
        print("AUTH =", request.user.is_authenticated)

        transaction = get_object_or_404(
            Transaction,
            id=request.data["transaction_id"],
            user=request.user,
        )

        from datetime import timedelta

        annonce = transaction.annonce

        annonce.is_boosted = True
        annonce.is_featured = True
        annonce.boosted_until = (
            timezone.now()
            + timedelta(days=transaction.boost_plan.duration_days)
        )
        from bson.decimal128 import Decimal128

        if isinstance(annonce.price, Decimal128):
            annonce.price = annonce.price.to_decimal()

        if isinstance(annonce.surface, Decimal128):
            annonce.surface = annonce.surface.to_decimal()

        if annonce.latitude and isinstance(annonce.latitude, Decimal128):
            annonce.latitude = annonce.latitude.to_decimal()

        if annonce.longitude and isinstance(annonce.longitude, Decimal128):
            annonce.longitude = annonce.longitude.to_decimal()

        annonce.save()

        transaction.status = Transaction.Status.SUCCEEDED
        transaction.save()

        return Response({
            "success": True
        })


class InvoiceView(APIView):
    """GET /api/payments/invoice/{transaction_id}/?token=... — Facture PDF d'un boost payé."""

    permission_classes = [permissions.AllowAny]

    def get(self, request, transaction_id):
        from datetime import timedelta

        from django.contrib.auth import get_user_model
        from rest_framework_simplejwt.tokens import AccessToken

        token = request.GET.get("token")

        if not token:
            return Response({"detail": "Token manquant."}, status=401)

        try:
            access = AccessToken(token)
            user = get_user_model().objects.get(id=access["user_id"])
        except Exception:
            return Response({"detail": "Token invalide."}, status=401)

        transaction = get_object_or_404(
            Transaction,
            id=transaction_id,
            user=user,
        )

        if transaction.status != Transaction.Status.SUCCEEDED:
            return Response(
                {"detail": "La facture est disponible uniquement pour un paiement réussi."},
                status=400,
            )

        # Dates affichées dans le fuseau du projet (Africa/Casablanca).
        created_at = transaction.created_at
        if timezone.is_aware(created_at):
            created_at = timezone.localtime(created_at)
        issue_date = created_at.date()

        plan = transaction.boost_plan
        annonce = transaction.annonce

        amount = transaction.amount
        if isinstance(amount, Decimal128):
            amount = amount.to_decimal()

        # Le paiement passe par le simulateur CMI du projet.
        payment_modes = {Transaction.Provider.CMI: "CMI (simulation)"}

        buffer = build_invoice_pdf({
            "number": f"FCT-{created_at.year}-{transaction.id:06d}",
            "issue_date": issue_date,
            "client_name": transaction.user.get_full_name() or transaction.user.email,
            "client_email": transaction.user.email,
            "client_company": transaction.user.company_name,
            "plan_name": plan.name if plan else None,
            "duration_days": plan.duration_days if plan else None,
            # Période calculée : la date de fin n'est pas stockée sur la transaction.
            "period_start": issue_date if plan else None,
            "period_end": issue_date + timedelta(days=plan.duration_days) if plan else None,
            "annonce_title": annonce.title if annonce else None,
            "annonce_id": annonce.id if annonce else None,
            "amount": Decimal(str(amount)),
            "payment_mode": payment_modes.get(
                transaction.provider, transaction.get_provider_display()
            ),
            "reference": transaction.provider_reference,
            "transaction_id": transaction.id,
            "status_label": transaction.get_status_display(),
        })

        return FileResponse(
            buffer,
            as_attachment=True,
            filename=f"facture_{transaction.id}.pdf",
        )
