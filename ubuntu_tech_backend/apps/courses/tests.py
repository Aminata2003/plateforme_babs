from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase

from apps.accounts.models import User, UserRole
from .models import Choice, Devoir, Enrollment, Lesson, Module, Question, Submission


class CourseAccessTests(APITestCase):
    def setUp(self):
        self.learner = User.objects.create_user(
            email="learner@example.com", password="Password123!",
        )
        self.trainer = User.objects.create_user(
            email="trainer@example.com", password="Password123!", role=UserRole.FORMATEUR,
        )
        self.module = Module.objects.create(title="Excel", is_published=True, created_by=self.trainer)
        self.lesson = Lesson.objects.create(
            module=self.module, title="Formules", youtube_url="https://youtube.com/watch?v=test",
            is_published=True,
        )
        self.devoir = Devoir.objects.create(module=self.module, title="Exercice", instructions="Rendre le fichier")

    def test_unenrolled_learner_cannot_read_lessons(self):
        self.client.force_authenticate(self.learner)

        response = self.client.get(f"/api/lessons/?module={self.module.id}")

        self.assertEqual(response.status_code, 403)

    def test_unenrolled_learner_gets_catalogue_without_lessons(self):
        self.client.force_authenticate(self.learner)

        response = self.client.get(f"/api/modules/{self.module.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["lessons"], [])
        self.assertEqual(response.data["lessons_count"], 0)

    def test_enrolled_learner_can_read_lessons_and_submit_a_devoir(self):
        Enrollment.objects.create(user=self.learner, is_active=True)
        self.client.force_authenticate(self.learner)

        lesson_response = self.client.get(f"/api/lessons/?module={self.module.id}")
        submission_response = self.client.post(
            "/api/submissions/",
            {
                "devoir": self.devoir.id,
                "file": SimpleUploadedFile("answer.txt", b"answer"),
                "comment": "Voici mon travail",
            },
            format="multipart",
        )

        self.assertEqual(lesson_response.status_code, 200)
        self.assertEqual(submission_response.status_code, 201)

    def test_learner_cannot_change_grade_or_feedback(self):
        Enrollment.objects.create(user=self.learner, is_active=True)
        self.client.force_authenticate(self.learner)
        self.client.post(
            "/api/submissions/",
            {"devoir": self.devoir.id, "file": SimpleUploadedFile("answer.txt", b"answer")},
            format="multipart",
        )
        submission = Submission.objects.get(user=self.learner, devoir=self.devoir)

        response = self.client.patch(
            f"/api/submissions/{submission.id}/",
            {"grade": 10, "feedback": "Auto-correction"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_quiz_rejects_non_object_answers(self):
        Enrollment.objects.create(user=self.learner, is_active=True)
        self.client.force_authenticate(self.trainer)
        from .models import Quiz
        quiz = Quiz.objects.create(lesson=self.lesson, title="Quiz")
        question = Question.objects.create(quiz=quiz, text="Question")
        Choice.objects.create(question=question, text="Réponse", is_correct=True)
        self.client.force_authenticate(self.learner)

        response = self.client.post(f"/api/quizzes/{quiz.id}/submit_attempt/", {"answers": []}, format="json")

        self.assertEqual(response.status_code, 400)
