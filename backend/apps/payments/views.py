"""
Vues — Paiements DarImmo
Gère le démarrage des paiements (Stripe Checkout / CMI) et les webhooks.
"""

import traceback
from turtle import title
from .stripe_handler import StripeHandler
import logging

from io import BytesIO
from django.http import FileResponse
from reportlab.platypus import SimpleDocTemplate, Spacer, Table, TableStyle, Paragraph
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import cm
from reportlab.platypus import Spacer

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.annonces.models import Annonce

from .cmi_handler import CMIHandler
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
    permission_classes = [permissions.AllowAny]

    def get(self, request, transaction_id):
        from rest_framework_simplejwt.tokens import AccessToken
        from django.contrib.auth import get_user_model

        from io import BytesIO
        from django.http import FileResponse

        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.enums import TA_CENTER
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.units import cm
        from reportlab.platypus import (
            SimpleDocTemplate,
            Paragraph,
            Spacer,
            Table,
            TableStyle,
        )

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

        buffer = BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=1.5 * cm,
            leftMargin=1.5 * cm,
            topMargin=1.5 * cm,
            bottomMargin=1.5 * cm,
        )

        styles = getSampleStyleSheet()

        title = styles["Title"]
        title.alignment = TA_CENTER
        title.textColor = colors.HexColor("#047857")

        heading = styles["Heading2"]
        heading.alignment = TA_CENTER
        heading.textColor = colors.HexColor("#047857")

        normal = styles["BodyText"]

        elements = []

        # ======================================================
        # HEADER
        # ======================================================

        elements.append(
            Paragraph(
                "<font size='28'><b>DarImmo</b></font>",
                title,
            )
        )

        elements.append(
            Paragraph(
                "<font color='#666666' size='11'>La plateforme immobilière premium au Maroc</font>",
                normal,
            )
        )

        elements.append(Spacer(1, 12))

        elements.append(
            Paragraph(
                "<font size='22'><b>FACTURE</b></font>",
                heading,
            )
        )

        elements.append(Spacer(1, 8))

        invoice_number = f"FCT-{timezone.now().year}-{transaction.id:06d}"

        elements.append(
            Paragraph(
                f"<b>Facture :</b> {invoice_number}",
                normal,
            )
        )

        elements.append(
            Paragraph(
                f"<b>Date :</b> {transaction.created_at.strftime('%d/%m/%Y %H:%M')}",
                normal,
            )
        )

        elements.append(Spacer(1, 20))

        # ======================================================
        # SOCIETE / CLIENT
        # ======================================================

        company_table = Table(
            [[
                Paragraph(
                    """
                    <b><font color="#047857" size="13">DarImmo</font></b><br/><br/>
                    123 Boulevard Mohammed V<br/>
                    Casablanca 20000<br/>
                    Maroc<br/>
                    contact@darimmo.ma<br/>
                    +212 5 22 00 00 00
                    """,
                    normal,
                ),
                Paragraph(
                    f"""
                    <b><font color="#047857" size="13">CLIENT</font></b><br/><br/>
                    {transaction.user.get_full_name() or transaction.user.email}<br/>
                    {transaction.user.email}
                    """,
                    normal,
                ),
            ]],
            colWidths=[8 * cm, 8 * cm],
        )

        company_table.setStyle(
            TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#DDDDDD")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#EEEEEE")),
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 12),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                    ("TOPPADDING", (0, 0), (-1, -1), 12),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
                ]
            )
        )

        elements.append(company_table)

        elements.append(Spacer(1, 20))
                # ======================================================
        # DETAILS DE LA TRANSACTION
        # ======================================================

        table_data = [
            ["Transaction", str(transaction.id)],
            ["Référence", transaction.provider_reference or "-"],
            [
                "Annonce",
                transaction.annonce.title if transaction.annonce else "-",
            ],
            [
                "Formule",
                transaction.boost_plan.name if transaction.boost_plan else "-",
            ],
            [
                "Durée",
                f"{transaction.boost_plan.duration_days} jours"
                if transaction.boost_plan
                else "-",
            ],
            ["Statut", transaction.get_status_display()],
        ]

        details_table = Table(
            table_data,
            colWidths=[6 * cm, 10 * cm],
        )

        details_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#047857")),
                    ("TEXTCOLOR", (0, 0), (0, -1), colors.white),
                    ("BACKGROUND", (1, 0), (1, -1), colors.whitesmoke),
                    ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#DDDDDD")),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                    ("TOPPADDING", (0, 0), (-1, -1), 10),
                    ("LEFTPADDING", (0, 0), (-1, -1), 10),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ]
            )
        )

        elements.append(details_table)

        elements.append(Spacer(1, 25))

        # ======================================================
        # TOTAL
        # ======================================================

        total_table = Table(
            [
                [
                    Paragraph("<b>Total payé</b>", normal),
                    Paragraph(
                        f"<b>{transaction.amount} MAD</b>",
                        normal,
                    ),
                ]
            ],
            colWidths=[10 * cm, 6 * cm],
        )

        total_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#047857")),
                    ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 14),
                    ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
                    ("TOPPADDING", (0, 0), (-1, -1), 12),
                    ("LEFTPADDING", (0, 0), (-1, -1), 12),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ]
            )
        )

        elements.append(total_table)

        elements.append(Spacer(1, 35))

        elements.append(
            Paragraph(
                """
                <font color="#16A34A">
                <b>✓ Paiement confirmé</b>
                </font>
                """,
                heading,
            )
        )

        elements.append(Spacer(1, 10))

        elements.append(
            Paragraph(
                """
                Merci d'avoir choisi <b>DarImmo</b>.<br/>
                Cette facture confirme votre paiement et l'activation
                de votre annonce Premium.
                """,
                normal,
            )
        )

        elements.append(Spacer(1, 35))

        elements.append(
            Paragraph(
                "<font size='9' color='#888888'>© DarImmo - Plateforme immobilière premium</font>",
                title,
            )
        )

        doc.build(elements)

        buffer.seek(0)

        return FileResponse(
            buffer,
            as_attachment=True,
            filename=f"facture_{transaction.id}.pdf",
        )