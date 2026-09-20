from datetime import datetime, date, time, timedelta

from scheduling.models import (
    Room,
    RoomAvailability,
    TherapistAvailability,
    TherapySession,
)


def time_to_minutes(value):
    """Convert a time object into minutes since midnight."""

    return value.hour * 60 + value.minute


def minutes_to_time(minutes):
    """Convert minutes since midnight back to a time object."""

    hours = minutes // 60
    mins = minutes % 60

    return time(hour=hours, minute=mins)


def is_patient_available(patient, session_date, start_time, end_time):
    """
    Check whether the patient is available for the complete session.
    """

    day_of_week = session_date.weekday()

    return patient.patient_availability.filter(
        day_of_week=day_of_week,
        start_time__lte=start_time,
        end_time__gte=end_time,
        is_available=True,
    ).exists()


def is_therapist_available(
    therapist,
    session_date,
    start_time,
    end_time,
):
    """
    Check whether the therapist is available for the complete session.
    """

    day_of_week = session_date.weekday()

    return TherapistAvailability.objects.filter(
        therapist=therapist,
        day_of_week=day_of_week,
        start_time__lte=start_time,
        end_time__gte=end_time,
        is_available=True,
    ).exists()


def is_room_available(
    room,
    session_date,
    start_time,
    end_time,
):
    """
    Check whether the room is available for the complete session.
    """

    day_of_week = session_date.weekday()

    return RoomAvailability.objects.filter(
        room=room,
        day_of_week=day_of_week,
        start_time__lte=start_time,
        end_time__gte=end_time,
        is_available=True,
    ).exists()


def has_conflict(
    patient,
    therapist,
    room,
    session_date,
    start_time,
    end_time,
):
    """
    Check whether patient, therapist, or room already
    has another active session during this time.
    """

    overlapping_sessions = TherapySession.objects.filter(
        session_date=session_date,
        start_time__lt=end_time,
        end_time__gt=start_time,
    ).exclude(
        status__in=[
            TherapySession.Status.CANCELLED,
            TherapySession.Status.NO_SHOW,
        ]
    )

    if overlapping_sessions.filter(patient=patient).exists():
        return True

    if overlapping_sessions.filter(therapist=therapist).exists():
        return True

    if overlapping_sessions.filter(room=room).exists():
        return True

    return False


def find_available_slots(
    patient,
    therapist,
    therapy,
    start_date,
    end_date,
    slot_interval=30,
):
    """
    Find all valid scheduling slots for a patient,
    therapist and therapy within a date range.

    slot_interval is the gap between candidate start times.
    """

    duration = therapy.duration_minutes

    rooms = Room.objects.filter(
        is_active=True
    )

    available_slots = []

    current_date = start_date

    while current_date <= end_date:

        for room in rooms:

            day_of_week = current_date.weekday()

            room_windows = RoomAvailability.objects.filter(
                room=room,
                day_of_week=day_of_week,
                is_available=True,
            )

            for room_window in room_windows:

                window_start = time_to_minutes(
                    room_window.start_time
                )

                window_end = time_to_minutes(
                    room_window.end_time
                )

                current_start = window_start

                while current_start + duration <= window_end:

                    start_time = minutes_to_time(
                        current_start
                    )

                    end_time = minutes_to_time(
                        current_start + duration
                    )

                    # Patient availability
                    if not is_patient_available(
                        patient,
                        current_date,
                        start_time,
                        end_time,
                    ):
                        current_start += slot_interval
                        continue

                    # Therapist availability
                    if not is_therapist_available(
                        therapist,
                        current_date,
                        start_time,
                        end_time,
                    ):
                        current_start += slot_interval
                        continue

                    # Existing session conflict
                    if has_conflict(
                        patient,
                        therapist,
                        room,
                        current_date,
                        start_time,
                        end_time,
                    ):
                        current_start += slot_interval
                        continue

                    available_slots.append(
                        {
                            "date": current_date,
                            "start_time": start_time,
                            "end_time": end_time,
                            "room": room,
                        }
                    )

                    current_start += slot_interval

        current_date += timedelta(days=1)

    return available_slots