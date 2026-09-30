from rest_framework import serializers
from .models import (
    PatientProfile,
    MedicalRecord,
    PatientAssessment,
)
from .models import PatientProfile

class PatientAssessmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source="patient.username",
        read_only=True
    )

    assessed_by_name = serializers.CharField(
        source="assessed_by.username",
        read_only=True
    )

    class Meta:
        model = PatientAssessment

        fields = [
            "id",
            "patient",
            "patient_name",
            "assessed_by",
            "assessed_by_name",
            "prakriti",
            "vikriti",
            "weight_kg",
            "blood_pressure",
            "pulse_rate",
            "symptoms",
            "clinical_observations",
            "assessment_notes",
            "assessed_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "patient_name",
            "assessed_by_name",
            "assessed_at",
            "updated_at",
        ]

    def validate(self, data):
        patient = data.get(
            "patient",
            getattr(self.instance, "patient", None)
        )

        assessed_by = data.get(
            "assessed_by",
            getattr(self.instance, "assessed_by", None)
        )

        if patient and patient.role != "PATIENT":
            raise serializers.ValidationError({
                "patient": "Selected user is not a patient."
            })

        if assessed_by and assessed_by.role != "VAIDYA":
            raise serializers.ValidationError({
                "assessed_by": "Assessment can only be performed by a Vaidya."
            })

        return data

class PatientProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    class Meta:
        model = PatientProfile
        fields = [
            "id",
            "username",
            "email",
            "date_of_birth",
            "gender",
            "phone",
            "address",
            "prakriti",
            "vikriti",
            "medical_history",
            "allergies",
            "emergency_contact_name",
            "emergency_contact_phone",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "username",
            "email",
            "created_at",
            "updated_at",
        ]


class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source="patient.username",
        read_only=True
    )

    recorded_by_name = serializers.CharField(
        source="recorded_by.username",
        read_only=True
    )

    class Meta:
        model = MedicalRecord

        fields = [
            "id",
            "patient",
            "patient_name",
            "recorded_by",
            "recorded_by_name",
            "diagnosis",
            "symptoms",
            "medical_history",
            "allergies",
            "current_medications",
            "observations",
            "notes",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "patient_name",
            "recorded_by_name",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):
        patient = data.get(
            "patient",
            getattr(self.instance, "patient", None)
        )

        recorded_by = data.get(
            "recorded_by",
            getattr(self.instance, "recorded_by", None)
        )

        if patient and patient.role != "PATIENT":
            raise serializers.ValidationError({
                "patient": "Selected user is not a patient."
            })

        if recorded_by and recorded_by.role != "VAIDYA":
            raise serializers.ValidationError({
                "recorded_by": "Medical records can only be recorded by a Vaidya."
            })

        return data

    