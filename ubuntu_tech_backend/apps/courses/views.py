from django.utils import timezone
from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsActiveLearnerOrStaff, IsAdminOrFormateur, IsOwnerOrAdmin

from .models import (
    Choice, Devoir, Lesson, LessonProgress, Module, Question, Quiz, QuizAttempt, Submission,
)
from .serializers import (
    ChoiceWriteSerializer, DevoirSerializer, LessonProgressSerializer, LessonSerializer,
    ModuleListSerializer, ModuleSerializer, QuestionWriteSerializer, QuizAttemptSerializer,
    QuizSerializer, SubmissionSerializer,
)


def _as_int_or_none(value):
    """Convertit une valeur de query param en entier, ou None si invalide/absente
    (au lieu de laisser Django planter avec une 500 sur un id du type 'undefined')."""
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


class ModuleViewSet(viewsets.ModelViewSet):
    """
    Gestion des modules de formation.
    Lecture : tout utilisateur connecté (apprenant ne voit que les modules publiés).
    Création/édition : admin ou formateur.
    """
    queryset = Module.objects.all().order_by("order")
    permission_classes = [IsAuthenticated, IsAdminOrFormateur]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not (user.is_admin or user.is_formateur):
            qs = qs.filter(is_published=True)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return ModuleListSerializer
        return ModuleSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class LessonViewSet(viewsets.ModelViewSet):
    """Gestion des leçons (vidéo YouTube + ressources) au sein d'un module."""
    queryset = Lesson.objects.all().order_by("order")
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsActiveLearnerOrStaff]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not (user.is_admin or user.is_formateur):
            qs = qs.filter(is_published=True)
        module_id = _as_int_or_none(self.request.query_params.get("module"))
        if self.request.query_params.get("module") is not None:
            # Un ?module= fourni mais invalide (ex. "undefined") ne doit renvoyer aucun résultat,
            # pas planter le serveur.
            qs = qs.filter(module_id=module_id) if module_id is not None else qs.none()
        return qs

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsActiveLearnerOrStaff])
    def mark_completed(self, request, pk=None):
        """L'apprenant marque la leçon comme terminée (utilisé aussi pour le suivi de progression)."""
        lesson = self.get_object()
        LessonProgress.objects.get_or_create(user=request.user, lesson=lesson)
        return Response({"status": "leçon marquée comme terminée"})


class QuizViewSet(viewsets.ModelViewSet):
    """Gestion des quiz. La correction est automatique via /submit_attempt/."""
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated, IsActiveLearnerOrStaff]
    MAX_ATTEMPTS = 3

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def submit_attempt(self, request, pk=None):
        """
        Corps attendu : {"answers": {"<question_id>": <choice_id>, ...}}
        Corrige automatiquement et enregistre le résultat de l'apprenant.
        Limité à MAX_ATTEMPTS tentatives par apprenant et par quiz.
        """
        quiz = self.get_object()

        already_attempted = QuizAttempt.objects.filter(quiz=quiz, user=request.user).count()
        if already_attempted >= self.MAX_ATTEMPTS:
            return Response(
                {"detail": f"Nombre maximum de tentatives atteint ({self.MAX_ATTEMPTS})."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        answers = request.data.get("answers", {})
        if not isinstance(answers, dict):
            return Response({"detail": "Le champ answers doit être un objet."}, status=400)
        questions = quiz.questions.prefetch_related("choices")
        total = questions.count()
        correct = 0
        for question in questions:
            chosen_id = answers.get(str(question.id))
            if chosen_id and question.choices.filter(id=chosen_id, is_correct=True).exists():
                correct += 1
        score = round((correct / total) * 100) if total else 0
        attempt = QuizAttempt.objects.create(
            quiz=quiz, user=request.user, score=score, passed=score >= quiz.passing_score,
        )
        return Response(QuizAttemptSerializer(attempt).data, status=status.HTTP_201_CREATED)


class MyQuizAttemptsView(generics.ListAPIView):
    """Historique de mes propres tentatives de quiz (toutes confondues), pour mon tableau de bord."""
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user).select_related("quiz", "quiz__lesson")


class QuestionViewSet(viewsets.ModelViewSet):
    """Gestion des questions d'un quiz (admin/formateur) - filtrable par ?quiz=<id>."""
    queryset = Question.objects.all().order_by("order")
    serializer_class = QuestionWriteSerializer
    permission_classes = [IsAuthenticated, IsAdminOrFormateur]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.query_params.get("quiz") is not None:
            quiz_id = _as_int_or_none(self.request.query_params.get("quiz"))
            qs = qs.filter(quiz_id=quiz_id) if quiz_id is not None else qs.none()
        return qs


class ChoiceViewSet(viewsets.ModelViewSet):
    """Gestion des choix de réponse d'une question (admin/formateur) - filtrable par ?question=<id>."""
    queryset = Choice.objects.all()
    serializer_class = ChoiceWriteSerializer
    permission_classes = [IsAuthenticated, IsAdminOrFormateur]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.query_params.get("question") is not None:
            question_id = _as_int_or_none(self.request.query_params.get("question"))
            qs = qs.filter(question_id=question_id) if question_id is not None else qs.none()
        return qs


class DevoirViewSet(viewsets.ModelViewSet):
    """Gestion des devoirs/exercices pratiques."""
    queryset = Devoir.objects.all().order_by("-created_at")
    serializer_class = DevoirSerializer
    permission_classes = [IsAuthenticated, IsActiveLearnerOrStaff]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.query_params.get("module") is not None:
            module_id = _as_int_or_none(self.request.query_params.get("module"))
            qs = qs.filter(module_id=module_id) if module_id is not None else qs.none()
        return qs


class SubmissionViewSet(viewsets.ModelViewSet):
    """
    Rendus de devoirs.
    Un apprenant ne voit que ses propres soumissions ; admin/formateur voient tout (pour corriger).
    """
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated, IsActiveLearnerOrStaff, IsOwnerOrAdmin]

    def get_serializer_class(self):
        if self.action == "create" and not (self.request.user.is_admin or self.request.user.is_formateur):
            from .serializers import SubmissionCreateSerializer
            return SubmissionCreateSerializer
        return SubmissionSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Submission.objects.all().order_by("-submitted_at")
        if user.is_admin or user.is_formateur:
            if self.request.query_params.get("devoir") is not None:
                devoir_id = _as_int_or_none(self.request.query_params.get("devoir"))
                return qs.filter(devoir_id=devoir_id) if devoir_id is not None else qs.none()
            return qs
        return qs.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if not (self.request.user.is_admin or self.request.user.is_formateur):
            protected_fields = {"devoir", "grade", "feedback", "user"}
            if protected_fields.intersection(serializer.validated_data):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Ces champs sont réservés à l'équipe pédagogique.")
        serializer.save()

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdminOrFormateur])
    def grade(self, request, pk=None):
        """Notation d'un rendu par le formateur/admin : {"grade": 8, "feedback": "..."}"""
        submission = self.get_object()
        try:
            grade = int(request.data.get("grade"))
        except (TypeError, ValueError):
            return Response({"detail": "La note doit être un nombre entier."}, status=400)
        if not 0 <= grade <= submission.devoir.max_score:
            return Response({"detail": "La note doit être comprise entre 0 et la note maximale."}, status=400)
        submission.grade = grade
        submission.feedback = request.data.get("feedback", "")
        submission.graded_at = timezone.now()
        submission.save()
        return Response(SubmissionSerializer(submission).data)
