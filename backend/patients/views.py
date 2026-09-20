from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PatientProfile
from .serializers import PatientProfileSerializer


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