from rest_framework import serializers

from .models import PatientProfile


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