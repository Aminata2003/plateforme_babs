from django.contrib import admin

from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ["uid", "user", "formation_title", "issued_at"]
    search_fields = ["uid", "user__email"]