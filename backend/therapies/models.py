from django.db import models


class Therapy(models.Model):

    class TherapyType(models.TextChoices):
        ABHYANGA = "ABHYANGA", "Abhyanga"
        SWEDANA = "SWEDANA", "Swedana"
        VIRECHANA = "VIRECHANA", "Virechana"
        BASTI = "BASTI", "Basti"
        NASYA = "NASYA", "Nasya"
        SHIRODHARA = "SHIRODHARA", "Shirodhara"

    name = models.CharField(
        max_length=100,
        choices=TherapyType.choices,
        unique=True
    )

    description = models.TextField(
        blank=True
    )

    duration_minutes = models.PositiveIntegerField(
        default=30
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name

from django.conf import settings


class PatientTherapy(models.Model):

    class Status(models.TextChoices):
        PLANNED = "PLANNED", "Planned"
        SCHEDULED = "SCHEDULED", "Scheduled"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="therapies"
    )

    therapy = models.ForeignKey(
        Therapy,
        on_delete=models.PROTECT,
        related_name="patient_therapies"
    )

    prescribed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="prescribed_therapies"
    )

    sessions = models.PositiveIntegerField(
        default=1
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLANNED
    )

    physician_notes = models.TextField(
        blank=True
    )

    start_date = models.DateField(
        null=True,
        blank=True
    )

    end_date = models.DateField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.patient} - {self.therapy.name}"