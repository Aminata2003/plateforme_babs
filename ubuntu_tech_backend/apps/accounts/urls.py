from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    MeView, PasswordResetConfirmView, PasswordResetRequestView, RegisterView,
    UserAdminViewSet,
)

router = DefaultRouter()
router.register("users", UserAdminViewSet, basename="admin-users")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("auth/password-reset-confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
] + router.urls
