import json
import logging

from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.courses.models import Enrollment

from .models import Payment, PaymentStatus
from .serializers import InitiatePaymentSerializer, PaymentSerializer
from .services import PaytechService

logger = logging.getLogger(__name__)


class InitiatePaymentView(APIView):
    """
    Démarre un paiement pour l'inscription à la formation.
    Renvoie l'URL de paiement PayTech (redirect_url) vers laquelle rediriger l'apprenant.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        payment = Payment.objects.create(
            user=request.user,
            item_name=data["item_name"],
            amount=data["amount"],
        )

        response = PaytechService.request_payment(
            item_name=data["item_name"],
            item_price=data["amount"],
            ref_command=str(payment.ref_command),
            custom_field={"user_id": request.user.id, "payment_id": payment.id},
            target_payment=data.get("target_payment", ""),
        )

        if response.get("success") == 1:
            payment.token = response.get("token", "")
            payment.redirect_url = response.get("redirect_url", "")
            payment.save()
            return Response(PaymentSerializer(payment).data, status=201)

        payment.status = PaymentStatus.FAILED
        payment.save()
        return Response(
            {"detail": response.get("message", "Erreur lors de l'initiation du paiement")},
            status=400,
        )


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """Historique des paiements - l'apprenant ne voit que les siens, l'admin voit tout."""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Payment.objects.all()
        return Payment.objects.filter(user=user)


@csrf_exempt
@require_POST
def payment_ipn(request):
    """
    Endpoint appelé par PayTech pour notifier de l'issue d'un paiement (IPN).
    Doit rester en dehors de DRF/JWT : PayTech appelle cette URL directement, sans authentification applicative.
    """
    post_data = request.POST

    if not PaytechService.verify_ipn(post_data):
        logger.warning("IPN PayTech rejetée : signature invalide")
        return HttpResponse("Forbidden", status=403)

    type_event = post_data.get("type_event")
    ref_command = post_data.get("ref_command")
    payment_method = post_data.get("payment_method", "")

    try:
        payment = Payment.objects.get(ref_command=ref_command)
    except Payment.DoesNotExist:
        logger.warning("IPN PayTech : ref_command inconnue %s", ref_command)
        return HttpResponse("Unknown ref_command", status=404)

    if type_event == "sale_complete":
        payment.status = PaymentStatus.PAID
        payment.payment_method = payment_method
        payment.paid_at = timezone.now()
        payment.save()

        # Active (ou crée) l'inscription de l'apprenant à la formation.
        Enrollment.objects.update_or_create(
            user=payment.user, defaults={"is_active": True},
        )

    elif type_event == "sale_canceled":
        payment.status = PaymentStatus.CANCELED
        payment.save()

    return HttpResponse("IPN OK", status=200)