from datetime import datetime

from rest_framework import serializers
from .models import (
    Room,
    RoomAvailability,
    TherapistAvailability,
    PatientAvailability,
    TherapySession,
)

# ============================================================
# ROOM SERIALIZER
# ============================================================

class RoomSerializer(serializers.ModelSerializer):

    class Meta:
        model = Room

        fields = [
            "id",
            "name",
            "room_number",
            "is_active",
        ]

        read_only_fields = [
            "id",
        ]

class RoomAvailabilitySerializer(serializers.ModelSerializer):

    room_name = serializers.CharField(
        source="room.name",
        read_only=True
    )

    room_number = serializers.CharField(
        source="room.room_number",
        read_only=True
    )

    class Meta:
        model = RoomAvailability

        fields = [
            "id",
            "room",
            "room_name",
            "room_number",
            "day_of_week",
            "start_time",
            "end_time",
            "is_available",
        ]

        read_only_fields = [
            "id",
            "room_name",
            "room_number",
        ]

    def validate(self, data):

        room = data.get(
            "room",
            getattr(
                self.instance,
                "room",
                None
            )
        )

        start_time = data.get(
            "start_time",
            getattr(
                self.instance,
                "start_time",
                None
            )
        )

        end_time = data.get(
            "end_time",
            getattr(
                self.instance,
                "end_time",
                None
            )
        )

        if room and not room.is_active:

            raise serializers.ValidationError({
                "room":
                    "This room is currently inactive."
            })

        if start_time and end_time:

            if start_time >= end_time:

                raise serializers.ValidationError({
                    "end_time":
                        "End time must be after start time."
                })

        return data
    
# ============================================================
# THERAPIST AVAILABILITY SERIALIZER
# ============================================================

class TherapistAvailabilitySerializer(serializers.ModelSerializer):

    therapist_name = serializers.CharField(
        source="therapist.username",
        read_only=True
    )

    class Meta:
        model = TherapistAvailability

        fields = [
            "id",
            "therapist",
            "therapist_name",
            "day_of_week",
            "start_time",
            "end_time",
            "is_available",
        ]

        read_only_fields = [
            "id",
            "therapist_name",
        ]

    def validate(self, data):

        therapist = data.get(
            "therapist",
            getattr(
                self.instance,
                "therapist",
                None
            )
        )

        start_time = data.get(
            "start_time",
            getattr(
                self.instance,
                "start_time",
                None
            )
        )

        end_time = data.get(
            "end_time",
            getattr(
                self.instance,
                "end_time",
                None
            )
        )

        # --------------------------------
        # Therapist must actually be
        # a therapist
        # --------------------------------

        if therapist and therapist.role != "THERAPIST":

            raise serializers.ValidationError({
                "therapist":
                    "Selected user is not a therapist."
            })

        # --------------------------------
        # Start time must be before
        # end time
        # --------------------------------

        if start_time and end_time:

            if start_time >= end_time:

                raise serializers.ValidationError({
                    "end_time":
                        "End time must be after start time."
                })

        return data

class PatientAvailabilitySerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="patient.username",
        read_only=True
    )

    class Meta:
        model = PatientAvailability

        fields = [
            "id",
            "patient",
            "patient_name",
            "day_of_week",
            "start_time",
            "end_time",
            "is_available",
        ]

        read_only_fields = [
            "id",
            "patient_name",
        ]

    def validate(self, data):

        patient = data.get(
            "patient",
            getattr(self.instance, "patient", None)
        )

        start_time = data.get(
            "start_time",
            getattr(self.instance, "start_time", None)
        )

        end_time = data.get(
            "end_time",
            getattr(self.instance, "end_time", None)
        )

        # Patient role validation
        if patient and patient.role != "PATIENT":
            raise serializers.ValidationError({
                "patient": "Selected user is not a patient."
            })

        # Time validation
        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError({
                "end_time": "End time must be after start time."
            })

        return data
    
# ============================================================
# THERAPY SESSION SERIALIZER
# ============================================================

class TherapySessionSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="patient.username",
        read_only=True
    )

    therapist_name = serializers.CharField(
        source="therapist.username",
        read_only=True
    )

    room_name = serializers.CharField(
        source="room.name",
        read_only=True
    )

    therapy_name = serializers.CharField(
        source="patient_therapy.therapy.name",
        read_only=True
    )

    class Meta:
        model = TherapySession

        fields = [
            "id",

            "patient_therapy",
            "therapy_name",

            "patient",
            "patient_name",

            "therapist",
            "therapist_name",

            "room",
            "room_name",

            "session_date",
            "start_time",
            "end_time",

            "session_number",

            "status",

            "therapist_notes",
            "patient_notes",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "therapy_name",
            "patient_name",
            "therapist_name",
            "room_name",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):

        # ====================================================
        # GET VALUES
        # ====================================================

        patient_therapy = data.get(
            "patient_therapy",
            getattr(
                self.instance,
                "patient_therapy",
                None
            )
        )

        patient = data.get(
            "patient",
            getattr(
                self.instance,
                "patient",
                None
            )
        )

        therapist = data.get(
            "therapist",
            getattr(
                self.instance,
                "therapist",
                None
            )
        )

        room = data.get(
            "room",
            getattr(
                self.instance,
                "room",
                None
            )
        )

        session_date = data.get(
            "session_date",
            getattr(
                self.instance,
                "session_date",
                None
            )
        )

        start_time = data.get(
            "start_time",
            getattr(
                self.instance,
                "start_time",
                None
            )
        )

        end_time = data.get(
            "end_time",
            getattr(
                self.instance,
                "end_time",
                None
            )
        )

        session_number = data.get(
            "session_number",
            getattr(
                self.instance,
                "session_number",
                None
            )
        )

        status = data.get(
            "status",
            getattr(
                self.instance,
                "status",
                TherapySession.Status.SCHEDULED
            )
        )

        # ====================================================
        # 1. BASIC TIME VALIDATION
        # ====================================================

        if start_time and end_time:

            if start_time >= end_time:

                raise serializers.ValidationError({
                    "end_time":
                        "End time must be after start time."
                })

        # ====================================================
        # 2. PATIENT VALIDATION
        # ====================================================

        if patient:

            if patient.role != "PATIENT":

                raise serializers.ValidationError({
                    "patient":
                        "Selected user is not a patient."
                })

        # ====================================================
        # 3. THERAPIST VALIDATION
        # ====================================================

        if therapist:

            if therapist.role != "THERAPIST":

                raise serializers.ValidationError({
                    "therapist":
                        "Selected user is not a therapist."
                })

        # --------------------------------
        # Room availability
        # --------------------------------

        if (
            room
            and session_date
            and start_time
            and end_time
        ):

            day_of_week = session_date.weekday()

            room_is_available = (
                RoomAvailability.objects.filter(
                    room=room,
                    day_of_week=day_of_week,
                    start_time__lte=start_time,
                    end_time__gte=end_time,
                    is_available=True,
                ).exists()
            )

            if not room_is_available:

                raise serializers.ValidationError({
                    "room":
                        "This room is not available "
                        "during the selected time."
                })
    
        # ====================================================
        # 4. PATIENT THERAPY VALIDATION
        # ====================================================

        if patient_therapy and patient:

            if patient_therapy.patient_id != patient.id:

                raise serializers.ValidationError({
                    "patient_therapy":
                        "This treatment does not belong "
                        "to the selected patient."
                })

        # ====================================================
        # 5. SESSION NUMBER VALIDATION
        # ====================================================

        if patient_therapy and session_number:

            # Cannot exceed prescribed sessions

            if session_number > patient_therapy.sessions:

                raise serializers.ValidationError({
                    "session_number":
                        "Session number cannot exceed "
                        "the prescribed number of sessions."
                })

            # Prevent duplicate session numbers

            existing_session = TherapySession.objects.filter(
                patient_therapy=patient_therapy,
                session_number=session_number
            )

            # When updating a session, exclude itself

            if self.instance:

                existing_session = existing_session.exclude(
                    pk=self.instance.pk
                )

            if existing_session.exists():

                raise serializers.ValidationError({
                    "session_number":
                        "This session number already exists "
                        "for this treatment."
                })

        # ====================================================
        # 6. THERAPY DURATION VALIDATION
        # ====================================================

        if (
            patient_therapy
            and session_date
            and start_time
            and end_time
        ):

            therapy = patient_therapy.therapy

            start_datetime = datetime.combine(
                session_date,
                start_time
            )

            end_datetime = datetime.combine(
                session_date,
                end_time
            )

            duration = (
                end_datetime - start_datetime
            ).total_seconds() / 60

            if duration != therapy.duration_minutes:

                raise serializers.ValidationError({
                    "end_time":
                        f"This therapy requires exactly "
                        f"{therapy.duration_minutes} minutes."
                })

        # ====================================================
        # 7. THERAPIST AVAILABILITY
        # ====================================================

        if (
            therapist
            and session_date
            and start_time
            and end_time
        ):

            # Python weekday:
            #
            # Monday    = 0
            # Tuesday   = 1
            # Wednesday = 2
            # Thursday  = 3
            # Friday    = 4
            # Saturday  = 5
            # Sunday    = 6

            day_of_week = session_date.weekday()

            therapist_is_available = (
                TherapistAvailability.objects.filter(
                    therapist=therapist,
                    day_of_week=day_of_week,
                    start_time__lte=start_time,
                    end_time__gte=end_time,
                    is_available=True,
                ).exists()
            )

            if not therapist_is_available:

                raise serializers.ValidationError({
                    "therapist":
                        "This therapist is not available "
                        "during the selected time."
                })
        # ------------------------------------------------------------
        # PATIENT AVAILABILITY
        # ------------------------------------------------------------

        day_of_week = session_date.weekday()

        patient_is_available = PatientAvailability.objects.filter(
            patient=patient,
            day_of_week=day_of_week,
            start_time__lte=start_time,
            end_time__gte=end_time,
            is_available=True,
        ).exists()

        if not patient_is_available:
            raise serializers.ValidationError({
                "patient": "This patient is not available during the selected time."
            })
        # ====================================================
        # 8. SKIP CONFLICT CHECK FOR CANCELLED / NO-SHOW
        # ====================================================

        if status in [
            TherapySession.Status.CANCELLED,
            TherapySession.Status.NO_SHOW,
        ]:

            return data

        # ====================================================
        # 9. OVERLAPPING SESSION QUERY
        # ====================================================

        if (
            session_date
            and start_time
            and end_time
        ):

            overlapping_sessions = TherapySession.objects.filter(

                session_date=session_date,

                # Existing session starts before
                # new session ends

                start_time__lt=end_time,

                # Existing session ends after
                # new session starts

                end_time__gt=start_time,
            ).exclude(

                status__in=[
                    TherapySession.Status.CANCELLED,
                    TherapySession.Status.NO_SHOW,
                ]
            )

            # Exclude current session while updating

            if self.instance:

                overlapping_sessions = (
                    overlapping_sessions.exclude(
                        pk=self.instance.pk
                    )
                )

            # =================================================
            # 9A. THERAPIST CONFLICT
            # =================================================

            if therapist:

                therapist_conflict = (
                    overlapping_sessions.filter(
                        therapist=therapist
                    ).exists()
                )

                if therapist_conflict:

                    raise serializers.ValidationError({
                        "therapist":
                            "This therapist already has "
                            "another session during this time."
                    })

            # =================================================
            # 9B. ROOM CONFLICT
            # =================================================

            if room:

                room_conflict = (
                    overlapping_sessions.filter(
                        room=room
                    ).exists()
                )

                if room_conflict:

                    raise serializers.ValidationError({
                        "room":
                            "This room is already occupied "
                            "during this time."
                    })

            # =================================================
            # 9C. PATIENT CONFLICT
            # =================================================

            if patient:

                patient_conflict = (
                    overlapping_sessions.filter(
                        patient=patient
                    ).exists()
                )

                if patient_conflict:

                    raise serializers.ValidationError({
                        "patient":
                            "This patient already has "
                            "another session during this time."
                    })

        # ====================================================
        # ALL VALIDATIONS PASSED
        # ====================================================

        return data