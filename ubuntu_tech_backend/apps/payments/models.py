import uuid

from django.conf import settings
from django.db import models


def generate_ref_command():
    return uuid.uuid4().hex


class PaymentStatus(models.TextChoices):
    PENDING = "pending", "En attente"
    PAID = "paid", "Payé"
    CANCELED = "canceled", "Annulé"
    FAILED = "failed", "Échoué"


class Payment(models.Model):
    """
    Une transaction de paiement pour l'inscription à la formation, via PayTech
    (Wave, Orange Money, Free Money, carte bancaire).
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments")
    ref_command = models.CharField(max_length=100, unique=True, default=generate_ref_command, editable=False)
    token = models.CharField(max_length=100, blank=True, help_text="Token de paiement retourné par PayTech")
    item_name = models.CharField(max_length=200)
    amount = models.PositiveIntegerField(help_text="Montant en FCFA (XOF)")
    payment_method = models.CharField(max_length=50, blank=True, help_text="Wave, Orange Money, Free Money, Carte Bancaire...")
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    redirect_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.ref_command} - {self.user} - {self.status}"