from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    RoomViewSet,
    TherapistAvailabilityViewSet,
    RoomAvailabilityViewSet,
    PatientAvailabilityViewSet,
    TherapySessionViewSet,
)


router = DefaultRouter()

router.register(
    "patient-availability",
    PatientAvailabilityViewSet,
    basename="patient-availability"
)

router.register(
    "room-availability",
    RoomAvailabilityViewSet,
    basename="room-availability"
)

router.register(
    "rooms",
    RoomViewSet,
    basename="room"
)

router.register(
    "availability",
    TherapistAvailabilityViewSet,
    basename="therapist-availability"
)

router.register(
    "sessions",
    TherapySessionViewSet,
    basename="session"
)

urlpatterns = [
    path("", include(router.urls)),
]