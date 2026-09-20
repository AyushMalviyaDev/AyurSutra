from rest_framework import serializers

from .models import Room, TherapySession


class RoomSerializer(serializers.ModelSerializer):

    class Meta:
        model = Room
        fields = [
            "id",
            "name",
            "room_number",
            "is_active",
        ]


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