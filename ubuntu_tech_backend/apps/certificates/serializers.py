from rest_framework import serializers

from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            "id", "uid", "user", "user_full_name", "formation_title",
            "duration_text", "pdf_file", "issued_at",
        ]
        read_only_fields = fields

    def get_user_full_name(self, obj):
        return obj.user.get_full_name()


class CertificateVerificationSerializer(serializers.ModelSerializer):
    """Version publique (page de vérification via QR code) - aucune donnée sensible."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = ["uid", "full_name", "formation_title", "duration_text", "issued_at"]

    def get_full_name(self, obj):
        return obj.user.get_full_name()