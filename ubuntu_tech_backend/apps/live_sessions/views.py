from django.contrib.auth import get_user_model
from django.core.mail import send_mail

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsActiveLearnerOrStaff, IsAdminOrFormateur
from apps.courses.models import Enrollment

from .models import LiveSession, SessionRegistration
from .serializers import LiveSessionSerializer, SessionRegistrationSerializer


User = get_user_model()


class LiveSessionViewSet(viewsets.ModelViewSet):
    """
    Planification des rencontres hebdomadaires et bootcamps.

    Lecture :
        Tout apprenant connecté peut consulter les sessions.

    Écriture :
        Admin ou formateur uniquement.
    """

    queryset = LiveSession.objects.all()
    serializer_class = LiveSessionSerializer
    permission_classes = [
        IsAuthenticated,
        IsAdminOrFormateur,
    ]

    def get_queryset(self):
        qs = super().get_queryset()

        user = self.request.user
        if not (user.is_admin or user.is_formateur) and not Enrollment.objects.filter(
            user=user, is_active=True,
        ).exists():
            return qs.none()

        session_type = self.request.query_params.get("type")

        if session_type:
            qs = qs.filter(type=session_type)

        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    # =========================================================
    # INSCRIPTION À UNE SESSION
    # =========================================================

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated, IsActiveLearnerOrStaff],
    )
    def register(self, request, pk=None):
        """
        L'apprenant s'inscrit à un bootcamp ou une rencontre.
        """

        session = self.get_object()

        registration, created = SessionRegistration.objects.get_or_create(
            session=session,
            user=request.user,
        )

        message = (
            "Inscription confirmée"
            if created
            else "Déjà inscrit à cette session"
        )

        return Response(
            {"status": message},
            status=201 if created else 200,
        )

    # =========================================================
    # LISTE DES PARTICIPANTS
    # =========================================================

    @action(
        detail=True,
        methods=["get"],
        permission_classes=[
            IsAuthenticated,
            IsAdminOrFormateur,
        ],
    )
    def participants(self, request, pk=None):
        """
        Liste des inscrits à une session.
        Accessible uniquement à l'admin ou au formateur.
        """

        session = self.get_object()

        registrations = session.registrations.select_related("user")

        return Response(
            SessionRegistrationSerializer(
                registrations,
                many=True,
            ).data
        )

    # =========================================================
    # ENVOI DES INVITATIONS
    # =========================================================

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[
            IsAuthenticated,
            IsAdminOrFormateur,
        ],
    )
    def notify(self, request, pk=None):
        """
        Envoie une invitation par email :

        - aux apprenants sélectionnés via user_ids
        - aux adresses email ajoutées directement via emails

        Exemple :

        {
            "user_ids": [1, 2, 3],
            "emails": [
                "email1@gmail.com",
                "email2@gmail.com"
            ]
        }
        """

        session = self.get_object()

        user_ids = request.data.get("user_ids", [])
        emails = request.data.get("emails", [])

        # -----------------------------------------------------
        # Nettoyage des emails
        # -----------------------------------------------------

        if not isinstance(emails, list):
            emails = []

        emails = list(
            dict.fromkeys(
                email.strip().lower()
                for email in emails
                if isinstance(email, str) and email.strip()
            )
        )

        # -----------------------------------------------------
        # Vérification des destinataires
        # -----------------------------------------------------

        if not user_ids and not emails:
            return Response(
                {
                    "detail": "Aucun destinataire sélectionné."
                },
                status=400,
            )

        # -----------------------------------------------------
        # Récupération des apprenants
        # -----------------------------------------------------

        learners = User.objects.filter(
            id__in=user_ids,
            role="apprenant",
        )

        # -----------------------------------------------------
        # Type de session
        # -----------------------------------------------------

        session_type_label = (
            "Bootcamp"
            if session.type == "bootcamp"
            else "Rencontre hebdomadaire"
        )

        sent = 0
        failed = []

        # =====================================================
        # 1. ENVOI AUX APPRENANTS
        # =====================================================

        for learner in learners:

            if not learner.email:
                failed.append(
                    {
                        "type": "user",
                        "user_id": learner.id,
                        "reason": "Aucune adresse email",
                    }
                )
                continue

            try:
                send_mail(
                    subject=(
                        f"Invitation - {session.title} "
                        "(Ubuntu Tech)"
                    ),
                    message=(
                        f"Bonjour {learner.first_name},\n\n"
                        "Tu es invité·e à la session suivante :\n\n"
                        f"{session_type_label} : "
                        f"{session.title}\n"
                        f"Date : "
                        f"{session.scheduled_at:%d/%m/%Y à %H:%M}\n"
                        f"Durée : "
                        f"{session.duration_minutes} minutes\n"
                        f"Lien de connexion : "
                        f"{session.meeting_link}\n\n"
                        + (
                            f"Description : "
                            f"{session.description}\n\n"
                            if session.description
                            else ""
                        )
                        + "À bientôt sur Ubuntu Tech !"
                    ),
                    from_email=None,
                    recipient_list=[learner.email],
                    fail_silently=False,
                )

                sent += 1

            except Exception as exc:
                failed.append(
                    {
                        "type": "user",
                        "user_id": learner.id,
                        "email": learner.email,
                        "reason": str(exc),
                    }
                )

        # =====================================================
        # 2. ENVOI AUX EMAILS AJOUTÉS DIRECTEMENT
        # =====================================================

        for email in emails:

            try:
                send_mail(
                    subject=(
                        f"Invitation - {session.title} "
                        "(Ubuntu Tech)"
                    ),
                    message=(
                        "Bonjour,\n\n"
                        "Vous êtes invité(e) à la session suivante :\n\n"
                        f"{session_type_label} : "
                        f"{session.title}\n"
                        f"Date : "
                        f"{session.scheduled_at:%d/%m/%Y à %H:%M}\n"
                        f"Durée : "
                        f"{session.duration_minutes} minutes\n"
                        f"Lien de connexion : "
                        f"{session.meeting_link}\n\n"
                        + (
                            f"Description : "
                            f"{session.description}\n\n"
                            if session.description
                            else ""
                        )
                        + "À bientôt sur Ubuntu Tech !"
                    ),
                    from_email=None,
                    recipient_list=[email],
                    fail_silently=False,
                )

                sent += 1

            except Exception as exc:
                failed.append(
                    {
                        "type": "email",
                        "email": email,
                        "reason": str(exc),
                    }
                )

        # =====================================================
        # RÉPONSE
        # =====================================================

        return Response(
            {
                "detail": (
                    f"{sent} invitation(s) envoyée(s)."
                ),
                "sent": sent,
                "failed": failed,
            }
        )