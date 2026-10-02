import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  Calendar,
  DoorOpen,
  User,
  CalendarPlus,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getSessions, cancelSession } from "../../services/schedulingService";

const PatientSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [cancellingId, setCancellingId] = useState(null);
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });

  const loadSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setActionMessage({ type: "error", text: "Failed to load therapy sessions." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleCancel = async (sessionId) => {
    if (!window.confirm("Are you sure you want to cancel this scheduled session?")) {
      return;
    }

    setCancellingId(sessionId);
    setActionMessage({ type: "", text: "" });

    try {
      await cancelSession(sessionId);
      setActionMessage({ type: "success", text: "Session cancelled successfully." });
      await loadSessions();
    } catch (err) {
      console.error("Failed to cancel session:", err);
      setActionMessage({
        type: "error",
        text: err.response?.data?.detail || "Could not cancel session.",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (filter === "ALL") return true;
    if (filter === "UPCOMING") return s.status === "SCHEDULED" || s.status === "IN_PROGRESS";
    if (filter === "COMPLETED") return s.status === "COMPLETED";
    if (filter === "CANCELLED") return s.status === "CANCELLED" || s.status === "NO_SHOW";
    return true;
  });

  const upcomingCount = sessions.filter((s) => s.status === "SCHEDULED" || s.status === "IN_PROGRESS").length;
  const completedCount = sessions.filter((s) => s.status === "COMPLETED").length;
  const cancelledCount = sessions.filter((s) => s.status === "CANCELLED" || s.status === "NO_SHOW").length;

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
            <Clock size={13} />
            <span>APPOINTMENTS & SESSIONS</span>
          </div>
          <h1>My Therapy Schedule</h1>
          <p>Track your scheduled, in-progress, and completed Panchakarma sessions.</p>
        </div>

        <Link to="/patient/schedule" className="btn btn-primary">
          <CalendarPlus size={16} />
          <span>Schedule New Session</span>
        </Link>
      </div>

      {actionMessage.text && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "12px",
            marginBottom: "24px",
            background:
              actionMessage.type === "success"
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${
              actionMessage.type === "success" ? "var(--mint-accent)" : "#ef4444"
            }`,
            color: actionMessage.type === "success" ? "var(--mint-accent)" : "#fca5a5",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Tabs Filter Bar */}
      <div className="tab-nav">
        {[
          { key: "ALL", label: `All Sessions (${sessions.length})` },
          { key: "UPCOMING", label: `Upcoming (${upcomingCount})` },
          { key: "COMPLETED", label: `Completed (${completedCount})` },
          { key: "CANCELLED", label: `Cancelled (${cancelledCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`tab-btn ${filter === key ? "active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="empty-state">
          <Clock size={36} className="empty-state-icon" />
          <h4>Loading Sessions...</h4>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="empty-state card">
          <Clock size={40} className="empty-state-icon" />
          <h4>No Sessions Found</h4>
          <p>You have no appointments matching the selected filter.</p>
          <Link to="/patient/schedule" className="btn btn-primary btn-sm" style={{ marginTop: "14px" }}>
            <CalendarPlus size={15} /> Book a Slot
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="card"
              style={{
                marginBottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <span className={`status-badge ${session.status?.toLowerCase()}`}>
                    {session.status}
                  </span>

                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Session #{session.session_number || 1}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.25rem",
                    color: "var(--text-heading)",
                    marginBottom: "8px",
                  }}
                >
                  {session.therapy_name}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.85rem", color: "var(--text-body)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar size={14} style={{ color: "var(--gold-primary)" }} />
                    <span>{session.session_date}</span>
                    <span style={{ opacity: 0.4 }}>•</span>
                    <Clock size={14} style={{ color: "var(--cyan-accent)" }} />
                    <span>{session.start_time?.slice(0, 5)} - {session.end_time?.slice(0, 5)}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <DoorOpen size={14} style={{ color: "var(--mint-accent)" }} />
                    <span>Room: {session.room_name}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <User size={14} style={{ color: "var(--gold-light)" }} />
                    <span>Therapist: {session.therapist_name}</span>
                  </div>

                  {session.patient_notes && (
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "8px 12px",
                        background: "var(--bg-input)",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      "{session.patient_notes}"
                    </div>
                  )}
                </div>
              </div>

              {session.status === "SCHEDULED" && (
                <div style={{ paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => handleCancel(session.id)}
                    disabled={cancellingId === session.id}
                    className="btn btn-danger btn-sm"
                  >
                    <XCircle size={15} />
                    <span>{cancellingId === session.id ? "Cancelling..." : "Cancel Appointment"}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientSessions;
