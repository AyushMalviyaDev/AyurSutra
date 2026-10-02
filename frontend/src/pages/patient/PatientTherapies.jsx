import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, CalendarPlus, CheckCircle2, ArrowRight } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getPatientTherapies } from "../../services/therapyService";
import { getSessions } from "../../services/schedulingService";

const PatientTherapies = () => {
  const [therapies, setTherapies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [therapyRes, sessionRes] = await Promise.all([
          getPatientTherapies(),
          getSessions().catch(() => []),
        ]);

        const therapyList = Array.isArray(therapyRes)
          ? therapyRes
          : therapyRes?.results || [];
        const sessionList = Array.isArray(sessionRes)
          ? sessionRes
          : sessionRes?.results || [];

        setTherapies(therapyList);
        setSessions(sessionList);
      } catch (err) {
        console.error("Failed to load prescribed therapies:", err);
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
            <Sparkles size={13} />
            <span>PANCHAKARMA TREATMENT REGIMEN</span>
          </div>
          <h1>Prescribed Therapies</h1>
          <p>Holistic healing treatments customized for your constitution by your Vaidya.</p>
        </div>

        <Link to="/patient/schedule" className="btn btn-primary">
          <CalendarPlus size={16} />
          <span>Schedule Session</span>
        </Link>
      </div>

      {loading ? (
        <div className="empty-state">
          <Sparkles size={36} className="empty-state-icon" />
          <h4>Loading Treatment Plan...</h4>
        </div>
      ) : therapies.length === 0 ? (
        <div className="empty-state card">
          <Sparkles size={40} className="empty-state-icon" />
          <h4>No Prescribed Therapies Yet</h4>
          <p>
            You do not currently have any active Panchakarma therapies prescribed. Book a clinical consultation with your Vaidya.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" }}>
          {therapies.map((pt) => {
            const completedCount = sessions.filter(
              (s) => s.patient_therapy === pt.id && s.status === "COMPLETED"
            ).length;
            const total = pt.sessions || 1;
            const remaining = Math.max(0, total - completedCount);
            const progressPercent = Math.min(100, Math.round((completedCount / total) * 100));

            return (
              <div
                key={pt.id}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "18px",
                  marginBottom: 0,
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--gold-primary)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                      }}
                    >
                      CLINICAL PROTOCOL
                    </span>

                    <span className={`status-badge ${pt.status?.toLowerCase()}`}>
                      {pt.status}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.35rem",
                      color: "var(--text-heading)",
                      marginBottom: "8px",
                    }}
                  >
                    {pt.therapy_name || "Panchakarma Treatment"}
                  </h3>

                  {pt.notes && (
                    <p
                      style={{
                        fontSize: "0.86rem",
                        color: "var(--text-muted)",
                        marginBottom: "14px",
                        lineHeight: 1.5,
                      }}
                    >
                      {pt.notes}
                    </p>
                  )}

                  <div className="progress-track" style={{ height: "10px" }}>
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.82rem",
                      marginTop: "6px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span>
                      <CheckCircle2 size={13} style={{ display: "inline", verticalAlign: "middle", color: "var(--mint-accent)" }} />{" "}
                      {completedCount} Completed
                    </span>
                    <span>{remaining} Remaining of {total}</span>
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: "14px",
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "var(--text-body)" }}>
                    Progress: <strong style={{ color: "var(--gold-light)" }}>{progressPercent}%</strong>
                  </span>

                  <Link to="/patient/schedule" className="btn btn-primary btn-sm">
                    <span>Book Session</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientTherapies;
