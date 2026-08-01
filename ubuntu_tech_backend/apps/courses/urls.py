from rest_framework.routers import DefaultRouter

from .views import DevoirViewSet, LessonViewSet, ModuleViewSet, QuizViewSet, SubmissionViewSet

router = DefaultRouter()
router.register("modules", ModuleViewSet, basename="module")
router.register("lessons", LessonViewSet, basename="lesson")
router.register("quizzes", QuizViewSet, basename="quiz")
router.register("devoirs", DevoirViewSet, basename="devoir")
router.register("submissions", SubmissionViewSet, basename="submission")

urlpatterns = router.urls
