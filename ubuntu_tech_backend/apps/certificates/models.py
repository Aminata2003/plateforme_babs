import uuid

from django.conf import settings
from django.db import models


class Certificate(models.Model):
    """Certificat numérique de fin de formation, avec numéro unique et QR code de vérification."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="certificate")
    uid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    formation_title = models.CharField(
        max_length=200,
        default="Formation en Bureautique et Informatique - Ubuntu Tech",
    )
    duration_text = models.CharField(max_length=100, default="3 mois")
    pdf_file = models.FileField(upload_to="certificates/", blank=True, null=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name="certificates_issued",
    )

    class Meta:
        ordering = ["-issued_at"]

    def __str__(self):
        return f"Certificat {self.uid} - {self.user}"