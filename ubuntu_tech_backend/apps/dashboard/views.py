from django.contrib.auth import get_user_model
from django.db.models import Avg, Count
from django.db.models.functions import TruncWeek
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdmin
from apps.courses.models import (
    Devoir, Enrollment, LessonProgress, Module, QuizAttempt, Submission,
)
from apps.live_sessions.models import LiveSession

User = get_user_model()


class DashboardStatsView(APIView):
    """
    Tableau de bord du propriétaire (admin) : vue d'ensemble et évolution des participants.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        total_apprenants = User.objects.filter(role="apprenant").count()
        active_enrollments = Enrollment.objects.filter(is_active=True).count()

        # Évolution des inscriptions par semaine (courbe pour le dashboard)
        enrollments_by_week = (
            Enrollment.objects.annotate(week=TruncWeek("enrolled_at"))
            .values("week")
            .annotate(count=Count("id"))
            .order_by("week")
        )

        # Progression moyenne par module (% de leçons terminées par les apprenants inscrits)
        modules_progress = []
        for module in Module.objects.filter(is_published=True):
            lessons_count = module.lessons.count()
            if lessons_count == 0 or active_enrollments == 0:
                modules_progress.append({"module": module.title, "avg_completion": 0})
                continue
            completed = LessonProgress.objects.filter(lesson__module=module).count()
            avg_completion = round((completed / (lessons_count * active_enrollments)) * 100)
            modules_progress.append({"module": module.title, "avg_completion": avg_completion})

        quiz_avg_score = QuizAttempt.objects.aggregate(avg=Avg("score"))["avg"] or 0
        pending_submissions = Submission.objects.filter(grade__isnull=True).count()
        devoirs_total = Devoir.objects.count()

        upcoming_sessions = LiveSession.objects.filter(
            scheduled_at__gte=timezone.now()
        ).order_by("scheduled_at")[:5].values(
            "id", "type", "title", "scheduled_at", "meeting_link"
        )

        return Response({
            "total_apprenants": total_apprenants,
            "active_enrollments": active_enrollments,
            "enrollments_evolution": list(enrollments_by_week),
            "modules_progress": modules_progress,
            "quiz_avg_score": round(quiz_avg_score, 1),
            "pending_submissions": pending_submissions,
            "devoirs_total": devoirs_total,
            "upcoming_sessions": list(upcoming_sessions),
        })


class LearnersOverviewView(APIView):
    """Liste de tous les apprenants avec un résumé de leur progression, pour l'admin."""
    permission_classes = [IsAdmin]

    def get(self, request):
        published_modules = Module.objects.filter(is_published=True)
        total_lessons = sum(m.lessons.filter(is_published=True).count() for m in published_modules)

        data = []
        for learner in User.objects.filter(role="apprenant").order_by("-date_joined"):
            completed = LessonProgress.objects.filter(
                user=learner, lesson__module__in=published_modules, lesson__is_published=True,
            ).values("lesson_id").distinct().count()
            quiz_avg = QuizAttempt.objects.filter(user=learner).aggregate(avg=Avg("score"))["avg"] or 0
            data.append({
                "id": learner.id,
                "full_name": learner.get_full_name(),
                "email": learner.email,
                "has_active_enrollment": hasattr(learner, "enrollment") and learner.enrollment.is_active,
                "progress_pct": round((completed / total_lessons) * 100) if total_lessons else 0,
                "quiz_avg_score": round(quiz_avg, 1),
            })
        return Response(data)


class LearnerDetailView(APIView):
    """Détail de la progression d'un apprenant précis, pour l'admin."""
    permission_classes = [IsAdmin]

    def get(self, request, user_id):
        try:
            learner = User.objects.get(id=user_id, role="apprenant")
        except User.DoesNotExist:
            return Response({"detail": "Apprenant introuvable."}, status=404)

        modules_detail = []
        for module in Module.objects.filter(is_published=True):
            lessons = list(module.lessons.filter(is_published=True))
            done = LessonProgress.objects.filter(user=learner, lesson__in=lessons).count()
            modules_detail.append({
                "module": module.title, "completed": done, "total": len(lessons),
            })

        attempts = QuizAttempt.objects.filter(user=learner).select_related("quiz")
        submissions = Submission.objects.filter(user=learner).select_related("devoir")

        return Response({
            "id": learner.id,
            "full_name": learner.get_full_name(),
            "email": learner.email,
            "has_active_enrollment": hasattr(learner, "enrollment") and learner.enrollment.is_active,
            "modules": modules_detail,
            "quiz_attempts": [
                {
                    "quiz": a.quiz.title, "score": a.score, "passed": a.passed,
                    "submitted_at": a.submitted_at,
                } for a in attempts
            ],
            "submissions": [
                {
                    "devoir": s.devoir.title, "grade": s.grade, "max_score": s.devoir.max_score,
                    "submitted_at": s.submitted_at,
                } for s in submissions
            ],
        })
