from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Autorise uniquement les administrateurs (propriétaire de la plateforme)."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)


class IsAdminOrFormateur(BasePermission):
    """
    Lecture : tout utilisateur connecté.
    Écriture (créer/modifier/supprimer contenus) : admin ou formateur uniquement.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_admin or request.user.is_formateur


class IsOwnerOrAdmin(BasePermission):
    """Un apprenant ne peut voir/modifier que ses propres données (soumissions, résultats de quiz)."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin or request.user.is_formateur:
            return True
        return getattr(obj, "user_id", None) == request.user.id
