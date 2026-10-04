"""
Facture PDF d'un boost d'annonce — DarImmo (ReportLab).

Le module ne dépend pas de Django : la vue prépare les données (dates déjà
converties dans le fuseau local, montant en Decimal) et appelle
build_invoice_pdf(). Seules des données réelles de la transaction sont
affichées : aucune adresse, aucun identifiant fiscal, aucune TVA.
"""

from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

GREEN = colors.HexColor("#047857")
DARK = colors.HexColor("#1C2520")
GREY = colors.HexColor("#6B7280")
LINE = colors.HexColor("#E6DFD0")
LIGHT = colors.HexColor("#F7F4EE")

FOOTER_TEXT = (
    "Document généré dans le cadre d'un projet académique (PFE) – sans valeur fiscale."
)

BASE = ParagraphStyle("base", fontName="Helvetica", fontSize=10, leading=14, textColor=DARK)
BRAND = ParagraphStyle("brand", parent=BASE, fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=GREEN)
RIGHT = ParagraphStyle("right", parent=BASE, alignment=TA_RIGHT, leading=15)
SMALL = ParagraphStyle("small", parent=BASE, fontSize=9, leading=13, textColor=GREY)


def format_amount(value):
    """Decimal -> « 1 234,50 MAD »."""
    return f"{value:,.2f}".replace(",", " ").replace(".", ",") + " MAD"


def format_date(value):
    return value.strftime("%d/%m/%Y")


def _draw_footer(canvas, doc):
    width = A4[0]
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(doc.leftMargin, 1.9 * cm, width - doc.rightMargin, 1.9 * cm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GREY)
    canvas.drawCentredString(width / 2, 1.4 * cm, FOOTER_TEXT)
    canvas.restoreState()


def build_invoice_pdf(data):
    """
    Construit la facture et retourne un BytesIO positionné au début.

    Clés attendues dans `data` :
      number, issue_date, client_name, client_email, client_company,
      plan_name, duration_days, period_start, period_end,
      annonce_title, annonce_id, amount, payment_mode, reference,
      transaction_id, status_label
    Les valeurs absentes (None) sont affichées « — » ou omises.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=2.5 * cm,
        title=f"Facture {data['number']}",
    )

    elements = []

    # ----- En-tête : nom à gauche, titre / numéro / date à droite -----
    header = Table(
        [[
            Paragraph("DarImmo", BRAND),
            Paragraph(
                f"<font size='16' color='#047857'><b>FACTURE</b></font><br/>"
                f"N° {escape(data['number'])}<br/>"
                f"Date : {format_date(data['issue_date'])}",
                RIGHT,
            ),
        ]],
        colWidths=[9 * cm, 9 * cm],
    )
    header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    elements.append(header)
    elements.append(HRFlowable(width="100%", thickness=1, color=GREEN, spaceBefore=8, spaceAfter=14))

    # ----- Émetteur / client -----
    client_lines = [f"<b>{escape(data['client_name'])}</b>"]
    if data.get("client_company"):
        client_lines.append(escape(data["client_company"]))
    client_lines.append(escape(data["client_email"]))

    parties = Table(
        [[
            Paragraph(
                "<font size='8' color='#6B7280'>ÉMETTEUR</font><br/>"
                "<b>DarImmo</b><br/>Plateforme d'annonces immobilières",
                BASE,
            ),
            Paragraph(
                "<font size='8' color='#6B7280'>CLIENT</font><br/>" + "<br/>".join(client_lines),
                BASE,
            ),
        ]],
        colWidths=[9 * cm, 9 * cm],
    )
    parties.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    elements.append(parties)
    elements.append(Spacer(1, 18))

    # ----- Tableau : désignation, durée, période, montant -----
    designation = f"<b>{escape(data.get('plan_name') or 'Boost d’annonce')}</b>"
    if data.get("annonce_title"):
        designation += f"<br/>Annonce : {escape(data['annonce_title'])} (réf. #{data['annonce_id']})"

    duration = f"{data['duration_days']} jours" if data.get("duration_days") else "—"

    if data.get("period_start") and data.get("period_end"):
        period = f"du {format_date(data['period_start'])}<br/>au {format_date(data['period_end'])}"
    else:
        period = "—"

    amount = format_amount(data["amount"])

    items = Table(
        [
            ["Désignation", "Durée", "Période", "Montant"],
            [Paragraph(designation, BASE), duration, Paragraph(period, BASE), amount],
        ],
        colWidths=[8.2 * cm, 2.3 * cm, 3.7 * cm, 3.8 * cm],
    )
    items.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 1), (-1, -1), DARK),
        ("ALIGN", (3, 0), (3, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 1), (-1, -1), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(items)

    # ----- Total (sans décomposition de TVA) -----
    total = Table(
        [["", "Total", amount]],
        colWidths=[10.5 * cm, 3.7 * cm, 3.8 * cm],
    )
    total.setStyle(TableStyle([
        ("BACKGROUND", (1, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (1, 0), (-1, 0), colors.white),
        ("FONTNAME", (1, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (1, 0), (-1, 0), 11),
        ("ALIGN", (2, 0), (2, 0), "RIGHT"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(Spacer(1, 6))
    elements.append(total)
    elements.append(Spacer(1, 22))

    # ----- Paiement -----
    payment_rows = [
        ["Mode de paiement", data["payment_mode"]],
        ["Référence de transaction", data.get("reference") or "—"],
        ["Transaction n°", str(data["transaction_id"])],
        ["Statut", data["status_label"]],
    ]
    payment = Table(
        [[Paragraph(label, SMALL), Paragraph(escape(str(value)), BASE)] for label, value in payment_rows],
        colWidths=[5 * cm, 13 * cm],
    )
    payment.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    elements.append(payment)

    doc.build(elements, onFirstPage=_draw_footer, onLaterPages=_draw_footer)

    buffer.seek(0)
    return buffer
