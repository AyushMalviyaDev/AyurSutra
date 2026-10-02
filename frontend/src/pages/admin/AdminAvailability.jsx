import { useEffect, useState, useCallback } from "react";
import {
  CalendarClock,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  X,
  User,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getTherapistAvailability,
  createTherapistAvailability,
  deleteTherapistAvailability,
} from "../../services/schedulingService";
import { getUsers } from "../../services/authService";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const AdminAvailability = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [newAvail, setNewAvail] = useState({
    therapist: "",
    day_of_week: "0",
    start_time: "09:00",
    end_time: "17:00",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  const loadData = useCallback(async () => {
    try {
      const [availRes, thRes] = await Promise.all([
        getTherapistAvailability(),
        getUsers("THERAPIST"),
      ]);

      const aList = Array.isArray(availRes) ? availRes : availRes?.results || [];
      const thList = Array.isArray(thRes) ? thRes : thRes?.results || [];

      setAvailabilities(aList);
      setTherapists(thList);
      if (thList.length > 0 && !newAvail.therapist) {
        setNewAvail((prev) => ({ ...prev, therapist: String(thList[0].id) }));
      }
    } catch (err) {
      console.error("Failed to load therapist availability:", err);
      setMessage({ type: "error", text: "Failed to load availability records." });
    } finally {
      setLoading(false);
    }
  }, [newAvail.therapist]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      await createTherapistAvailability({
        therapist: Number(newAvail.therapist),
        day_of_week: Number(newAvail.day_of_week),
        start_time: newAvail.start_time,
        end_time: newAvail.end_time,
        is_available: true,
      });

      setMessage({ type: "success", text: "Therapist shift availability created!" });
      setShowAdd(false);
      await loadData();
    } catch (err) {
      console.error("Failed to create availability:", err);
      const detail =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Failed to add shift.";
      setMessage({ type: "error", text: detail });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this therapist availability record?")) return;
    try {
      await deleteTherapistAvailability(id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete availability:", err);
      setMessage({ type: "error", text: "Failed to delete shift record." });
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
            <CalendarClock size={13} />
            <span>PRACTITIONER ROSTER</span>
          </div>
          <h1>Therapist Availability</h1>
          <p>Manage working shifts and available therapy days for clinical staff.</p>
        </div>

        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Shift Window</span>
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

      {/* Add Shift Modal */}
      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={20} style={{ color: "var(--gold-primary)" }} />
                Assign Therapist Shift Window
              </h3>
              <button onClick={() => setShowAdd(false)} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Therapist</label>
                <select
                  value={newAvail.therapist}
                  onChange={(e) => setNewAvail({ ...newAvail, therapist: e.target.value })}
                  className="select-control"
                  required
                >
                  {therapists.map((th) => (
                    <option key={th.id} value={th.id}>
                      {th.first_name || th.last_name
                        ? `${th.first_name} ${th.last_name} (${th.username})`
                        : th.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Day of Week</label>
                <select
                  value={newAvail.day_of_week}
                  onChange={(e) => setNewAvail({ ...newAvail, day_of_week: e.target.value })}
                  className="select-control"
                >
                  {DAYS.map((name, idx) => (
                    <option key={idx} value={idx}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Shift Start Time</label>
                  <input
                    type="time"
                    value={newAvail.start_time}
                    onChange={(e) => setNewAvail({ ...newAvail, start_time: e.target.value })}
                    className="input-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Shift End Time</label>
                  <input
                    type="time"
                    value={newAvail.end_time}
                    onChange={(e) => setNewAvail({ ...newAvail, end_time: e.target.value })}
                    className="input-control"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Availability Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <User size={18} style={{ color: "var(--gold-primary)" }} />
            Active Therapist Shift Roster ({availabilities.length})
          </h3>
        </div>

        {loading ? (
          <div className="empty-state">
            <Clock size={36} className="empty-state-icon" />
            <h4>Loading Roster...</h4>
          </div>
        ) : availabilities.length === 0 ? (
          <div className="empty-state">
            <CalendarClock size={40} className="empty-state-icon" />
            <h4>No Shift Schedules Configured</h4>
            <p>Assign therapist availability so the booking engine can find open slots.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Therapist</th>
                  <th>Day of Week</th>
                  <th>Shift Window</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {availabilities.map((avail) => {
                  const th = therapists.find((t) => t.id === avail.therapist);
                  const thName = th
                    ? th.first_name || th.last_name
                      ? `${th.first_name} ${th.last_name}`
                      : th.username
                    : `Therapist #${avail.therapist}`;

                  return (
                    <tr key={avail.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-heading)" }}>
                        {thName}
                      </td>
                      <td>{DAYS[avail.day_of_week] || `Day ${avail.day_of_week}`}</td>
                      <td style={{ color: "var(--mint-accent)" }}>
                        {avail.start_time?.slice(0, 5)} - {avail.end_time?.slice(0, 5)}
                      </td>
                      <td>
                        <span className="status-badge completed">On Duty</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleDelete(avail.id)}
                          className="btn btn-danger btn-sm"
                          title="Remove shift"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminAvailability;
