import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";

import PatientDashboard from "../pages/patient/PatientDashboard";
import VaidyaDashboard from "../pages/vaidya/VaidyaDashboard";
import TherapistDashboard from "../pages/therapist/TherapistDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

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

      <Route path="/" element={<HomeRedirect />} />

      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={["PATIENT"]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vaidya"
        element={
          <ProtectedRoute allowedRoles={["VAIDYA"]}>
            <VaidyaDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/therapist"
        element={
          <ProtectedRoute allowedRoles={["THERAPIST"]}>
            <TherapistDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;