import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";

// Patient Pages
import PatientDashboard from "../pages/patient/PatientDashboard";
import PatientProfile from "../pages/patient/PatientProfile";
import PatientTherapies from "../pages/patient/PatientTherapies";
import PatientSchedule from "../pages/patient/PatientSchedule";
import PatientSessions from "../pages/patient/PatientSessions";

// Vaidya Pages
import VaidyaDashboard from "../pages/vaidya/VaidyaDashboard";
import VaidyaPatients from "../pages/vaidya/VaidyaPatients";
import VaidyaTreatments from "../pages/vaidya/VaidyaTreatments";
import VaidyaConsultations from "../pages/vaidya/VaidyaConsultations";

// Therapist Pages
import TherapistDashboard from "../pages/therapist/TherapistDashboard";
import TherapistSchedule from "../pages/therapist/TherapistSchedule";
import TherapistSessions from "../pages/therapist/TherapistSessions";
import TherapistProgress from "../pages/therapist/TherapistProgress";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminRooms from "../pages/admin/AdminRooms";
import AdminAvailability from "../pages/admin/AdminAvailability";
import AdminSchedules from "../pages/admin/AdminSchedules";
import AdminUsers from "../pages/admin/AdminUsers";

import ProtectedRoute from "./ProtectedRoute";
import useAuth from "../hooks/useAuth";

const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "PATIENT":
      return <Navigate to="/patient" replace />;

    case "VAIDYA":
      return <Navigate to="/vaidya" replace />;

    case "THERAPIST":
      return <Navigate to="/therapist" replace />;

    case "ADMIN":
      return <Navigate to="/admin" replace />;

    default:
      return <Navigate to="/login" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<HomeRedirect />} />

      {/* Patient Routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={["PATIENT"]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute allowedRoles={["PATIENT"]}>
            <PatientProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/therapies"
        element={
          <ProtectedRoute allowedRoles={["PATIENT"]}>
            <PatientTherapies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/schedule"
        element={
          <ProtectedRoute allowedRoles={["PATIENT"]}>
            <PatientSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/sessions"
        element={
          <ProtectedRoute allowedRoles={["PATIENT"]}>
            <PatientSessions />
          </ProtectedRoute>
        }
      />

      {/* Vaidya Routes */}
      <Route
        path="/vaidya"
        element={
          <ProtectedRoute allowedRoles={["VAIDYA"]}>
            <VaidyaDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vaidya/patients"
        element={
          <ProtectedRoute allowedRoles={["VAIDYA"]}>
            <VaidyaPatients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vaidya/treatments"
        element={
          <ProtectedRoute allowedRoles={["VAIDYA"]}>
            <VaidyaTreatments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vaidya/consultations"
        element={
          <ProtectedRoute allowedRoles={["VAIDYA"]}>
            <VaidyaConsultations />
          </ProtectedRoute>
        }
      />

      {/* Therapist Routes */}
      <Route
        path="/therapist"
        element={
          <ProtectedRoute allowedRoles={["THERAPIST"]}>
            <TherapistDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapist/schedule"
        element={
          <ProtectedRoute allowedRoles={["THERAPIST"]}>
            <TherapistSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapist/sessions"
        element={
          <ProtectedRoute allowedRoles={["THERAPIST"]}>
            <TherapistSessions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapist/progress"
        element={
          <ProtectedRoute allowedRoles={["THERAPIST"]}>
            <TherapistProgress />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rooms"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminRooms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/availability"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminAvailability />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/schedules"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminSchedules />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;