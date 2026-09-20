from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Room, TherapySession
from .serializers import (
    RoomSerializer,
    TherapySessionSerializer,
)


class RoomViewSet(viewsets.ModelViewSet):

    queryset = Room.objects.filter(
        is_active=True
    )

    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]


class TherapySessionViewSet(viewsets.ModelViewSet):

    serializer_class = TherapySessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.role == "PATIENT":
            return TherapySession.objects.filter(
                patient=user
            )

        if user.role == "THERAPIST":
            return TherapySession.objects.filter(
                therapist=user
            )

        if user.role == "VAIDYA":
            return TherapySession.objects.filter(
                patient_therapy__prescribed_by=user
            )

        return TherapySession.objects.all()