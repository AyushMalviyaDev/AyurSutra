import DashboardLayout from "../../components/layout/DashboardLayout";

const VaidyaDashboard = () => {
  return (
    <DashboardLayout>
      <div className="page-header">
        <p className="eyebrow">VAIDYA</p>
        <h1>Vaidya Dashboard</h1>
        <p>Manage patients and treatment plans.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Patients</span>
          <strong>24</strong>
        </div>

        <div className="stat-card">
          <span>Today's Appointments</span>
          <strong>8</strong>
        </div>

        <div className="stat-card">
          <span>Active Treatments</span>
          <strong>17</strong>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VaidyaDashboard;