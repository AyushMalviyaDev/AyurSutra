src/
│
├── assets/
│   ├── logo.svg
│   └── ...
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── DashboardLayout.jsx
│   │
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Modal.jsx
│   │   └── Select.jsx
│   │
│   └── patient/
│       ├── PatientHeader.jsx
│       ├── HealingItinerary.jsx
│       ├── TherapyCard.jsx
│       ├── WaterTracker.jsx
│       └── SelfAssessment.jsx
│
├── pages/
│   ├── Login.jsx
│   │
│   ├── patient/
│   │   └── PatientDashboard.jsx
│   │
│   ├── vaidya/
│   │   └── VaidyaDashboard.jsx
│   │
│   ├── therapist/
│   │   └── TherapistDashboard.jsx
│   │
│   └── admin/
│       └── AdminDashboard.jsx
│
├── routes/
│   ├── AppRoutes.jsx
│   └── ProtectedRoute.jsx
│
├── context/
│   └── AuthContext.jsx
│
├── services/
│   ├── api.js
│   ├── authService.js
│   └── patientService.js
│
├── hooks/
│   └── useAuth.js
│
├── data/
│   └── mockData.js
│
├── App.jsx
├── main.jsx
└── index.css