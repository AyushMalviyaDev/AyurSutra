from rest_framework import serializers

from .models import Therapy, PatientTherapy


class TherapySerializer(serializers.ModelSerializer):

    class Meta:
        model = Therapy
        fields = [
            "id",
            "name",
            "description",
            "duration_minutes",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]


class PatientTherapySerializer(serializers.ModelSerializer):

    therapy_name = serializers.CharField(
        source="therapy.name",
        read_only=True
    )

    patient_name = serializers.CharField(
        source="patient.username",
        read_only=True
    )

    vaidya_name = serializers.CharField(
        source="prescribed_by.username",
        read_only=True
    )

    class Meta:
        model = PatientTherapy
        fields = [
            "id",
            "patient",
            "patient_name",
            "therapy",
            "therapy_name",
            "prescribed_by",
            "vaidya_name",
            "sessions",
            "status",
            "physician_notes",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "patient_name",
            "therapy_name",
            "vaidya_name",
            "created_at",
            "updated_at",
        ]