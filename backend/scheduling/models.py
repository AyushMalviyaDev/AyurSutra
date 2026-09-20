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

class RoomAvailability(models.Model):

    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0, "Monday"
        TUESDAY = 1, "Tuesday"
        WEDNESDAY = 2, "Wednesday"
        THURSDAY = 3, "Thursday"
        FRIDAY = 4, "Friday"
        SATURDAY = 5, "Saturday"
        SUNDAY = 6, "Sunday"

    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name="availability"
    )

    day_of_week = models.IntegerField(
        choices=DayOfWeek.choices
    )

    start_time = models.TimeField()

    end_time = models.TimeField()

    is_available = models.BooleanField(
        default=True
    )

    class Meta:
        ordering = [
            "day_of_week",
            "start_time"
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "room",
                    "day_of_week",
                    "start_time",
                    "end_time"
                ],
                name="unique_room_availability"
            )
        ]

    def __str__(self):
        return (
            f"{self.room.room_number} - "
            f"{self.get_day_of_week_display()} "
            f"{self.start_time} - {self.end_time}"
        )
        

class TherapistAvailability(models.Model):

    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0, "Monday"
        TUESDAY = 1, "Tuesday"
        WEDNESDAY = 2, "Wednesday"
        THURSDAY = 3, "Thursday"
        FRIDAY = 4, "Friday"
        SATURDAY = 5, "Saturday"
        SUNDAY = 6, "Sunday"

    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="availability"
    )

    day_of_week = models.IntegerField(
        choices=DayOfWeek.choices
    )

    start_time = models.TimeField()

    end_time = models.TimeField()

    is_available = models.BooleanField(
        default=True
    )

    class Meta:
        ordering = [
            "day_of_week",
            "start_time"
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "therapist",
                    "day_of_week",
                    "start_time",
                    "end_time"
                ],
                name="unique_therapist_availability"
            )
        ]

    def __str__(self):
        return (
            f"{self.therapist.username} - "
            f"{self.get_day_of_week_display()} "
            f"{self.start_time} - {self.end_time}"
        )

    
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