# 🌿 AyurSutra (आयुर्सूत्र)
### *Enterprise Clinical Management & Multi-Resource Conflict-Free Scheduling Platform for Panchakarma Healthcare Informatics*

> *"स्वस्थस्य स्वास्थ्य रक्षणं, आतुरस्य विकार प्रशमनं च"*  
> *(Preserving the health of the healthy and alleviating disorders of the afflicted — Charaka Samhita)*

---

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-6.1-092E20?style=flat&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-3.16-red?style=flat&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Security](https://img.shields.io/badge/Auth-SimpleJWT_RFC7519-green?style=flat&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Unit Tests](https://img.shields.io/badge/Tests-12%2F12_Passing-brightgreen?style=flat&logo=checkmarx&logoColor=white)]()

---

## 📌 Executive Overview

**AyurSutra** is an enterprise-grade clinical management and multi-resource conflict-free scheduling platform designed specifically for Panchakarma hospitals and traditional Ayurvedic wellness centers. 

While modern allopathic healthcare has achieved extensive digitization, classical Ayurvedic centers are frequently weighed down by manual registers, whiteboard calendars, and room double-bookings. AyurSutra bridges this centuries-old clinical wisdom with modern, mathematically verifiable computer science.

### ❓ The Problem: Why Generic Healthcare Software Fails Panchakarma
Conventional outpatient software (e.g., Practo, OpenMRS, Google Calendar) is fundamentally designed around a **Single-Resource Assumption**:
$$\text{Conventional OPD Model} = 1 \text{ Doctor} \times 1 \text{ Chair} \times 10 \text{ Minutes}$$

Panchakarma therapies (*Abhyanga*, *Shirodhara*, *Swedana*, *Basti*, *Virechana*, *Nasya*) cannot operate under this model because:
1. **The Triple-Resource Dimension:** A single 45-to-90 minute procedure requires the **simultaneous alignment of three scarce resources**:
   - A specialized pre-conditioned chamber (e.g., wooden *Droni* bed, steam cabinet, or Shirodhara apparatus),
   - A qualified, gender-matched therapist, and
   - The patient.
2. **Sequential Multi-Day Protocols:** Treatments span 7 to 21 consecutive days divided into strict classical phases (*Purvakarma* $\rightarrow$ *Pradhanakarma* $\rightarrow$ *Paschatkarma*).
3. **Fragile Concurrency:** If managed manually, slight scheduling misalignments result in double-booked chambers, idle clinical staff, or interrupted medical procedures.

AyurSutra resolves this bottleneck algorithmically through **deterministic multi-resource set-intersection scheduling** and **atomic write-time concurrency validation**.

---

## 🏛️ System Architecture

AyurSutra utilizes a decoupled, high-performance **Three-Tier Architecture**:

```mermaid
graph TD
    subgraph Client Tier
        UI["React 19 SPA (Vite Bundler)"]
        Router["React Router DOM (Role Guards)"]
        Axios["Axios HTTP Client + Silent Token Refresh Interceptor"]
    end

    subgraph Security & Gateway
        CORS["django-cors-headers"]
        JWT["SimpleJWT (HMAC-SHA256 Token Pair)"]
    end

    subgraph Application Tier (Django REST Framework)
        Views["DRF ViewSets & APIViews"]
        Scheduler["Multi-Resource Scheduling Engine (scheduler.py)"]
        Serializers["ModelSerializers & Concurrency Validators"]
    end

    subgraph Persistence Tier
        ORM["Django ORM"]
        MySQL[("MySQL 8.0 InnoDB (ACID Compliant)")]
    end

    UI --> Router
    Router --> Axios
    Axios -- HTTP JSON / Bearer Token --> CORS
    CORS --> JWT
    JWT --> Views
    Views --> Scheduler
    Views --> Serializers
    Scheduler --> ORM
    Serializers --> ORM
    ORM --> MySQL
```

- **Frontend Tier:** React 19 Single Page Application bundled with Vite for ~250ms production builds and near-instant Hot Module Replacement (HMR).
- **Application & API Tier:** Stateless REST API powered by Django 6.1 and Django REST Framework 3.16. Provides strict queryset-level data isolation and transaction management.
- **Persistence Tier:** MySQL 8.0 with InnoDB engine enforcing strict ACID transactions, foreign key `PROTECT` cascades (preventing accidental deletion of rooms or therapists tied to historical medical sessions), and composite unique constraints.

---

## 🚀 Core Features & Innovations

### 1. ⚙️ Algorithmic Multi-Resource Scheduling Engine
- Implemented in `backend/scheduling/services/scheduler.py`.
- Evaluates candidate time slices across a quantized 30-minute interval grid.
- A time slot $\mathcal{S}$ is considered feasible if and only if it satisfies the set intersection:
  $$\mathcal{S}_{\text{available}} = \left( \mathcal{W}_{\text{room}} \cap \mathcal{W}_{\text{therapist}} \cap \mathcal{W}_{\text{patient}} \right) \setminus \mathcal{C}_{\text{existing}}$$
- Evaluates exact therapy duration: $t_{\text{end}} - t_{\text{start}} = \text{Therapy}.\text{duration\_minutes}$.

### 2. 🛡️ Write-Time Concurrency & Conflict Detection
- Solves the **Time-Of-Check to Time-Of-Use (TOCTOU)** race condition.
- When concurrent booking requests hit `POST /api/scheduling/book-session/`, `TherapySessionSerializer.validate()` executes an atomic interval collision query:
  $$\text{Collision} \iff (s.\text{start\_time} < \text{candidate}.\text{end\_time}) \land (s.\text{end\_time} > \text{candidate}.\text{start\_time})$$
- The first transaction commits; the second is immediately rejected with `HTTP 400 Bad Request`. Double-booking is mathematically prevented.
- **Session Quota Cap:** Strictly prevents patients from exceeding prescribed limits (e.g., booking session 8 of 7).

### 3. 🧘 Classical 3-Phase Panchakarma Protocol Governance
Embeds authentic Ayurvedic clinical sequence rules into the data model:
1. **Purvakarma (Preparatory):** Deepana, Pachana, Snehana (*Abhyanga*), and Swedana (*Herbal steam*).
2. **Pradhanakarma (Primary Purification):** *Vamana*, *Virechana*, *Basti*, *Nasya*, *Raktamokshana*.
3. **Paschatkarma (Restorative Rehabilitation):** *Samsarjana Krama* and *Rasayana*.

### 4. 🍵 Samsarjana Krama: Graduated Post-Detox Dietetic Stepper
Following intensive detoxification, digestive fire (*Agni*) is physiologically delicate. AyurSutra automatically activates a 4-stage nutritional stepper on the patient dashboard:
- **Stage 1: Peya** — Clear, warm rice water (Stimulates digestive enzymes).
- **Stage 2: Vilepi** — Semisolid thick rice gruel (Supplies gentle nourishment).
- **Stage 3: Yusha** — Light spiced green gram/lentil broth (Supplies bioavailable proteins).
- **Stage 4: Odana** — Soft-cooked medicinal rice (Restores normal dietary capacity).

### 5. 📱 Therapist In-Suite Tablet Console (`/therapist/suite`)
- **Clinical Ergonomics:** Designed for wall-mounted touch tablets inside therapy suites where staff work with medicated oils.
- High-contrast dark mode for relaxing, dim chamber lighting.
- Oversized 48px touch chips (*"Optimal Sweating Achieved"*, *"Stiffness Reduced"*, *"Oil Temp Tolerated"*).
- Live procedure countdown timer (e.g., `44:59... 44:58...`).
- 0-to-10 numeric patient discomfort dial with 1-tap atomic session completion.

### 6. 📜 Official Ayurvedic EHR & Printable Care Certificate
- Captures constitutional *Prakriti* (birth dosha), *Vikriti* (active imbalance), vitals, and *Nadi Pariksha* (pulse diagnosis).
- Dynamically generates a tailored **Pathya & Apathya Matrix** (Green wholesome foods/behaviors vs. Red unwholesome foods to avoid).
- Uses CSS `@media print` stylesheets to export an official, audit-ready clinical care certificate with institutional branding and NABH governance sign-off.

### 7. 🫀 Interactive Marma & Dosha Anatomical Visualizer
- Interactive SVG human silhouette mapping 107 vital energy intersections (*Marmas*).
- Clickable focus points (*Shiro*, *Greeva*, *Hridaya*, *Kati*, *Janu*, *Pada*) educating patients on how therapies like *Kati Basti* or *Shirodhara* address their specific physical complaints.

---

## 👥 Role-Based Access Control (RBAC)

AyurSutra enforces strict role segregation across four distinct user personas:

| Role | Permissions & Responsibilities | Key Portal Routes |
| :--- | :--- | :--- |
| 🩺 **Vaidya (Doctor)** | Clinical intake, Nadi pulse diagnosis, Prakriti/Vikriti assessment, 3-phase therapy prescription | `/vaidya`, `/vaidya/patients`, `/vaidya/treatments`, `/vaidya/consultations` |
| 🧑 **Patient** | Profile management, Marma visualizer, conflict-free slot booking, therapy progress tracking, EHR certificate | `/patient`, `/patient/profile`, `/patient/schedule`, `/patient/sessions` |
| 💆 **Therapist** | Daily procedure agenda, In-Suite Chamber touch console, procedure countdown, discomfort scoring | `/therapist`, `/therapist/sessions`, `/therapist/suite`, `/therapist/progress` |
| ⚙️ **Administrator** | Facility infrastructure, room inventory CRUD, shift windows, system-wide master schedules | `/admin`, `/admin/rooms`, `/admin/availability`, `/admin/schedules`, `/admin/users` |

---

## 🗄️ Database Schema & Key Models

The database contains normalized relational models across 4 domain applications:

```text
accounts
  └── User (AbstractUser with Role: ADMIN, VAIDYA, THERAPIST, PATIENT)

patients
  ├── PatientProfile (OneToOne with User: DOB, Prakriti, Vikriti, Medical History)
  ├── MedicalRecord (ForeignKey User: Diagnosis, Symptoms, Medications)
  ├── PatientAssessment (ForeignKey User: BP, Pulse, Weight, Vitals)
  └── Consultation (ForeignKey User: Chief Complaints, Clinical Findings, Advice)

therapies
  ├── Therapy (Catalogue: Name, Duration Minutes, Active Status)
  └── PatientTherapy (Prescription: Phase, Sessions Quota, Prescribing Vaidya)

scheduling
  ├── Room (Name, Room Number, Active Flag)
  ├── RoomAvailability (Room, Day of Week, Start Time, End Time)
  ├── TherapistAvailability (Therapist User, Day of Week, Start Time, End Time)
  ├── PatientAvailability (Patient User, Day of Week, Start Time, End Time)
  ├── TherapySession (PatientTherapy, Room, Therapist, Date, Start/End Time, Status)
  └── TherapyProgress (OneToOne Session: Discomfort Level 0-10, Notes, Completed Flag)
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React 19, Vite 8.3, React Router DOM v7, Tailwind CSS / Custom CSS |
| **UI Components & Icons** | Lucide React, SVG Anatomical Vector Maps |
| **HTTP Client** | Axios (with Request & Response Interceptors for silent JWT refresh) |
| **Backend Framework** | Python 3.12, Django 6.1, Django REST Framework 3.16 |
| **Authentication** | `djangorestframework-simplejwt` (RFC 7519 HMAC-SHA256 Token Pairs) |
| **CORS Middleware** | `django-cors-headers` |
| **Relational Database** | MySQL 8.0 with InnoDB Storage Engine |
| **Testing** | Django `APITestCase`, Python `unittest`, ESLint |

---

## ⚡ Quickstart & Installation Guide

### Prerequisites
- **Python:** 3.11 or 3.12 installed
- **Node.js:** v18.0+ or v20.0+ installed
- **MySQL Server:** 8.0+ running locally on port 3306

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/AyushMalviyaDev/AyurSutra.git
cd AyurSutra
```

---

### Step 2: Backend Setup (Django + MySQL)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure MySQL Database:**
   Ensure MySQL is running and create the database:
   ```sql
   CREATE DATABASE ayursutra CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   *(Verify username and password in `backend/config/settings.py` under `DATABASES`)*.

5. **Apply Database Migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Seed Demo Data:**
   Populate test users, treatment rooms, operational shifts, and sample prescriptions with one command:
   ```bash
   python manage.py seed_demo
   ```

7. **Run the Backend Server:**
   ```bash
   python manage.py runserver
   ```
   *The backend will be live at `http://127.0.0.1:8000/`*

---

### Step 3: Frontend Setup (React + Vite)

1. **Open a new terminal window and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node modules:**
   ```bash
   npm install
   ```

3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   *The frontend will be live at `http://localhost:5173/`*

---

## 🔑 Pre-Seeded Demo Credentials

All seeded accounts share the default development password: **`12345678`**

| Persona / Role | Username | Password | Email | Full Name |
| :--- | :--- | :---: | :--- | :--- |
| 🧑 **Patient** | `ayush` | `12345678` | `ayush@example.com` | Ayush Malviya |
| 🩺 **Vaidya (Doctor)** | `vaidya1` | `12345678` | `vaidya@ayursutra.com` | Dr. Shankarananda |
| 💆 **Therapist** | `therapist1` | `12345678` | `therapist@ayursutra.com` | Rajesh Sharma |
| ⚙️ **Administrator** | `admin1` | `12345678` | `admin@ayursutra.com` | Ayush Administrator |

---

## 🧪 Verification & Automated Testing

AyurSutra includes a comprehensive automated test suite verifying role-based access control, serializer validation constraints, session bounds, and progress logging.

### Run Backend Unit Tests:
```bash
cd backend
python manage.py test
```
**Benchmark Result:** `Ran 12 tests in 20.124s — OK (12/12 passing)`

### Run Frontend Linter & Production Build:
```bash
cd frontend
npm run lint    # 0 Errors, 0 Warnings
npm run build   # Production bundle compiled in ~1.35s
```

---

## 📡 Key REST API Endpoints

| Method | Endpoint | Description | Role Access |
| :---: | :--- | :--- | :---: |
| `POST` | `/api/auth/register/` | Register a new patient account | Public |
| `POST` | `/api/auth/login/` | Authenticate and obtain JWT token pair | Public |
| `POST` | `/api/auth/token/refresh/` | Renew expired access token | Public (Valid Refresh Token) |
| `GET` | `/api/auth/me/` | Fetch current logged-in user profile | Authenticated |
| `GET` | `/api/scheduling/find-slots/` | Compute conflict-free scheduling slots | Authenticated |
| `POST` | `/api/scheduling/book-session/` | Validate constraints and book therapy session | Authenticated |
| `GET` | `/api/scheduling/sessions/` | Query therapy sessions (scoped by role) | Scoped (Patient/Therapist/Vaidya/Admin) |
| `POST` | `/api/scheduling/progress/` | Commit chamber observations and discomfort rating | Therapists, Vaidyas, Admins |
| `GET/POST`| `/api/scheduling/rooms/` | Facility therapy chamber management | Admins (Read: All Authenticated) |
| `GET/POST`| `/api/therapies/prescriptions/`| Prescribe multi-session treatment plans | Vaidyas, Admins |

---

## 🗺️ Future Roadmap

- [ ] **ABDM & FHIR Integration:** Implement Ayushman Bharat Digital Mission (ABDM) standards and FHIR healthcare schemas for universal ABHA Health IDs.
- [ ] **Automated Reminders:** WhatsApp and SMS notification webhooks (via Twilio/Gupshup) for pre-procedure precautions and 24h reminders.
- [ ] **WebRTC Tele-Consultations:** Real-time encrypted video calling for remote initial Vaidya consultations.
- [ ] **Payment Gateways:** Integrated deposit and session payment workflows via Razorpay / Stripe.
- [ ] **Multi-Facility Federation:** Multi-tenant architecture for nationwide Ayurvedic hospital networks.

---

## 👨‍💻 Author & Project Credits

**Ayush Malviya**  
*Department of Computer Science & Engineering*  
- **GitHub:** [@AyushMalviyaDev](https://github.com/AyushMalviyaDev)  
- **Project:** AyurSutra B.Tech Capstone Project / Healthcare Informatics  

---

## 📄 License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
