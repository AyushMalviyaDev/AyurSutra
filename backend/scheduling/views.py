from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import (
    Room,
    RoomAvailability,
    TherapistAvailability,
    TherapySession,
)

from .serializers import (
    RoomSerializer,
    RoomAvailabilitySerializer,
    TherapistAvailabilitySerializer,
    TherapySessionSerializer,
)


# ============================================================
# ROOM
# ============================================================

class RoomViewSet(viewsets.ModelViewSet):

    queryset = Room.objects.filter(
        is_active=True
    )

    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]


# ============================================================
# THERAPIST AVAILABILITY
# ============================================================

class TherapistAvailabilityViewSet(viewsets.ModelViewSet):

    serializer_class = TherapistAvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # Therapist sees only their own availability
        if user.role == "THERAPIST":

            return TherapistAvailability.objects.filter(
                therapist=user
            )

        # Admin sees all
        if user.role == "ADMIN":

            return TherapistAvailability.objects.all()

        # Vaidya can see therapist availability
        if user.role == "VAIDYA":

            return TherapistAvailability.objects.filter(
                therapist__role="THERAPIST"
            )

        return TherapistAvailability.objects.none()


# ============================================================
# ROOM AVAILABILITY
# ============================================================

class RoomAvailabilityViewSet(viewsets.ModelViewSet):

    serializer_class = RoomAvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # Admin sees everything
        if user.role == "ADMIN":

            return RoomAvailability.objects.all()

        # Vaidya can see active room availability
        if user.role == "VAIDYA":

            return RoomAvailability.objects.filter(
                room__is_active=True
            )

        # Other authenticated users
        # can see active rooms
        return RoomAvailability.objects.filter(
            room__is_active=True
        )


# ============================================================
# THERAPY SESSION
# ============================================================

class TherapySessionViewSet(viewsets.ModelViewSet):

    serializer_class = TherapySessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # Patient → only own sessions
        if user.role == "PATIENT":

            return TherapySession.objects.filter(
                patient=user
            )

        # Therapist → assigned sessions
        if user.role == "THERAPIST":

            return TherapySession.objects.filter(
                therapist=user
            )

        # Vaidya → sessions belonging to
        # their prescribed treatments
        if user.role == "VAIDYA":

            return TherapySession.objects.filter(
                patient_therapy__prescribed_by=user
            )

        # Admin → everything
        return TherapySession.objects.all()