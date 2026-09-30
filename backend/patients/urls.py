from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    MyPatientProfileView,
    MedicalRecordViewSet,
    PatientAssessmentViewSet,
)

router = DefaultRouter()

router.register(
    "medical-records",
    MedicalRecordViewSet,
    basename="medical-record"
)

router.register(
    "assessments",
    PatientAssessmentViewSet,
    basename="patient-assessment"
)



urlpatterns = [
    path("", include(router.urls)),
    path(
        "me/",
        MyPatientProfileView.as_view(),
        name="my-patient-profile"
    ),
]