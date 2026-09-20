import DashboardLayout from "../../components/layout/DashboardLayout";
import PatientHeader from "../../components/patient/PatientHeader";
import HealingItinerary from "../../components/patient/HealingItinerary";
import WaterTracker from "../../components/patient/WaterTracker";
import SelfAssessment from "../../components/patient/SelfAssessment";

const PatientDashboard = () => {
  return (
    <DashboardLayout>
      <PatientHeader />

      <div className="stats-grid">
        <div className="stat-card">
          <span>Therapy Progress</span>
          <strong>65%</strong>
        </div>

        <div className="stat-card">
          <span>Completed Sessions</span>
          <strong>8</strong>
        </div>

        <div className="stat-card">
          <span>Upcoming Sessions</span>
          <strong>4</strong>
        </div>
      </div>

      <div className="dashboard-grid">
        <div>
          <HealingItinerary />
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