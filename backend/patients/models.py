from django.conf import settings
from django.db import models


class PatientProfile(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patient_profile"
    )

    date_of_birth = models.DateField(
        null=True,
        blank=True
    )

    gender = models.CharField(
        max_length=20,
        blank=True
    )

    phone = models.CharField(
        max_length=15,
        blank=True
    )

    address = models.TextField(
        blank=True
    )

    prakriti = models.CharField(
        max_length=50,
        blank=True
    )

    vikriti = models.CharField(
        max_length=50,
        blank=True
    )

    medical_history = models.TextField(
        blank=True
    )

    allergies = models.TextField(
        blank=True
    )

    emergency_contact_name = models.CharField(
        max_length=100,
        blank=True
    )

    emergency_contact_phone = models.CharField(
        max_length=15,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class MedicalRecord(models.Model):

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="medical_records"
    )

    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="recorded_medical_records"
    )

    diagnosis = models.TextField(blank=True)
    symptoms = models.TextField(blank=True)
    medical_history = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    current_medications = models.TextField(blank=True)
    observations = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.patient.username} - Medical Record"


class PatientAssessment(models.Model):

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assessments"
    )

    assessed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="patient_assessments"
    )

    prakriti = models.CharField(
        max_length=50,
        blank=True
    )

    vikriti = models.CharField(
        max_length=50,
        blank=True
    )

    weight_kg = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    blood_pressure = models.CharField(
        max_length=20,
        blank=True
    )

    pulse_rate = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    symptoms = models.TextField(
        blank=True
    )

    clinical_observations = models.TextField(
        blank=True
    )

    assessment_notes = models.TextField(
        blank=True
    )

    assessed_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-assessed_at"]

    def __str__(self):
        return f"{self.patient.username} - Assessment {self.id}"

class Consultation(models.Model):
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="consultations"
    )

    vaidya = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="conducted_consultations"
    )

    consultation_date = models.DateTimeField(auto_now_add=True)

    chief_complaint = models.TextField(blank=True)

    clinical_findings = models.TextField(blank=True)

    diagnosis = models.TextField(blank=True)

    treatment_advice = models.TextField(blank=True)

    physician_notes = models.TextField(blank=True)

    follow_up_date = models.DateField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-consultation_date"]

    def __str__(self):
        return (
            f"{self.patient.username} - "
            f"Consultation {self.id}"
        )