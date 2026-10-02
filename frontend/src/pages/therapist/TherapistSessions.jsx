import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, DoorOpen, User, Plus } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getSessions } from "../../services/schedulingService";

const STATUS_FILTERS = [
  { key: "", label: "All Sessions" },
  { key: "SCHEDULED", label: "Scheduled" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

const TherapistSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const loadSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const filteredSessions = sessions.filter((s) => {
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });

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
            <span>SESSION ARCHIVE & LOGS</span>
          </div>
          <h1>Therapist Session History</h1>
          <p>Review completed and scheduled therapy sessions administered across all suites.</p>
        </div>

        <Link to="/therapist/progress" className="btn btn-primary">
          <Plus size={16} />
          <span>Record Progress</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="tab-nav">
        {STATUS_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`tab-btn ${statusFilter === key ? "active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sessions Table Card */}
      <div className="card">
        {loading ? (
          <div className="empty-state">
            <Clock size={36} className="empty-state-icon" />
            <h4>Loading Sessions Archive...</h4>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="empty-state">
            <Calendar size={40} className="empty-state-icon" />
            <h4>No Sessions Found</h4>
            <p>No records matched the selected status filter.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Patient</th>
                  <th>Therapy Protocol</th>
                  <th>Room</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: "var(--gold-light)" }}>
                      #{s.session_number || 1}
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--text-heading)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <User size={13} style={{ color: "var(--gold-primary)" }} />
                        <span>{s.patient_name || `Patient #${s.patient}`}</span>
                      </div>
                    </td>
                    <td>{s.therapy_name}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <DoorOpen size={13} style={{ color: "var(--cyan-accent)" }} />
                        <span>{s.room_name}</span>
                      </div>
                    </td>
                    <td>
                      <div>{s.session_date}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--mint-accent)" }}>
                        {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${s.status?.toLowerCase()}`}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link to="/therapist/progress" className="btn btn-secondary btn-sm">
                        View / Log
                      </Link>
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

export default TherapistSessions;
