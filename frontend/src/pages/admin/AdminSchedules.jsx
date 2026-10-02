import { useEffect, useState } from "react";
import {
  ClipboardList,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getSessions, updateSession, getRooms } from "../../services/schedulingService";
import { getUsers } from "../../services/authService";

const STATUS_OPTIONS = [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

const AdminSchedules = () => {
  const [sessions, setSessions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [therapistFilter, setTherapistFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadData = async () => {
    try {
      const [sessionsData, roomsData, therapistsData] = await Promise.all([
        getSessions(),
        getRooms().catch(() => []),
        getUsers("THERAPIST").catch(() => []),
      ]);

      setSessions(Array.isArray(sessionsData) ? sessionsData : sessionsData?.results || []);
      setRooms(Array.isArray(roomsData) ? roomsData : roomsData?.results || []);
      setTherapists(Array.isArray(therapistsData) ? therapistsData : therapistsData?.results || []);
    } catch (err) {
      console.error("Failed to load schedule board:", err);
      setMessage({ type: "error", text: "Failed to load master schedule." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (sessionId, newStatus) => {
    setUpdatingId(sessionId);
    setMessage({ type: "", text: "" });

    try {
      await updateSession(sessionId, { status: newStatus });
      setMessage({ type: "success", text: `Session updated to ${newStatus}.` });
      await loadData();
    } catch (err) {
      console.error("Failed to update session status:", err);
      setMessage({ type: "error", text: "Failed to update session status." });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearFilters = () => {
    setDateFilter("");
    setRoomFilter("");
    setTherapistFilter("");
    setStatusFilter("");
  };

  const filteredSessions = sessions.filter((s) => {
    if (dateFilter && s.session_date !== dateFilter) return false;
    if (roomFilter && String(s.room) !== String(roomFilter)) return false;
    if (therapistFilter && String(s.therapist) !== String(therapistFilter)) return false;
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
            <ClipboardList size={13} />
            <span>CENTRAL SCHEDULING BOARD</span>
          </div>
          <h1>Master Therapy Schedule</h1>
          <p>Real-time booking matrix across all suites, practitioners, and patient therapies.</p>
        </div>

        <button onClick={loadData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Board
        </button>
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

      {/* Filter Control Matrix */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--gold-primary)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={14} /> Filter Sessions ({filteredSessions.length} Matches)
          </span>

          {(dateFilter || roomFilter || therapistFilter || statusFilter) && (
            <button
              onClick={handleClearFilters}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--gold-primary)",
                fontSize: "0.82rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-control"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Treatment Suite</label>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="select-control"
            >
              <option value="">All Suites</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.room_number})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Therapist</label>
            <select
              value={therapistFilter}
              onChange={(e) => setTherapistFilter(e.target.value)}
              className="select-control"
            >
              <option value="">All Therapists</option>
              {therapists.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.first_name || th.last_name
                    ? `${th.first_name} ${th.last_name}`
                    : th.username}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-control"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Schedule Board Table */}
      <div className="card">
        {loading ? (
          <div className="empty-state">
            <Clock size={36} className="empty-state-icon" />
            <h4>Loading Master Board...</h4>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={40} className="empty-state-icon" />
            <h4>No Sessions Match Criteria</h4>
            <p>Try resetting the filter criteria above.</p>
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
                  <th>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => (
                  <tr key={session.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-heading)" }}>
                        {session.patient_name || `Patient #${session.patient}`}
                      </div>
                      {session.patient_notes && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          "{session.patient_notes}"
                        </div>
                      )}
                    </td>
                    <td>{session.therapy_name}</td>
                    <td>{session.therapist_name}</td>
                    <td>{session.room_name}</td>
                    <td>
                      <div>{session.session_date}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--mint-accent)" }}>
                        {session.start_time?.slice(0, 5)} - {session.end_time?.slice(0, 5)}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${session.status?.toLowerCase()}`}>
                        {session.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={session.status}
                        disabled={updatingId === session.id}
                        onChange={(e) => handleStatusChange(session.id, e.target.value)}
                        className="select-control"
                        style={{ padding: "6px 10px", fontSize: "0.82rem", width: "auto" }}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
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

export default AdminSchedules;
