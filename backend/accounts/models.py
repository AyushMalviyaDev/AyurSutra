from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        VAIDYA = "VAIDYA", "Vaidya"
        THERAPIST = "THERAPIST", "Therapist"
        PATIENT = "PATIENT", "Patient"

    email = models.EmailField(unique=True)

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.PATIENT
    )

    def __str__(self):
        return f"{self.username} - {self.role}"