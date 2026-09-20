from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    RoomViewSet,
    TherapistAvailabilityViewSet,
    RoomAvailabilityViewSet,
    PatientAvailabilityViewSet,
    TherapySessionViewSet,
    FindAvailableSlotsView,
    BookSessionView,
)

router = DefaultRouter()


path(
    "book-session/",
    BookSessionView.as_view(),
    name="book-session",
),

path(
    "find-slots/",
    FindAvailableSlotsView.as_view(),
    name="find-available-slots",
),

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