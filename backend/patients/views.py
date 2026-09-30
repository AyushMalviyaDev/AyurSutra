from .models import PatientProfile, MedicalRecord
from .serializers import (
    PatientProfileSerializer,
    MedicalRecordSerializer,
)
from rest_framework import viewsets
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    PatientProfile,
    MedicalRecord,
    PatientAssessment,
)

from .serializers import (
    PatientProfileSerializer,
    MedicalRecordSerializer,
    PatientAssessmentSerializer,
)
from .models import (
    PatientProfile,
    MedicalRecord,
    PatientAssessment,
)

from .serializers import (
    PatientProfileSerializer,
    MedicalRecordSerializer,
    PatientAssessmentSerializer,
)

from .models import PatientProfile
from .serializers import PatientProfileSerializer


class PatientAssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = PatientAssessmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "PATIENT":
            return PatientAssessment.objects.filter(
                patient=user
            )

        if user.role == "VAIDYA":
            return PatientAssessment.objects.filter(
                assessed_by=user
            )

        if user.role == "ADMIN":
            return PatientAssessment.objects.all()

        return PatientAssessment.objects.none()


    
class MedicalRecordViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "PATIENT":
            return MedicalRecord.objects.filter(
                patient=user
            )

        if user.role == "VAIDYA":
            return MedicalRecord.objects.filter(
                recorded_by=user
            )

        if user.role == "ADMIN":
            return MedicalRecord.objects.all()

        return MedicalRecord.objects.none()

    
class MyPatientProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "PATIENT":
            return Response(
                {
                    "detail": "Only patients can access this profile."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        profile, created = PatientProfile.objects.get_or_create(
            user=request.user
        )

        serializer = PatientProfileSerializer(profile)

        return Response(serializer.data)

    def put(self, request):
        if request.user.role != "PATIENT":
            return Response(
                {
                    "detail": "Only patients can update this profile."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        profile, created = PatientProfile.objects.get_or_create(
            user=request.user
        )

        serializer = PatientProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class PatientAssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = PatientAssessmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "PATIENT":
            return PatientAssessment.objects.filter(
                patient=user
            )

        if user.role == "VAIDYA":
            return PatientAssessment.objects.filter(
                assessed_by=user
            )

        if user.role == "ADMIN":
            return PatientAssessment.objects.all()

        return PatientAssessment.objects.none()
    