from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    TherapyViewSet,
    PatientTherapyViewSet,
)


router = DefaultRouter()

router.register(
    "types",
    TherapyViewSet,
    basename="therapy"
)

router.register(
    "patient",
    PatientTherapyViewSet,
    basename="patient-therapy"
)


urlpatterns = [
    path("", include(router.urls)),
]