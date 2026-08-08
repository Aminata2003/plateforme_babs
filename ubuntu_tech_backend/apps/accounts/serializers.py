from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    has_active_enrollment = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name",
            "phone", "role", "avatar", "date_joined", "is_active",
            "has_active_enrollment",
        ]
        read_only_fields = ["id", "email", "date_joined", "role"]

    def get_has_active_enrollment(self, obj):
        return hasattr(obj, "enrollment") and obj.enrollment.is_active


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "phone", "password"]

    def create(self, validated_data):
        # Rôle "apprenant" par défaut à l'inscription publique.
        return User.objects.create_user(**validated_data)


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone", "avatar"]


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
