from unittest.mock import patch

from django.test import override_settings
from rest_framework.test import APITestCase

from apps.accounts.models import User
from .models import Payment


class PaymentTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="learner@example.com", password="Password123!",
        )
        self.client.force_authenticate(self.user)

    @override_settings(COURSE_PRICE_XOF=45000)
    @patch("apps.payments.views.PaytechService.request_payment")
    def test_payment_uses_server_price_and_product(self, request_payment):
        request_payment.return_value = {
            "success": 1, "token": "token", "redirect_url": "https://pay.example/redirect",
        }

        response = self.client.post(
            "/api/payments/initiate/",
            {"item_name": "Prix falsifié", "amount": 1},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        payment = Payment.objects.get(user=self.user)
        self.assertEqual(payment.amount, 45000)
        self.assertEqual(payment.item_name, "Formation Ubuntu Tech - Accès complet")
        request_payment.assert_called_once()
        self.assertEqual(request_payment.call_args.kwargs["item_price"], 45000)

