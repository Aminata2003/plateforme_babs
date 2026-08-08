from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsAdmin
from .serializers import (
    PasswordResetConfirmSerializer, PasswordResetRequestSerializer,
    ProfileUpdateSerializer, RegisterSerializer, UserSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Inscription publique - toujours en tant qu'apprenant."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    """GET : voir mon profil / PATCH : le modifier (multipart pour l'avatar)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user, context={"request": request}).data)


class UserAdminViewSet(viewsets.ModelViewSet):
    """
    Gestion des utilisateurs (formateurs, apprenants) réservée à l'admin
    (propriétaire de la plateforme) - onglet "Gérer les utilisateurs".
    """
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ["role", "is_active"]


class PasswordResetRequestView(APIView):
    """
    Demande de réinitialisation : envoie un email avec un lien contenant
    un uid + token à usage unique. Répond toujours avec succès (même si
    l'email est inconnu) pour ne pas révéler quels comptes existent.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            user = None

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL}/reinitialiser-mot-de-passe/{uid}/{token}/"
            send_mail(
                subject="Réinitialisation de votre mot de passe - Ubuntu Tech",
                message=(
                    f"Bonjour {user.first_name},\n\n"
                    f"Clique sur ce lien pour choisir un nouveau mot de passe :\n{reset_url}\n\n"
                    "Si tu n'es pas à l'origine de cette demande, ignore cet email."
                ),
                from_email=None,
                recipient_list=[user.email],
                fail_silently=True,
            )

        return Response({"detail": "Si ce compte existe, un email de réinitialisation a été envoyé."})


class PasswordResetConfirmView(APIView):
    """Confirme la réinitialisation à partir du uid + token reçus par email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            uid = force_str(urlsafe_base64_decode(data["uid"]))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"detail": "Lien de réinitialisation invalide."}, status=400)

        if not default_token_generator.check_token(user, data["token"]):
            return Response({"detail": "Lien de réinitialisation invalide ou expiré."}, status=400)

        user.set_password(data["new_password"])
        user.save()
        return Response({"detail": "Mot de passe mis à jour avec succès."})
