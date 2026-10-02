import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PatientHeader from "../../components/patient/PatientHeader";
import HealingItinerary from "../../components/patient/HealingItinerary";
import WaterTracker from "../../components/patient/WaterTracker";
import SelfAssessment from "../../components/patient/SelfAssessment";

import { getMySessions } from "../../services/patientService";

const PatientDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await getMySessions();

        setSessions(Array.isArray(data) ? data : (data?.results || []));
      } catch (error) {
        console.error("Failed to load sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const completedSessions = sessions.filter(
    (session) => session.status === "COMPLETED"
  ).length;

  const upcomingSessions = sessions.filter(
    (session) =>
      session.status === "SCHEDULED" ||
      session.status === "IN_PROGRESS"
  ).length;

  const progress =
    sessions.length > 0
      ? Math.round((completedSessions / sessions.length) * 100)
      : 0;

  return (
    <DashboardLayout>
      <PatientHeader />

      <div className="stats-grid">
        <div className="stat-card">
          <span>Therapy Progress</span>
          <strong>{loading ? "..." : `${progress}%`}</strong>
        </div>

        <div className="stat-card">
          <span>Completed Sessions</span>
          <strong>{loading ? "..." : completedSessions}</strong>
        </div>

        <div className="stat-card">
          <span>Upcoming Sessions</span>
          <strong>{loading ? "..." : upcomingSessions}</strong>
        </div>
      </div>

      <div className="dashboard-grid">
        <div>
          <HealingItinerary sessions={sessions} />
        </div>

        <div className="right-column">
          <WaterTracker />
          <SelfAssessment />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;