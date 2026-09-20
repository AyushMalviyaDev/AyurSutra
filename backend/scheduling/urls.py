from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    RoomViewSet,
    TherapySessionViewSet,
)


router = DefaultRouter()

router.register(
    "rooms",
    RoomViewSet,
    basename="room"
)

router.register(
    "sessions",
    TherapySessionViewSet,
    basename="session"
)


urlpatterns = [
    path("", include(router.urls)),
]