from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsAdminOrFormateur

from .models import LiveSession, SessionRegistration
from .serializers import LiveSessionSerializer, SessionRegistrationSerializer


class LiveSessionViewSet(viewsets.ModelViewSet):
    """
    Planification des rencontres hebdomadaires et bootcamps.
    Lecture : tout apprenant connecté (calendrier + liens de connexion).
    Écriture : admin ou formateur uniquement.
    """
    queryset = LiveSession.objects.all()
    serializer_class = LiveSessionSerializer
    permission_classes = [IsAuthenticated, IsAdminOrFormateur]

    def get_queryset(self):
        qs = super().get_queryset()
        session_type = self.request.query_params.get("type")
        if session_type:
            qs = qs.filter(type=session_type)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def register(self, request, pk=None):
        """L'apprenant s'inscrit à un bootcamp (ou une rencontre)."""
        session = self.get_object()
        registration, created = SessionRegistration.objects.get_or_create(
            session=session, user=request.user,
        )
        message = "Inscription confirmée" if created else "Déjà inscrit à cette session"
        return Response({"status": message}, status=201 if created else 200)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated, IsAdminOrFormateur])
    def participants(self, request, pk=None):
        """Liste des inscrits à une session (pour l'admin/formateur)."""
        session = self.get_object()
        registrations = session.registrations.select_related("user")
        return Response(SessionRegistrationSerializer(registrations, many=True).data)