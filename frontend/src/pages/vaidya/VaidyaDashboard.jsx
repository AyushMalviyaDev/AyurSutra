import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  Users,
  Sparkles,
  Activity,
  ArrowRight,
  Plus,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getPatientTherapies } from "../../services/therapyService";
import { getConsultations } from "../../services/patientService";
import { getUsers } from "../../services/authService";

const VaidyaDashboard = () => {
  const [stats, setStats] = useState({
    patients: 0,
    treatments: 0,
    consultations: 0,
    activeTreatments: 0,
  });
  const [recentTreatments, setRecentTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVaidyaData = async () => {
      try {
        const [patientsRes, treatmentsRes, consultRes] = await Promise.all([
          getUsers("PATIENT").catch(() => []),
          getPatientTherapies().catch(() => []),
          getConsultations().catch(() => []),
        ]);

        const patients = Array.isArray(patientsRes) ? patientsRes : patientsRes?.results || [];
        const treatments = Array.isArray(treatmentsRes) ? treatmentsRes : treatmentsRes?.results || [];
        const consultations = Array.isArray(consultRes) ? consultRes : consultRes?.results || [];

        const activeCount = treatments.filter(
          (t) => t.status === "PLANNED" || t.status === "SCHEDULED" || t.status === "IN_PROGRESS"
        ).length;

        setStats({
          patients: patients.length,
          treatments: treatments.length,
          consultations: consultations.length,
          activeTreatments: activeCount,
        });

        setRecentTreatments(treatments.slice(0, 6));
      } catch (err) {
        console.error("Failed to load Vaidya dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadVaidyaData();
  }, []);

  return (
    <DashboardLayout>
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div className="page-eyebrow">
            <Stethoscope size={13} />
            <span>AYURVEDIC PHYSICIAN (VAIDYA)</span>
          </div>
          <h1>Clinical Practice Center</h1>
          <p>Prescribe classical Panchakarma regimens, record pulse (Nadi) diagnostics, and monitor patient outcomes.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/vaidya/consultations" className="btn btn-secondary">
            <Stethoscope size={16} /> Consultations
          </Link>
          <Link to="/vaidya/treatments" className="btn btn-primary">
            <Plus size={16} /> Prescribe Regimen
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper gold">
            <Users size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Patients</span>
            <strong className="stat-value">{stats.patients}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper mint">
            <Activity size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Regimens</span>
            <strong className="stat-value">{stats.activeTreatments}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper terracotta">
            <Sparkles size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Prescriptions</span>
            <strong className="stat-value">{stats.treatments}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper cyan">
            <Stethoscope size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Consultations Logged</span>
            <strong className="stat-value">{stats.consultations}</strong>
          </div>
        </div>
      </div>

      {/* Active Treatment Plans Feed */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Sparkles size={18} style={{ color: "var(--gold-primary)" }} />
              Recent Patient Prescriptions
            </h3>
            <p className="card-subtitle">Active Panchakarma protocols prescribed to patients</p>
          </div>

          <Link to="/vaidya/treatments" className="btn btn-secondary btn-sm">
            <span>Manage All Prescriptions</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="empty-state">
            <Sparkles size={36} className="empty-state-icon" />
            <h4>Loading Prescriptions...</h4>
          </div>
        ) : recentTreatments.length === 0 ? (
          <div className="empty-state">
            <Sparkles size={40} className="empty-state-icon" />
            <h4>No Treatment Plans Prescribed Yet</h4>
            <p>Start by prescribing a Panchakarma regimen for an active patient.</p>
            <Link to="/vaidya/treatments" className="btn btn-primary btn-sm" style={{ marginTop: "14px" }}>
              <Plus size={15} /> Prescribe Regimen
            </Link>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Therapy Protocol</th>
                  <th>Sessions Prescribed</th>
                  <th>Clinical Status</th>
                  <th>Clinical Instructions</th>
                </tr>
              </thead>
              <tbody>
                {recentTreatments.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600, color: "var(--text-heading)" }}>
                      {t.patient_name || `Patient #${t.patient}`}
                    </td>
                    <td>{t.therapy_name || "Panchakarma Protocol"}</td>
                    <td>
                      <span style={{ color: "var(--gold-light)", fontWeight: 600 }}>
                        {t.completed_sessions || 0} / {t.sessions} Done
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${t.status?.toLowerCase()}`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      {t.notes || "Standard clinical protocol"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VaidyaDashboard;