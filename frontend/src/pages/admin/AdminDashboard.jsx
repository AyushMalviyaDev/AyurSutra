import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  DoorOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Stethoscope,
  Activity,
  ArrowRight,
  ShieldCheck,
  CalendarClock,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getUsers } from "../../services/authService";
import { getRooms, getSessions } from "../../services/schedulingService";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    patients: 0,
    therapists: 0,
    vaidyas: 0,
    rooms: 0,
    todaySessions: 0,
    upcomingSessions: 0,
    completedSessions: 0,
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [patientsRes, therapistsRes, vaidyasRes, roomsRes, sessionsRes] =
          await Promise.all([
            getUsers("PATIENT").catch(() => []),
            getUsers("THERAPIST").catch(() => []),
            getUsers("VAIDYA").catch(() => []),
            getRooms().catch(() => []),
            getSessions().catch(() => []),
          ]);

        const patients = Array.isArray(patientsRes) ? patientsRes : patientsRes?.results || [];
        const therapists = Array.isArray(therapistsRes) ? therapistsRes : therapistsRes?.results || [];
        const vaidyas = Array.isArray(vaidyasRes) ? vaidyasRes : vaidyasRes?.results || [];
        const rooms = Array.isArray(roomsRes) ? roomsRes : roomsRes?.results || [];
        const sessions = Array.isArray(sessionsRes) ? sessionsRes : sessionsRes?.results || [];

        const todayStr = new Date().toISOString().split("T")[0];
        const todayCount = sessions.filter((s) => s.session_date === todayStr).length;
        const upcomingCount = sessions.filter(
          (s) => s.status === "SCHEDULED" || s.status === "IN_PROGRESS"
        ).length;
        const completedCount = sessions.filter((s) => s.status === "COMPLETED").length;

        setStats({
          patients: patients.length,
          therapists: therapists.length,
          vaidyas: vaidyas.length,
          rooms: rooms.length,
          todaySessions: todayCount,
          upcomingSessions: upcomingCount,
          completedSessions: completedCount,
        });

        setRecentSessions(sessions.slice(0, 6));
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
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
            <ShieldCheck size={13} />
            <span>OPERATIONS COMMAND CENTER</span>
          </div>
          <h1>Sanctuary Operations</h1>
          <p>Real-time facility utilization, staff scheduling, and Panchakarma care oversight.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/admin/rooms" className="btn btn-secondary btn-sm">
            <DoorOpen size={15} /> Manage Rooms
          </Link>
          <Link to="/admin/availability" className="btn btn-secondary btn-sm">
            <CalendarClock size={15} /> Staff Shifts
          </Link>
          <Link to="/admin/schedules" className="btn btn-primary btn-sm">
            <Calendar size={15} /> Master Board
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
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
            <span className="stat-label">Therapists</span>
            <strong className="stat-value">{stats.therapists}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper terracotta">
            <Stethoscope size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Vaidyas</span>
            <strong className="stat-value">{stats.vaidyas}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper cyan">
            <DoorOpen size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Treatment Rooms</span>
            <strong className="stat-value">{stats.rooms}</strong>
          </div>
        </div>
      </div>

      {/* Secondary Operations Grid */}
      <div className="stats-grid" style={{ marginBottom: "28px" }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper gold">
            <Calendar size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Today's Sessions</span>
            <strong className="stat-value">{stats.todaySessions}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper cyan">
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Upcoming / In Progress</span>
            <strong className="stat-value">{stats.upcomingSessions}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper mint">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Completed Sessions</span>
            <strong className="stat-value">{stats.completedSessions}</strong>
          </div>
        </div>
      </div>

      {/* Main Section: Master Schedule Radar */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Calendar size={18} style={{ color: "var(--gold-primary)" }} />
              Live Sanctuary Activity Feed
            </h3>
            <p className="card-subtitle">Real-time status of therapy sessions across all rooms</p>
          </div>

          <Link to="/admin/schedules" className="btn btn-secondary btn-sm">
            <span>Open Master Schedule</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="empty-state">
            <Clock size={36} className="empty-state-icon" />
            <h4>Loading Operations Stream...</h4>
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="empty-state">
            <Calendar size={36} className="empty-state-icon" />
            <h4>No Sessions on the Board</h4>
            <p>No therapy sessions are currently scheduled.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Therapy</th>
                  <th>Therapist</th>
                  <th>Room</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session) => (
                  <tr key={session.id}>
                    <td style={{ fontWeight: 600, color: "var(--text-heading)" }}>
                      {session.patient_name || `Patient #${session.patient}`}
                    </td>
                    <td>{session.therapy_name}</td>
                    <td>{session.therapist_name}</td>
                    <td>{session.room_name}</td>
                    <td>
                      {session.session_date} at {session.start_time?.slice(0, 5)}
                    </td>
                    <td>
                      <span className={`status-badge ${session.status?.toLowerCase()}`}>
                        {session.status}
                      </span>
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

export default AdminDashboard;