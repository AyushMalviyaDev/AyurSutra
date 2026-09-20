from django.urls import path

from .views import MyPatientProfileView


urlpatterns = [
    path(
        "me/",
        MyPatientProfileView.as_view(),
        name="my-patient-profile"
    ),
]