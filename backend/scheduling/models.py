from django.conf import settings
from django.db import models


class Room(models.Model):
    name = models.CharField(max_length=100)
    room_number = models.CharField(
        max_length=20,
        unique=True
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.room_number})"


class TherapySession(models.Model):

    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Scheduled"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"
        NO_SHOW = "NO_SHOW", "No Show"

    patient_therapy = models.ForeignKey(
    "therapies.PatientTherapy",
    on_delete=models.PROTECT,
    related_name="therapy_sessions"
)

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="therapy_sessions"
    )

    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="assigned_sessions"
    )

    room = models.ForeignKey(
        Room,
        on_delete=models.PROTECT,
        related_name="sessions"
    )

    session_date = models.DateField()

    start_time = models.TimeField()

    end_time = models.TimeField()

    session_number = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED
    )

    therapist_notes = models.TextField(
        blank=True
    )

    patient_notes = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            "session_date",
            "start_time"
        ]

    def __str__(self):
        return (
            f"{self.patient.username} - "
            f"Session {self.session_number}"
        )