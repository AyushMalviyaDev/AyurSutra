import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Play,
  CheckCircle2,
  Clock,
  DoorOpen,
  User,
  Plus,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getSessions, updateSession } from "../../services/schedulingService";

const TherapistSchedule = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadSchedule = async () => {
    try {
      const data = await getSessions();
      setSessions(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Failed to load therapist schedule:", err);
      setMessage({ type: "error", text: "Failed to load schedule." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const handleUpdateStatus = async (sessionId, newStatus) => {
    setUpdatingId(sessionId);
    setMessage({ type: "", text: "" });

    try {
      await updateSession(sessionId, { status: newStatus });
      setMessage({ type: "success", text: `Session marked as ${newStatus}.` });
      await loadSchedule();
    } catch (err) {
      console.error("Failed to update session status:", err);
      setMessage({ type: "error", text: "Failed to update session status." });
    } finally {
      setUpdatingId(null);
    }
  };

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
            <CalendarCheck size={13} />
            <span>THERAPIST DUTY ROSTER</span>
          </div>
          <h1>Assigned Therapy Schedule</h1>
          <p>Scheduled appointments, patient arrival tracking, and in-progress session execution.</p>
        </div>

        <Link to="/therapist/progress" className="btn btn-primary">
          <Plus size={16} />
          <span>Record Progress</span>
        </Link>
      </div>

      {message.text && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "12px",
            marginBottom: "24px",
            background:
              message.type === "success"
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${
              message.type === "success" ? "var(--mint-accent)" : "#ef4444"
            }`,
            color: message.type === "success" ? "var(--mint-accent)" : "#fca5a5",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <Clock size={36} className="empty-state-icon" />
          <h4>Loading Assigned Schedule...</h4>
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty-state card">
          <CalendarCheck size={40} className="empty-state-icon" />
          <h4>No Sessions Assigned</h4>
          <p>No therapy sessions are currently assigned to your roster.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {sessions.map((s) => (
            <div
              key={s.id}
              className="card"
              style={{
                marginBottom: 0,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span className={`status-badge ${s.status?.toLowerCase()}`}>
                    {s.status}
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "var(--gold-light)", fontWeight: 600 }}>
                    Session #{s.session_number || 1}
                  </span>
                </div>

                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--text-heading)", marginBottom: "6px" }}>
                  {s.therapy_name}
                </h3>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "0.85rem", color: "var(--text-body)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <Clock size={14} style={{ color: "var(--gold-primary)" }} />
                    {s.session_date} ({s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)})
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <DoorOpen size={14} style={{ color: "var(--cyan-accent)" }} />
                    {s.room_name}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <User size={14} style={{ color: "var(--mint-accent)" }} />
                    Patient: {s.patient_name || `Patient #${s.patient}`}
                  </span>
                </div>

                {s.patient_notes && (
                  <p style={{ marginTop: "8px", fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                    Notes: "{s.patient_notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {s.status === "SCHEDULED" && (
                  <button
                    onClick={() => handleUpdateStatus(s.id, "IN_PROGRESS")}
                    disabled={updatingId === s.id}
                    className="btn btn-primary btn-sm"
                  >
                    <Play size={14} /> Start Session
                  </button>
                )}

                {s.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => handleUpdateStatus(s.id, "COMPLETED")}
                    disabled={updatingId === s.id}
                    className="btn btn-success btn-sm"
                  >
                    <CheckCircle2 size={14} /> Mark Completed
                  </button>
                )}

                <Link to={`/therapist/suite?sessionId=${s.id}`} className="btn btn-primary btn-sm">
                  <DoorOpen size={14} /> In-Suite Console
                </Link>

                <Link to="/therapist/progress" className="btn btn-secondary btn-sm">
                  Log Progress
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TherapistSchedule;
