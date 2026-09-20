from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from datetime import datetime

from rest_framework import status
from rest_framework.response import Response

from therapies.models import PatientTherapy
from .services.scheduler import find_available_slots
from rest_framework.views import APIView


from .models import (
    Room,
    RoomAvailability,
    TherapistAvailability,
    PatientAvailability,
    TherapySession,
)

from .serializers import (
    RoomSerializer,
    RoomAvailabilitySerializer,
    TherapistAvailabilitySerializer,
    PatientAvailabilitySerializer,
    TherapySessionSerializer,
)

# ============================================================
# ROOM
# ============================================================

class PatientAvailabilityViewSet(viewsets.ModelViewSet):

    serializer_class = PatientAvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # Patient → only their own availability
        if user.role == "PATIENT":

            return PatientAvailability.objects.filter(
                patient=user
            )

        # Admin → all patient availability
        if user.role == "ADMIN":

            return PatientAvailability.objects.all()

        # Vaidya → all patient availability
        if user.role == "VAIDYA":

            return PatientAvailability.objects.filter(
                patient__role="PATIENT"
            )

        return PatientAvailability.objects.none()

    
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

class FindAvailableSlotsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        patient_id = request.query_params.get("patient")
        therapist_id = request.query_params.get("therapist")
        patient_therapy_id = request.query_params.get(
            "patient_therapy"
        )
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        # --------------------------------------------------
        # Required parameters
        # --------------------------------------------------

        if not patient_id:
            return Response(
                {"patient": "This parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not therapist_id:
            return Response(
                {"therapist": "This parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not patient_therapy_id:
            return Response(
                {"patient_therapy": "This parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not start_date:
            return Response(
                {"start_date": "This parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not end_date:
            return Response(
                {"end_date": "This parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # Parse dates
        # --------------------------------------------------

        try:
            start_date = datetime.strptime(
                start_date,
                "%Y-%m-%d"
            ).date()

            end_date = datetime.strptime(
                end_date,
                "%Y-%m-%d"
            ).date()

        except ValueError:

            return Response(
                {
                    "detail": (
                        "Dates must use YYYY-MM-DD format."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if start_date > end_date:

            return Response(
                {
                    "detail": (
                        "start_date must be before or "
                        "equal to end_date."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # Get PatientTherapy
        # --------------------------------------------------

        try:

            patient_therapy = PatientTherapy.objects.select_related(
                "patient",
                "therapy",
            ).get(
                id=patient_therapy_id
            )

        except PatientTherapy.DoesNotExist:

            return Response(
                {
                    "patient_therapy": (
                        "Patient therapy does not exist."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # --------------------------------------------------
        # Validate patient
        # --------------------------------------------------

        if patient_therapy.patient_id != int(patient_id):

            return Response(
                {
                    "patient": (
                        "This treatment does not belong "
                        "to the selected patient."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # Get users
        # --------------------------------------------------

        from accounts.models import User

        try:

            patient = User.objects.get(
                id=patient_id,
                role=User.Role.PATIENT,
            )

        except User.DoesNotExist:

            return Response(
                {
                    "patient": (
                        "Valid patient was not found."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:

            therapist = User.objects.get(
                id=therapist_id,
                role=User.Role.THERAPIST,
            )

        except User.DoesNotExist:

            return Response(
                {
                    "therapist": (
                        "Valid therapist was not found."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # --------------------------------------------------
        # Find available slots
        # --------------------------------------------------

        slots = find_available_slots(
            patient=patient,
            therapist=therapist,
            therapy=patient_therapy.therapy,
            start_date=start_date,
            end_date=end_date,
        )

        # --------------------------------------------------
        # Convert model objects to JSON
        # --------------------------------------------------

        result = []

        for slot in slots:

            result.append(
                {
                    "date": slot["date"].isoformat(),
                    "start_time": slot[
                        "start_time"
                    ].strftime("%H:%M:%S"),
                    "end_time": slot[
                        "end_time"
                    ].strftime("%H:%M:%S"),
                    "room": slot["room"].id,
                    "room_name": slot["room"].name,
                    "room_number": slot[
                        "room"
                    ].room_number,
                }
            )

        return Response(
            {
                "count": len(result),
                "slots": result,
            },
            status=status.HTTP_200_OK,
        )
    