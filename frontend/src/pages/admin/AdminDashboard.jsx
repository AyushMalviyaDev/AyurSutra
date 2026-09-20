import DashboardLayout from "../../components/layout/DashboardLayout";

const AdminDashboard = () => {
  return (
    <DashboardLayout>
      <div className="page-header">
        <p className="eyebrow">ADMINISTRATION</p>
        <h1>Admin Dashboard</h1>
        <p>Manage the AyurSutra system.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Users</span>
          <strong>156</strong>
        </div>

        <div className="stat-card">
          <span>Vaidyas</span>
          <strong>12</strong>
        </div>

        <div className="stat-card">
          <span>Therapists</span>
          <strong>28</strong>
        </div>

        <div className="stat-card">
          <span>Active Patients</span>
          <strong>116</strong>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;