import datetime
from django.core.management.base import BaseCommand
from accounts.models import User
from patients.models import PatientProfile, PatientAssessment, Consultation
from therapies.models import Therapy, PatientTherapy
from scheduling.models import (
    Room,
    RoomAvailability,
    TherapistAvailability,
    PatientAvailability,
    TherapySession,
    TherapyProgress,
)

class Command(BaseCommand):
    help = "Seeds comprehensive demo data for AyurSutra evaluation and panel defense."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("--- Seeding AyurSutra Demo Environment ---"))

        # 1. Users
        users_data = [
            ("admin1", "admin@ayursutra.com", User.Role.ADMIN, "12345678", "Ayush", "Administrator"),
            ("vaidya1", "vaidya@ayursutra.com", User.Role.VAIDYA, "12345678", "Dr. Shankarananda", "Vaidya"),
            ("therapist1", "therapist@ayursutra.com", User.Role.THERAPIST, "12345678", "Rajesh", "Sharma"),
            ("ayush", "ayush@example.com", User.Role.PATIENT, "12345678", "Ayush", "Malviya"),
        ]

        users = {}
        for username, email, role, password, first_name, last_name in users_data:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "role": role,
                    "first_name": first_name,
                    "last_name": last_name,
                    "is_active": True,
                },
            )
            user.set_password(password)
            user.role = role
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.save()
            users[username] = user
            status_str = "Created" if created else "Updated"
            self.stdout.write(f"  [User] {status_str}: {username} ({role}) with password '{password}'")

        patient = users["ayush"]
        vaidya = users["vaidya1"]
        therapist = users["therapist1"]

        # 2. Patient Profile
        profile, _ = PatientProfile.objects.get_or_create(
            user=patient,
            defaults={
                "date_of_birth": datetime.date(2002, 8, 14),
                "gender": "Male",
                "phone": "+91 98765 43210",
                "address": "108 Wellness Enclave, Sector 4, Bangalore",
                "prakriti": "Vata-Pitta",
                "vikriti": "Vata Aggravation",
                "medical_history": "Chronic lumbar stiffness (Kati Graha) and mental fatigue.",
                "allergies": "No known medicinal herb allergies.",
                "emergency_contact_name": "Ramesh Malviya",
                "emergency_contact_phone": "+91 98765 11111",
            },
        )
        profile.prakriti = "Vata-Pitta"
        profile.vikriti = "Vata Aggravation"
        profile.save()
        self.stdout.write("  [Profile] Configured clinical profile for patient 'ayush'")

        # 3. Patient Assessment & Consultation
        assessment, _ = PatientAssessment.objects.get_or_create(
            patient=patient,
            assessed_by=vaidya,
            defaults={
                "prakriti": "Vata-Pitta",
                "vikriti": "Vata Aggravation",
                "weight_kg": 68.5,
                "blood_pressure": "120/80",
                "pulse_rate": 72,
                "symptoms": "Lower back pain, disturbed sleep cycle, dry skin.",
                "clinical_observations": "Nadi Pariksha indicates prominent Vata pulse. Stiffness localized at Kati and Shiro marma regions.",
                "assessment_notes": "Prescribed 7-day Abhyanga oleation therapy as Purvakarma preparation.",
            },
        )
        self.stdout.write("  [Clinical] Created Patient Assessment by Dr. Shankarananda")

        consultation, _ = Consultation.objects.get_or_create(
            patient=patient,
            vaidya=vaidya,
            defaults={
                "chief_complaint": "Persistent stiffness in lumbar spine and mental exhaustion.",
                "clinical_findings": "Vata dosha vitiation; unctuousness required prior to detoxification.",
                "diagnosis": "Kati Graha with Vata Imbalance",
                "treatment_advice": "Daily Abhyanga with Mahanarayana oil for 7 days followed by Swedana.",
                "physician_notes": "Purvakarma phase initiated. Patient instructed to follow warm water regimen.",
                "follow_up_date": datetime.date.today() + datetime.timedelta(days=14),
            },
        )
        self.stdout.write("  [Consultation] Created Vaidya Consultation record")

        # 4. Master Therapies
        therapies_specs = [
            (Therapy.TherapyType.ABHYANGA, "Full body medicated herbal oil therapeutic massage", 45),
            (Therapy.TherapyType.SWEDANA, "Herbal steam chamber sudation therapy", 30),
            (Therapy.TherapyType.SHIRODHARA, "Continuous rhythmic warm medicated oil stream on forehead", 60),
            (Therapy.TherapyType.VIRECHANA, "Therapeutic purgation elimination procedure", 60),
            (Therapy.TherapyType.BASTI, "Medicated herbal enema therapy for Vata disorders", 45),
            (Therapy.TherapyType.NASYA, "Nasal administration of medicated drops for upper body detox", 30),
        ]

        therapies_map = {}
        for name, desc, dur in therapies_specs:
            th, _ = Therapy.objects.get_or_create(
                name=name,
                defaults={"description": desc, "duration_minutes": dur, "is_active": True},
            )
            th.duration_minutes = dur
            th.save()
            therapies_map[name] = th
        self.stdout.write("  [Therapies] Verified 6 classical Panchakarma therapies")

        # 5. Patient Therapy Prescription (Abhyanga, 7 Sessions, Purvakarma)
        pt, created = PatientTherapy.objects.get_or_create(
            patient=patient,
            therapy=therapies_map[Therapy.TherapyType.ABHYANGA],
            prescribed_by=vaidya,
            defaults={
                "sessions": 7,
                "phase": PatientTherapy.Phase.PURVAKARMA,
                "status": PatientTherapy.Status.SCHEDULED,
                "physician_notes": "Administer with warm Mahanarayana Taila. Monitor discomfort rating closely.",
                "start_date": datetime.date.today(),
                "end_date": datetime.date.today() + datetime.timedelta(days=7),
            },
        )
        pt.sessions = 7
        pt.phase = PatientTherapy.Phase.PURVAKARMA
        pt.status = PatientTherapy.Status.SCHEDULED
        pt.save()
        self.stdout.write("  [Prescription] Prescribed 7-Session Abhyanga (Purvakarma) for 'ayush'")

        # 6. Therapy Rooms
        rooms_data = [
            ("Droni Chamber A (Kati Suite)", "R101"),
            ("Shirodhara & Steam Chamber B", "R102"),
            ("Specialized Basti Chamber C", "R103"),
        ]
        rooms = []
        for rname, rnum in rooms_data:
            r, _ = Room.objects.get_or_create(
                room_number=rnum,
                defaults={"name": rname, "is_active": True},
            )
            r.name = rname
            r.is_active = True
            r.save()
            rooms.append(r)
        self.stdout.write(f"  [Rooms] Configured {len(rooms)} specialized treatment chambers")

        # 7. Operating Availability Windows (Mon to Sun: 08:00 to 20:00)
        start_t = datetime.time(8, 0)
        end_t = datetime.time(20, 0)

        # Rooms Availability
        for room in rooms:
            for day in range(7):
                RoomAvailability.objects.update_or_create(
                    room=room,
                    day_of_week=day,
                    defaults={"start_time": start_t, "end_time": end_t, "is_available": True},
                )
        self.stdout.write("  [Availability] Set Room Availability (Mon-Sun 08:00 - 20:00) for all chambers")

        # Therapist Availability
        for day in range(7):
            TherapistAvailability.objects.update_or_create(
                therapist=therapist,
                day_of_week=day,
                defaults={"start_time": start_t, "end_time": end_t, "is_available": True},
            )
        self.stdout.write("  [Availability] Set Therapist Availability (Mon-Sun 08:00 - 20:00) for Rajesh")

        # Patient Availability
        for day in range(7):
            PatientAvailability.objects.update_or_create(
                patient=patient,
                day_of_week=day,
                defaults={"start_time": start_t, "end_time": end_t, "is_available": True},
            )
        self.stdout.write("  [Availability] Set Patient Availability (Mon-Sun 08:00 - 20:00) for Ayush")

        self.stdout.write(self.style.SUCCESS("[SUCCESS] AyurSutra Demo Environment Seeded Successfully!"))
        self.stdout.write(self.style.SUCCESS("Demo credentials: All passwords are '12345678'"))
