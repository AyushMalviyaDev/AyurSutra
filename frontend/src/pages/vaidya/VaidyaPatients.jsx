import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Sparkles, Mail, User, Plus, FileText } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import AyurvedicEHRReport from "../../components/clinical/AyurvedicEHRReport";
import { getUsers } from "../../services/authService";
import { getPatientTherapies } from "../../services/therapyService";

const VaidyaPatients = () => {
  const [patients, setPatients] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEHRUser, setSelectedEHRUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ptsRes, thRes] = await Promise.all([
          getUsers("PATIENT"),
          getPatientTherapies().catch(() => []),
        ]);

        const ptList = Array.isArray(ptsRes) ? ptsRes : ptsRes?.results || [];
        const thList = Array.isArray(thRes) ? thRes : thRes?.results || [];

        setPatients(ptList);
        setTherapies(thList);
      } catch (err) {
        console.error("Failed to load patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
            <Users size={13} />
            <span>PATIENT ROSTER & CLINICAL CHARTS</span>
          </div>
          <h1>Clinical Patients</h1>
          <p>Review registered Panchakarma candidates, active therapies, and treatment plans.</p>
        </div>

        <Link to="/vaidya/treatments" className="btn btn-primary">
          <Plus size={16} />
          <span>Prescribe Treatment</span>
        </Link>
      </div>

      {loading ? (
        <div className="empty-state">
          <Users size={36} className="empty-state-icon" />
          <h4>Loading Patient Directory...</h4>
        </div>
      ) : patients.length === 0 ? (
        <div className="empty-state card">
          <User size={40} className="empty-state-icon" />
          <h4>No Registered Patients Found</h4>
          <p>When patients register, they will appear here for clinical assessment.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
          {patients.map((p) => {
            const patientPlans = therapies.filter((t) => t.patient === p.id);
            const initial = (p.username || "P").charAt(0).toUpperCase();
            const fullName =
              p.first_name || p.last_name
                ? `${p.first_name} ${p.last_name}`
                : p.username;

            return (
              <div
                key={p.id}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px",
                  marginBottom: 0,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "14px",
                        background: "rgba(212, 175, 55, 0.15)",
                        border: "1px solid rgba(212, 175, 55, 0.3)",
                        color: "var(--gold-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-serif)",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                      }}
                    >
                      {initial}
                    </div>

                    <div>
                      <h3 style={{ fontFamily: "var(--font-serif)", color: "var(--text-heading)", fontSize: "1.15rem" }}>
                        {fullName}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        <Mail size={12} />
                        <span>{p.email}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "var(--bg-input)",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold-primary)", fontWeight: 700, marginBottom: "6px" }}>
                      Active Prescribed Regimens ({patientPlans.length})
                    </div>

                    {patientPlans.length === 0 ? (
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        No therapy prescribed yet.
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {patientPlans.map((plan) => (
                          <div
                            key={plan.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "0.84rem",
                              color: "var(--text-body)",
                            }}
                          >
                            <span>• {plan.therapy_name}</span>
                            <span style={{ color: "var(--mint-accent)", fontWeight: 600 }}>
                              {plan.completed_sessions || 0}/{plan.sessions}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Patient #{p.id}
                  </span>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedEHRUser(p)}
                      className="btn btn-secondary btn-sm"
                    >
                      <FileText size={14} /> EHR Summary
                    </button>
                    <Link to="/vaidya/treatments" className="btn btn-primary btn-sm">
                      <Sparkles size={14} /> Prescribe
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AyurvedicEHRReport
        isOpen={!!selectedEHRUser}
        onClose={() => setSelectedEHRUser(null)}
        patientId={selectedEHRUser?.id}
        patientName={
          selectedEHRUser?.first_name
            ? `${selectedEHRUser.first_name} ${selectedEHRUser.last_name}`
            : selectedEHRUser?.username
        }
      />
    </DashboardLayout>
  );
};

export default VaidyaPatients;
