from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class AuthAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword123",
            role=User.Role.PATIENT,
        )
        self.therapist = User.objects.create_user(
            username="therapist_user",
            email="therapist_user@example.com",
            password="password123",
            role=User.Role.THERAPIST,
        )

    def test_registration_creates_patient_user(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "new_patient",
                "email": "new_patient@example.com",
                "password": "securepassword123",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"]["username"], "new_patient")
        self.assertEqual(response.data["user"]["role"], "PATIENT")

    def test_login_returns_jwt_tokens(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "email": "testuser@example.com",
                "password": "testpassword123",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "testuser@example.com")

    def test_token_refresh(self):
        refresh = str(RefreshToken.for_user(self.user))
        response = self.client.post(
            "/api/auth/token/refresh/",
            {"refresh": refresh},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_me_endpoint_requires_auth(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_endpoint_with_jwt_token(self):
        token = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["username"], "testuser")

    def test_user_listing_by_role(self):
        token = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get("/api/auth/users/?role=THERAPIST")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usernames = [u["username"] for u in response.data]
        self.assertIn("therapist_user", usernames)
