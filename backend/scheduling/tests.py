from datetime import date, time
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from scheduling.models import Room, TherapySession
from therapies.models import Therapy, PatientTherapy

User = get_user_model()


class TherapySessionAPITests(APITestCase):
    def setUp(self):
        # Create users
        self.patient1 = User.objects.create_user(
            username="patient1",
            email="patient1@example.com",
            password="password123",
            role=User.Role.PATIENT,
        )
        self.patient2 = User.objects.create_user(
            username="patient2",
            email="patient2@example.com",
            password="password123",
            role=User.Role.PATIENT,
        )
        self.therapist = User.objects.create_user(
            username="therapist1",
            email="therapist1@example.com",
            password="password123",
            role=User.Role.THERAPIST,
        )
        self.vaidya = User.objects.create_user(
            username="vaidya1",
            email="vaidya1@example.com",
            password="password123",
            role=User.Role.VAIDYA,
        )
        self.admin = User.objects.create_user(
            username="admin1",
            email="admin1@example.com",
            password="password123",
            role=User.Role.ADMIN,
        )

        # Create room and therapy
        self.room, _ = Room.objects.get_or_create(room_number="101", defaults={"name": "Room A"})
        self.therapy, _ = Therapy.objects.get_or_create(
            name=Therapy.TherapyType.ABHYANGA,
            defaults={
                "description": "Oil massage",
                "duration_minutes": 45,
            },
        )

        # Create patient therapies
        self.pt1 = PatientTherapy.objects.create(
            patient=self.patient1,
            therapy=self.therapy,
            prescribed_by=self.vaidya,
            sessions=5,
        )
        self.pt2 = PatientTherapy.objects.create(
            patient=self.patient2,
            therapy=self.therapy,
            prescribed_by=self.vaidya,
            sessions=3,
        )

        # Create therapy sessions
        self.session1 = TherapySession.objects.create(
            patient_therapy=self.pt1,
            patient=self.patient1,
            therapist=self.therapist,
            room=self.room,
            session_date=date(2026, 10, 10),
            start_time=time(10, 0),
            end_time=time(11, 0),
            session_number=1,
            status=TherapySession.Status.SCHEDULED,
        )
        self.session2 = TherapySession.objects.create(
            patient_therapy=self.pt2,
            patient=self.patient2,
            therapist=self.therapist,
            room=self.room,
            session_date=date(2026, 10, 11),
            start_time=time(11, 0),
            end_time=time(12, 0),
            session_number=1,
            status=TherapySession.Status.SCHEDULED,
        )

    def get_jwt_token(self, user):
        return str(RefreshToken.for_user(user).access_token)

    def test_unauthenticated_sessions_request_returns_401(self):
        """Unauthenticated requests must be rejected with 401 Unauthorized."""
        response = self.client.get("/api/scheduling/sessions/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patient_can_only_access_own_sessions(self):
        """Patient 1 should only receive their own sessions and not Patient 2's sessions."""
        token = self.get_jwt_token(self.patient1)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get("/api/scheduling/sessions/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        session_ids = [s["id"] for s in response.data]
        self.assertIn(self.session1.id, session_ids)
        self.assertNotIn(self.session2.id, session_ids)

    def test_therapist_access_assigned_sessions(self):
        """Therapist should see sessions assigned to them."""
        token = self.get_jwt_token(self.therapist)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get("/api/scheduling/sessions/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        session_ids = [s["id"] for s in response.data]
        self.assertIn(self.session1.id, session_ids)
        self.assertIn(self.session2.id, session_ids)

    def test_admin_access_all_sessions(self):
        """Admin should see all sessions."""
        token = self.get_jwt_token(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get("/api/scheduling/sessions/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_scheduling_routes_accessible(self):
        """Verify book-session and find-slots endpoints are wired up in URLs."""
        token = self.get_jwt_token(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        find_slots_res = self.client.get("/api/scheduling/find-slots/")
        # Should not be 404 (will be 400 because required query params are missing)
        self.assertEqual(find_slots_res.status_code, status.HTTP_400_BAD_REQUEST)

        book_session_res = self.client.post("/api/scheduling/book-session/", {})
        # Should not be 404 (will be 400 because required body params are missing)
        self.assertEqual(book_session_res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_therapist_record_progress(self):
        token = self.get_jwt_token(self.therapist)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.post(
            "/api/scheduling/progress/",
            {
                "session": self.session1.id,
                "recorded_by": self.therapist.id,
                "discomfort_level": 2,
                "patient_response": "Felt relaxed",
                "therapist_observations": "Good response to Abhyanga",
                "progress_notes": "Continue current regimen",
                "completed_successfully": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["discomfort_level"], 2)
