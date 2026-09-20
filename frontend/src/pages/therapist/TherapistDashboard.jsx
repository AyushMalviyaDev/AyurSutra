import DashboardLayout from "../../components/layout/DashboardLayout";

const TherapistDashboard = () => {
  return (
    <DashboardLayout>
      <div className="page-header">
        <p className="eyebrow">THERAPIST</p>
        <h1>Therapist Dashboard</h1>
        <p>Manage your therapy sessions and schedule.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Today's Sessions</span>
          <strong>6</strong>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <strong>3</strong>
        </div>

        <div className="stat-card">
          <span>Upcoming</span>
          <strong>3</strong>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TherapistDashboard;