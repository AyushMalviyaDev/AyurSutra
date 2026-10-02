import { useEffect, useState, useCallback } from "react";
import {
  DoorOpen,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  X,
  Calendar,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getRooms,
  createRoom,
  updateRoom,
  getRoomAvailability,
  createRoomAvailability,
  deleteRoomAvailability,
} from "../../services/schedulingService";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Room State
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", room_number: "" });

  // New Availability State
  const [showAddAvail, setShowAddAvail] = useState(false);
  const [newAvail, setNewAvail] = useState({
    room: "",
    day_of_week: "0",
    start_time: "09:00",
    end_time: "17:00",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  const loadData = useCallback(async () => {
    try {
      const [roomsData, availData] = await Promise.all([
        getRooms(),
        getRoomAvailability().catch(() => []),
      ]);

      const rList = Array.isArray(roomsData) ? roomsData : roomsData?.results || [];
      const aList = Array.isArray(availData) ? availData : availData?.results || [];

      setRooms(rList);
      setAvailabilities(aList);
      if (rList.length > 0 && !newAvail.room) {
        setNewAvail((prev) => ({ ...prev, room: String(rList[0].id) }));
      }
    } catch (err) {
      console.error("Failed to load rooms:", err);
      setMessage({ type: "error", text: "Failed to load rooms or availability." });
    } finally {
      setLoading(false);
    }
  }, [newAvail.room]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      await createRoom({ ...newRoom, is_active: true });
      setMessage({ type: "success", text: "Room added successfully!" });
      setNewRoom({ name: "", room_number: "" });
      setShowAddRoom(false);
      await loadData();
    } catch (err) {
      console.error("Failed to create room:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to create room. Room number must be unique.",
      });
    }
  };

  const handleToggleRoomActive = async (room) => {
    try {
      await updateRoom(room.id, { is_active: !room.is_active });
      await loadData();
    } catch (err) {
      console.error("Failed to update room:", err);
      setMessage({ type: "error", text: "Failed to update room status." });
    }
  };

  const handleCreateAvailability = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      await createRoomAvailability({
        room: Number(newAvail.room),
        day_of_week: Number(newAvail.day_of_week),
        start_time: newAvail.start_time,
        end_time: newAvail.end_time,
        is_available: true,
      });

      setMessage({ type: "success", text: "Room availability slot added!" });
      setShowAddAvail(false);
      await loadData();
    } catch (err) {
      console.error("Failed to add room availability:", err);
      const errDetail =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Failed to add availability.";
      setMessage({ type: "error", text: errDetail });
    }
  };

  const handleDeleteAvailability = async (availId) => {
    if (!window.confirm("Remove this room availability slot?")) return;
    try {
      await deleteRoomAvailability(availId);
      await loadData();
    } catch (err) {
      console.error("Failed to remove availability:", err);
      setMessage({ type: "error", text: "Failed to delete slot." });
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
            <DoorOpen size={13} />
            <span>PANCHAKARMA SUITES & FACILITIES</span>
          </div>
          <h1>Treatment Rooms</h1>
          <p>Configure therapy suites, equipment statuses, and weekly operating availability.</p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => setShowAddRoom(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Suite</span>
          </button>
          <button onClick={() => setShowAddAvail(true)} className="btn btn-secondary">
            <Clock size={16} />
            <span>Add Suite Hours</span>
          </button>
        </div>
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

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <DoorOpen size={20} style={{ color: "var(--gold-primary)" }} />
                Add Treatment Suite
              </h3>
              <button onClick={() => setShowAddRoom(false)} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRoom}>
              <div className="form-group">
                <label className="form-label">Suite Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dhanwanthari Suite"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  className="input-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Suite Identifier / Number</label>
                <input
                  type="text"
                  placeholder="e.g. R-101"
                  value={newRoom.room_number}
                  onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })}
                  className="input-control"
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddRoom(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Suite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Availability Modal */}
      {showAddAvail && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={20} style={{ color: "var(--gold-primary)" }} />
                Define Suite Operating Hours
              </h3>
              <button onClick={() => setShowAddAvail(false)} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAvailability}>
              <div className="form-group">
                <label className="form-label">Select Treatment Suite</label>
                <select
                  value={newAvail.room}
                  onChange={(e) => setNewAvail({ ...newAvail, room: e.target.value })}
                  className="select-control"
                  required
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.room_number})
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
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    value={newAvail.start_time}
                    onChange={(e) => setNewAvail({ ...newAvail, start_time: e.target.value })}
                    className="input-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time</label>
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
                  onClick={() => setShowAddAvail(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Operating Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rooms Cards Grid */}
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--gold-light)",
          fontSize: "1.25rem",
          marginBottom: "16px",
        }}
      >
        Active Suites ({rooms.length})
      </h3>

      {loading ? (
        <div className="empty-state">
          <DoorOpen size={36} className="empty-state-icon" />
          <h4>Loading Suites...</h4>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "36px",
          }}
        >
          {rooms.map((room) => {
            const roomAvails = availabilities.filter((a) => a.room === room.id);

            return (
              <div
                key={room.id}
                className="card"
                style={{
                  marginBottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em",
                        color: "var(--gold-primary)",
                        fontWeight: 700,
                      }}
                    >
                      {room.room_number}
                    </span>

                    <span className={`status-badge ${room.is_active ? "completed" : "cancelled"}`}>
                      {room.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", color: "var(--text-heading)", marginBottom: "4px" }}>
                    {room.name}
                  </h3>

                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {roomAvails.length} scheduled operational time windows
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => handleToggleRoomActive(room)}
                    className="btn btn-secondary btn-sm"
                  >
                    {room.is_active ? "Deactivate" : "Activate Suite"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Room Availability Weekly Roster */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Calendar size={18} style={{ color: "var(--gold-primary)" }} />
              Weekly Suite Operating Hours Roster
            </h3>
            <p className="card-subtitle">Active scheduling windows open for booking</p>
          </div>
        </div>

        {availabilities.length === 0 ? (
          <div className="empty-state">
            <Clock size={36} className="empty-state-icon" />
            <h4>No Operating Hours Configured</h4>
            <p>Add operating time slots so patients and staff can book sessions in suites.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Suite</th>
                  <th>Day of Week</th>
                  <th>Operating Window</th>
                  <th>Availability</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {availabilities.map((avail) => {
                  const room = rooms.find((r) => r.id === avail.room);

                  return (
                    <tr key={avail.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-heading)" }}>
                        {room ? `${room.name} (${room.room_number})` : `Room #${avail.room}`}
                      </td>
                      <td>{DAYS[avail.day_of_week] || `Day ${avail.day_of_week}`}</td>
                      <td style={{ color: "var(--mint-accent)" }}>
                        {avail.start_time?.slice(0, 5)} - {avail.end_time?.slice(0, 5)}
                      </td>
                      <td>
                        <span className="status-badge completed">Open</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleDeleteAvailability(avail.id)}
                          className="btn btn-danger btn-sm"
                          title="Remove slot"
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

export default AdminRooms;
