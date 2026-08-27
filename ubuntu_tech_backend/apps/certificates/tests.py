from unittest.mock import patch

from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.courses.models import Enrollment
from .models import Certificate


class CertificateAccessTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="learner@example.com", password="Password123!",
        )
        self.client.force_authenticate(self.user)

    def test_certificate_requires_active_enrollment(self):
        response = self.client.post("/api/certificates/me/")

        self.assertEqual(response.status_code, 403)
        self.assertFalse(Certificate.objects.filter(user=self.user).exists())

    @patch("apps.certificates.views.generate_certificate_pdf")
    def test_enrolled_user_can_generate_certificate_when_course_is_empty(self, generate_pdf):
        Enrollment.objects.create(user=self.user, is_active=True)

        response = self.client.post("/api/certificates/me/")

        self.assertEqual(response.status_code, 201)
        self.assertTrue(Certificate.objects.filter(user=self.user).exists())
        generate_pdf.assert_called_once()
