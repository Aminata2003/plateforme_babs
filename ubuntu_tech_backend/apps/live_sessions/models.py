from django.conf import settings
from django.db import models

from apps.courses.models import Module


class SessionType(models.TextChoices):
    RENCONTRE = "rencontre", "Rencontre hebdomadaire"
    BOOTCAMP = "bootcamp", "Bootcamp mensuel"


class LiveSession(models.Model):
    """Rencontre hebdomadaire en ligne ou bootcamp mensuel."""
    type = models.CharField(max_length=20, choices=SessionType.choices)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    module = models.ForeignKey(
        Module, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="live_sessions",
        help_text="Module concerné (facultatif, utile pour les rencontres hebdomadaires)",
    )
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    meeting_link = models.URLField(help_text="Lien Zoom / Google Meet / Jitsi")
    requires_registration = models.BooleanField(
        default=False,
        help_text="Coché pour les bootcamps (inscription requise) ; décoché pour les rencontres hebdo (ouvertes à tous les inscrits)",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name="sessions_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["scheduled_at"]

    def __str__(self):
        return f"{self.get_type_display()} - {self.title} ({self.scheduled_at:%d/%m/%Y %H:%M})"


class SessionRegistration(models.Model):
    """Inscription d'un apprenant à un bootcamp (ou à une rencontre si besoin)."""
    session = models.ForeignKey(LiveSession, on_delete=models.CASCADE, related_name="registrations")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="session_registrations")
    registered_at = models.DateTimeField(auto_now_add=True)
    attended = models.BooleanField(default=False)

    class Meta:
        unique_together = ["session", "user"]
        ordering = ["-registered_at"]