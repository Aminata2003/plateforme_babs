from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import InitiatePaymentView, PaymentViewSet, payment_ipn

router = DefaultRouter()
router.register("payments", PaymentViewSet, basename="payment")

urlpatterns = [
    path("payments/initiate/", InitiatePaymentView.as_view(), name="payment-initiate"),
    path("payments/ipn/", payment_ipn, name="payment-ipn"),
] + router.urls