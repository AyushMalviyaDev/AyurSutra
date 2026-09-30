from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Therapy, PatientTherapy
from .serializers import (
    TherapySerializer,
    PatientTherapySerializer,
)
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Therapy, PatientTherapy
from .serializers import TherapySerializer, PatientTherapySerializer


class PatientTherapyViewSet(viewsets.ModelViewSet):
    serializer_class = PatientTherapySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "PATIENT":
            return PatientTherapy.objects.filter(
                patient=user
            )

        if user.role == "VAIDYA":
            return PatientTherapy.objects.filter(
                prescribed_by=user
            )

        if user.role == "THERAPIST":
            return PatientTherapy.objects.filter(
                status__in=[
                    PatientTherapy.Status.SCHEDULED,
                    PatientTherapy.Status.IN_PROGRESS,
                    PatientTherapy.Status.COMPLETED,
                ]
            )

        if user.role == "ADMIN":
            return PatientTherapy.objects.all()

        return PatientTherapy.objects.none()

    

class TherapyViewSet(viewsets.ModelViewSet):

    queryset = Therapy.objects.filter(is_active=True)
    serializer_class = TherapySerializer
    permission_classes = [IsAuthenticated]


class PatientTherapyViewSet(viewsets.ModelViewSet):

    serializer_class = PatientTherapySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "PATIENT":
            return PatientTherapy.objects.filter(
                patient=user
            )

        if user.role == "VAIDYA":
            return PatientTherapy.objects.filter(
                prescribed_by=user
            )

        return PatientTherapy.objects.all()