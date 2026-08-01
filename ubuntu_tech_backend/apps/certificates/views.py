from django.contrib.auth import get_user_model
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrFormateur

from .eligibility import is_eligible_for_certificate
from .generator import generate_certificate_pdf
from .models import Certificate
from .serializers import CertificateSerializer, CertificateVerificationSerializer

User = get_user_model()


class MyCertificateView(APIView):
    """
    L'apprenant demande la génération de son certificat.
    Refusé tant que le parcours (toutes les leçons publiées) n'est pas terminé.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if not is_eligible_for_certificate(user):
            return Response(
                {"detail": "Parcours non terminé : toutes les leçons doivent être complétées."},
                status=400,
            )
        certificate, _ = Certificate.objects.get_or_create(user=user)
        generate_certificate_pdf(certificate)
        return Response(CertificateSerializer(certificate).data, status=201)

    def get(self, request):
        try:
            certificate = request.user.certificate
        except Certificate.DoesNotExist:
            return Response({"detail": "Aucun certificat généré."}, status=404)
        return Response(CertificateSerializer(certificate).data)


class AdminCertificateView(APIView):
    """L'admin/formateur peut générer (ou régénérer) le certificat d'un apprenant précis."""
    permission_classes = [IsAuthenticated, IsAdminOrFormateur]

    def post(self, request, user_id):
        try:
            learner = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "Utilisateur introuvable."}, status=404)

        certificate, _ = Certificate.objects.get_or_create(user=learner)
        certificate.issued_by = request.user
        certificate.save()
        generate_certificate_pdf(certificate)
        return Response(CertificateSerializer(certificate).data, status=201)


class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    """Liste des certificats délivrés - un apprenant ne voit que le sien, l'admin voit tout."""
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_formateur:
            return Certificate.objects.all()
        return Certificate.objects.filter(user=user)


class VerifyCertificateView(APIView):
    """Vérification publique d'un certificat via le QR code - aucune authentification requise."""
    permission_classes = [AllowAny]

    def get(self, request, uid):
        try:
            certificate = Certificate.objects.get(uid=uid)
        except Certificate.DoesNotExist:
            return Response({"valid": False, "detail": "Certificat introuvable."}, status=404)
        data = CertificateVerificationSerializer(certificate).data
        data["valid"] = True
        return Response(data)