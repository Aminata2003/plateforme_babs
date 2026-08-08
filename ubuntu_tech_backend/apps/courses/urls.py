from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ChoiceViewSet, DevoirViewSet, LessonViewSet, ModuleViewSet, MyQuizAttemptsView,
    QuestionViewSet, QuizViewSet, SubmissionViewSet,
)

router = DefaultRouter()
router.register("modules", ModuleViewSet, basename="module")
router.register("lessons", LessonViewSet, basename="lesson")
router.register("quizzes", QuizViewSet, basename="quiz")
router.register("questions", QuestionViewSet, basename="question")
router.register("choices", ChoiceViewSet, basename="choice")
router.register("devoirs", DevoirViewSet, basename="devoir")
router.register("submissions", SubmissionViewSet, basename="submission")

urlpatterns = [
    path("quiz-attempts/me/", MyQuizAttemptsView.as_view(), name="my-quiz-attempts"),
] + router.urls
