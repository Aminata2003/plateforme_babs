from rest_framework import serializers

from .models import LiveSession, SessionRegistration


class LiveSessionSerializer(serializers.ModelSerializer):
    is_registered = serializers.SerializerMethodField()
    registrations_count = serializers.IntegerField(source="registrations.count", read_only=True)

    class Meta:
        model = LiveSession
        fields = [
            "id", "type", "title", "description", "module",
            "scheduled_at", "duration_minutes", "meeting_link",
            "requires_registration", "created_by", "created_at",
            "is_registered", "registrations_count",
        ]
        read_only_fields = ["created_by", "created_at"]

    def get_is_registered(self, obj):
        user = self.context.get("request").user if self.context.get("request") else None
        if not user or not user.is_authenticated:
            return False
        return obj.registrations.filter(user=user).exists()


class SessionRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionRegistration
        fields = ["id", "session", "user", "registered_at", "attended"]
        read_only_fields = ["user", "registered_at"]