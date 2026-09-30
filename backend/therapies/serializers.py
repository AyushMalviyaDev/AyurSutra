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

    def validate(self, data):
        patient = data.get(
            "patient",
            getattr(self.instance, "patient", None)
        )

        prescribed_by = data.get(
            "prescribed_by",
            getattr(self.instance, "prescribed_by", None)
        )

        sessions = data.get(
            "sessions",
            getattr(self.instance, "sessions", None)
        )

        if patient and patient.role != "PATIENT":
            raise serializers.ValidationError({
                "patient": "Selected user is not a patient."
            })

        if prescribed_by and prescribed_by.role != "VAIDYA":
            raise serializers.ValidationError({
                "prescribed_by":
                "Treatment can only be prescribed by a Vaidya."
            })

        if sessions is not None and sessions < 1:
            raise serializers.ValidationError({
                "sessions": "At least one session is required."
            })

        start_date = data.get(
            "start_date",
            getattr(self.instance, "start_date", None)
        )

        end_date = data.get(
            "end_date",
            getattr(self.instance, "end_date", None)
        )

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({
                "end_date": "End date cannot be before start date."
            })

        return data