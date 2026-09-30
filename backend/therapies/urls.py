from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    TherapyViewSet,
    PatientTherapyViewSet,
)

router = DefaultRouter()

router.register(
    "therapies",
    TherapyViewSet,
    basename="therapy"
)

router.register(
    "patient-therapies",
    PatientTherapyViewSet,
    basename="patient-therapy"
)

urlpatterns = [
    path("", include(router.urls)),
]