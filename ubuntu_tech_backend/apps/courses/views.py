from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsAdminOrFormateur, IsOwnerOrAdmin

from .models import Devoir, Lesson, LessonProgress, Module, Quiz, QuizAttempt, Submission
from .serializers import (
    DevoirSerializer, LessonProgressSerializer, LessonSerializer,
    ModuleListSerializer, ModuleSerializer, QuizAttemptSerializer,
    QuizSerializer, SubmissionSerializer,
)


class ModuleViewSet(viewsets.ModelViewSet):
    """
    Gestion des modules de formation.
    Lecture : tout utilisateur connecté. Création/édition : admin ou formateur.
    """
    queryset = Module.objects.all().order_by("order")
    permission_classes = [IsAuthenticated, IsAdminOrFormateur]

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

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def submit_attempt(self, request, pk=None):
        """
        Corps attendu : {"answers": {"<question_id>": <choice_id>, ...}}
        Corrige automatiquement et enregistre le résultat de l'apprenant.
        """
        quiz = self.get_object()
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
