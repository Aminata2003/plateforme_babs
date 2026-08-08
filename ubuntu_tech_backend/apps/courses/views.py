from django.utils import timezone
from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsAdminOrFormateur, IsOwnerOrAdmin

from .models import (
    Choice, Devoir, Lesson, LessonProgress, Module, Question, Quiz, QuizAttempt, Submission,
)
from .serializers import (
    ChoiceWriteSerializer, DevoirSerializer, LessonProgressSerializer, LessonSerializer,
    ModuleListSerializer, ModuleSerializer, QuestionWriteSerializer, QuizAttemptSerializer,
    QuizSerializer, SubmissionSerializer,
)


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
    permission_classes = [IsAuthenticated, IsAdminOrFormateur]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not (user.is_admin or user.is_formateur):
            qs = qs.filter(is_published=True)
        module_id = self.request.query_params.get("module")
        if module_id:
            qs = qs.filter(module_id=module_id)
        return qs

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def mark_completed(self, request, pk=None):
        """L'apprenant marque la leçon comme terminée (utilisé aussi pour le suivi de progression)."""
        lesson = self.get_object()
        LessonProgress.objects.get_or_create(user=request.user, lesson=lesson)
        return Response({"status": "leçon marquée comme terminée"})


class QuizViewSet(viewsets.ModelViewSet):
    """Gestion des quiz. La correction est automatique via /submit_attempt/."""
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated, IsAdminOrFormateur]
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
        quiz_id = self.request.query_params.get("quiz")
        if quiz_id:
            qs = qs.filter(quiz_id=quiz_id)
        return qs


class ChoiceViewSet(viewsets.ModelViewSet):
    """Gestion des choix de réponse d'une question (admin/formateur) - filtrable par ?question=<id>."""
    queryset = Choice.objects.all()
    serializer_class = ChoiceWriteSerializer
    permission_classes = [IsAuthenticated, IsAdminOrFormateur]

    def get_queryset(self):
        qs = super().get_queryset()
        question_id = self.request.query_params.get("question")
        if question_id:
            qs = qs.filter(question_id=question_id)
        return qs


class DevoirViewSet(viewsets.ModelViewSet):
    """Gestion des devoirs/exercices pratiques."""
    queryset = Devoir.objects.all().order_by("-created_at")
    serializer_class = DevoirSerializer
    permission_classes = [IsAuthenticated, IsAdminOrFormateur]

    def get_queryset(self):
        qs = super().get_queryset()
        module_id = self.request.query_params.get("module")
        if module_id:
            qs = qs.filter(module_id=module_id)
        return qs


class SubmissionViewSet(viewsets.ModelViewSet):
    """
    Rendus de devoirs.
    Un apprenant ne voit que ses propres soumissions ; admin/formateur voient tout (pour corriger).
    """
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        qs = Submission.objects.all().order_by("-submitted_at")
        if user.is_admin or user.is_formateur:
            devoir_id = self.request.query_params.get("devoir")
            return qs.filter(devoir_id=devoir_id) if devoir_id else qs
        return qs.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdminOrFormateur])
    def grade(self, request, pk=None):
        """Notation d'un rendu par le formateur/admin : {"grade": 8, "feedback": "..."}"""
        submission = self.get_object()
        submission.grade = request.data.get("grade")
        submission.feedback = request.data.get("feedback", "")
        submission.graded_at = timezone.now()
        submission.save()
        return Response(SubmissionSerializer(submission).data)
