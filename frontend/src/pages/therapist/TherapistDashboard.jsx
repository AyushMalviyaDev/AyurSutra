import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  DoorOpen,
  User,
  Plus,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getSessions } from "../../services/schedulingService";

const TherapistDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTherapistData = async () => {
      try {
        const data = await getSessions();
        const sList = Array.isArray(data) ? data : data?.results || [];
        setSessions(sList);
      } catch (err) {
        console.error("Failed to load therapist sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapistData();
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const todaySessions = sessions.filter((s) => s.session_date === todayStr);
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");
  const upcomingSessions = sessions.filter(
    (s) => s.status === "SCHEDULED" || s.status === "IN_PROGRESS"
  );

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
            <Activity size={13} />
            <span>THERAPIST CLINICAL SUITE</span>
          </div>
          <h1>Therapist Workspace</h1>
          <p>Administer scheduled Panchakarma procedures, record patient responses, and log therapy progress.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/therapist/schedule" className="btn btn-secondary">
            <CalendarCheck size={16} /> Today's Schedule
          </Link>
          <Link to="/therapist/progress" className="btn btn-primary">
            <Plus size={16} /> Log Progress
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper mint">
            <CalendarCheck size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Today's Sessions</span>
            <strong className="stat-value">{todaySessions.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper gold">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Completed</span>
            <strong className="stat-value">{completedSessions.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper cyan">
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Upcoming</span>
            <strong className="stat-value">{upcomingSessions.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper terracotta">
            <Activity size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Assigned</span>
            <strong className="stat-value">{sessions.length}</strong>
          </div>
        </div>
      </div>

      {/* Today's Schedule Feed */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <CalendarCheck size={18} style={{ color: "var(--mint-accent)" }} />
              Today's Therapy Roster ({todaySessions.length})
            </h3>
            <p className="card-subtitle">Active treatments scheduled for administration today</p>
          </div>

          <Link to="/therapist/schedule" className="btn btn-secondary btn-sm">
            <span>Manage All Sessions</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="empty-state">
            <Clock size={36} className="empty-state-icon" />
            <h4>Loading Today's Sessions...</h4>
          </div>
        ) : todaySessions.length === 0 ? (
          <div className="empty-state">
            <CalendarCheck size={40} className="empty-state-icon" />
            <h4>No Sessions Scheduled for Today</h4>
            <p>You have no Panchakarma treatments assigned for today's shift.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {todaySessions.map((session) => (
              <div
                key={session.id}
                style={{
                  padding: "16px 20px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span className={`status-badge ${session.status?.toLowerCase()}`}>
                      {session.status}
                    </span>
                    <span style={{ fontSize: "0.82rem", color: "var(--gold-light)", fontWeight: 600 }}>
                      ⏰ {session.start_time?.slice(0, 5)} - {session.end_time?.slice(0, 5)}
                    </span>
                  </div>

                  <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--text-heading)", marginBottom: "4px" }}>
                    {session.therapy_name}
                  </h4>

                  <div style={{ display: "flex", gap: "16px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <User size={13} style={{ color: "var(--gold-primary)" }} />
                      Patient: {session.patient_name || `Patient #${session.patient}`}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <DoorOpen size={13} style={{ color: "var(--cyan-accent)" }} />
                      Room: {session.room_name}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <Link to="/therapist/progress" className="btn btn-primary btn-sm">
                    Log Progress
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TherapistDashboard;