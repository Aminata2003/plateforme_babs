from unittest.mock import patch

from django.core import mail
from rest_framework.test import APITestCase

from apps.accounts.models import User, UserRole
from apps.courses.models import Enrollment
from .models import LiveSession


class LiveSessionInvitationTests(APITestCase):
    def setUp(self):
        self.trainer = User.objects.create_user(
            email="trainer@example.com", password="Password123!", role=UserRole.FORMATEUR,
        )
        self.learner = User.objects.create_user(
            email="learner@example.com", password="Password123!", first_name="Ada",
        )
        Enrollment.objects.create(user=self.learner, is_active=True)
        self.session = LiveSession.objects.create(
            type="rencontre", title="Session test", scheduled_at="2026-09-01T10:00:00Z",
            duration_minutes=60, meeting_link="https://meet.example/session", created_by=self.trainer,
        )
        self.client.force_authenticate(self.trainer)

    @patch("apps.live_sessions.views.send_mail")
    def test_notify_sends_to_selected_learner_and_manual_email(self, send_mail):
        response = self.client.post(
            f"/api/live-sessions/{self.session.id}/notify/",
            {"user_ids": [self.learner.id], "emails": ["guest@example.com"]},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(send_mail.call_count, 2)

    def test_unenrolled_learner_cannot_register_for_session(self):
        self.learner.enrollment.is_active = False
        self.learner.enrollment.save()
        self.client.force_authenticate(self.learner)

        response = self.client.post(f"/api/live-sessions/{self.session.id}/register/")

        self.assertEqual(response.status_code, 403)
