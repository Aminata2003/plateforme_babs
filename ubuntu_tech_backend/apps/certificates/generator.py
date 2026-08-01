import io

import qrcode
from django.conf import settings
from django.core.files.base import ContentFile
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import cm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

NAVY = colors.HexColor("#1F2A44")
GOLD = colors.HexColor("#C9A227")
GREY = colors.HexColor("#666666")


def _build_qr_image(verify_url):
    qr = qrcode.QRCode(box_size=6, border=2)
    qr.add_data(verify_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer


def generate_certificate_pdf(certificate):
    """
    Génère le PDF du certificat (paysage A4) et l'attache à certificate.pdf_file.
    Retourne l'instance certificate sauvegardée.
    """
    user = certificate.user
    verify_url = f"{settings.CERTIFICATE_VERIFY_BASE_URL}{certificate.uid}"

    buffer = io.BytesIO()
    page_size = landscape(A4)
    c = canvas.Canvas(buffer, pagesize=page_size)
    width, height = page_size

    # Bordure décorative
    c.setStrokeColor(GOLD)
    c.setLineWidth(3)
    c.rect(1 * cm, 1 * cm, width - 2 * cm, height - 2 * cm)
    c.setStrokeColor(NAVY)
    c.setLineWidth(0.75)
    c.rect(1.3 * cm, 1.3 * cm, width - 2.6 * cm, height - 2.6 * cm)

    # En-tête
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, height - 3.2 * cm, "UBUNTU TECH")
    c.setFillColor(GREY)
    c.setFont("Helvetica-Oblique", 12)
    c.drawCentredString(width / 2, height - 3.9 * cm, "Au cœur du digital")

    # Titre
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width / 2, height - 6 * cm, "CERTIFICAT DE RÉUSSITE")

    # Corps
    c.setFillColor(NAVY)
    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2, height - 8 * cm, "Ce certificat est décerné à")

    c.setFont("Helvetica-Bold", 24)
    full_name = user.get_full_name() or user.email
    c.drawCentredString(width / 2, height - 9.3 * cm, full_name)

    c.setFont("Helvetica", 13)
    c.drawCentredString(
        width / 2, height - 10.8 * cm,
        f"pour avoir suivi avec succès la formation « {certificate.formation_title} »",
    )
    c.drawCentredString(
        width / 2, height - 11.6 * cm,
        f"d'une durée de {certificate.duration_text}",
    )

    # Date et numéro
    c.setFont("Helvetica", 11)
    c.setFillColor(GREY)
    c.drawString(
        2.5 * cm, 2.3 * cm,
        f"Délivré le {certificate.issued_at:%d/%m/%Y}",
    )
    c.drawString(
        2.5 * cm, 1.8 * cm,
        f"Numéro de certificat : {certificate.uid}",
    )

    # QR code de vérification
    qr_buffer = _build_qr_image(verify_url)
    qr_size = 2.8 * cm
    c.drawImage(
        ImageReader(qr_buffer), width - qr_size - 2.3 * cm, 1.6 * cm,
        width=qr_size, height=qr_size, mask="auto",
    )
    c.setFont("Helvetica", 8)
    c.drawCentredString(width - qr_size / 2 - 2.3 * cm, 1.4 * cm, "Scanner pour vérifier")

    # Signature
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(NAVY)
    c.drawCentredString(width / 2, 3.2 * cm, "_______________________")
    c.setFont("Helvetica", 10)
    c.drawCentredString(width / 2, 2.7 * cm, "Le responsable de la formation")

    c.showPage()
    c.save()
    buffer.seek(0)

    certificate.pdf_file.save(
        f"certificat_{certificate.uid}.pdf", ContentFile(buffer.read()), save=True,
    )
    return certificate