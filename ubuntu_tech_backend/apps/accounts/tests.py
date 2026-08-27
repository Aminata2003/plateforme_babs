from django.urls import reverse
from rest_framework.test import APITestCase

from .models import User, UserRole
from apps.courses.models import Enrollment


class AccountAccessTests(APITestCase):
    def setUp(self):
        self.learner = User.objects.create_user(
            email="learner@example.com", password="Password123!", first_name="Ada",
        )
        self.formateur = User.objects.create_user(
            email="trainer@example.com", password="Password123!", role=UserRole.FORMATEUR,
        )

    def test_formateur_can_list_learners_without_admin_write_access(self):
        self.client.force_authenticate(self.formateur)

        response = self.client.get("/api/users/?role=apprenant&is_active=true")

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["email"] for item in response.data], [self.learner.email])

    def test_formateur_cannot_create_users(self):
        self.client.force_authenticate(self.formateur)

        response = self.client.post(
            "/api/users/",
            {"email": "new@example.com", "password": "Password123!", "role": "formateur"},
        )

        self.assertEqual(response.status_code, 403)

    def test_learner_filter_returns_only_active_learners(self):
        self.learner.is_active = False
        self.learner.save(update_fields=["is_active"])
        active_learner = User.objects.create_user(
            email="active@example.com", password="Password123!",
        )
        Enrollment.objects.create(user=active_learner, is_active=True)
        self.client.force_authenticate(self.formateur)

        response = self.client.get("/api/users/?role=apprenant&is_active=true")

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["email"] for item in response.data], [active_learner.email])
