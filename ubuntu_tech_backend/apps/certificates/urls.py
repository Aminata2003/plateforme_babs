from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminCertificateView, CertificateViewSet, MyCertificateView, VerifyCertificateView,
)

router = DefaultRouter()
router.register("certificates", CertificateViewSet, basename="certificate")

urlpatterns = [
    path("certificates/me/", MyCertificateView.as_view(), name="my-certificate"),
    path("certificates/issue/<int:user_id>/", AdminCertificateView.as_view(), name="issue-certificate"),
    path("certificates/verify/<uuid:uid>/", VerifyCertificateView.as_view(), name="verify-certificate"),
] + router.urls