import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarPlus,
  Calendar,
  Clock,
  DoorOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useAuth from "../../hooks/useAuth";
import { getPatientTherapies } from "../../services/therapyService";
import { getUsers } from "../../services/authService";
import { findAvailableSlots, bookSession, getSessions } from "../../services/schedulingService";

const PatientSchedule = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [therapies, setTherapies] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [existingSessions, setExistingSessions] = useState([]);

  const todayStr = new Date().toISOString().split("T")[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  const [selectedTherapyId, setSelectedTherapyId] = useState("");
  const [selectedTherapistId, setSelectedTherapistId] = useState("");
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextWeekStr);
  const [patientNotes, setPatientNotes] = useState("");

  const [searching, setSearching] = useState(false);
  const [slots, setSlots] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const initData = async () => {
      try {
        const [therapyRes, therapistRes, sessionsRes] = await Promise.all([
          getPatientTherapies(),
          getUsers("THERAPIST"),
          getSessions().catch(() => []),
        ]);

        const ptList = Array.isArray(therapyRes) ? therapyRes : therapyRes?.results || [];
        const thList = Array.isArray(therapistRes) ? therapistRes : therapistRes?.results || [];
        const sList = Array.isArray(sessionsRes) ? sessionsRes : sessionsRes?.results || [];

        setTherapies(ptList);
        setTherapists(thList);
        setExistingSessions(sList);

        if (ptList.length > 0) {
          setSelectedTherapyId(String(ptList[0].id));
        }
        if (thList.length > 0) {
          setSelectedTherapistId(String(thList[0].id));
        }
      } catch (err) {
        console.error("Failed to load scheduling prerequisites:", err);
        setMessage({ type: "error", text: "Unable to load prescribed therapies or therapists." });
      }
    };

    initData();
  }, []);

  const handleSearchSlots = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSelectedSlot(null);

    if (!selectedTherapyId || !selectedTherapistId || !startDate || !endDate) {
      setMessage({ type: "error", text: "Please select all required parameters." });
      return;
    }

    if (startDate > endDate) {
      setMessage({ type: "error", text: "Start date must be before or equal to end date." });
      return;
    }

    setSearching(true);
    setHasSearched(true);

    try {
      const data = await findAvailableSlots({
        patient: user.id,
        therapist: selectedTherapistId,
        patient_therapy: selectedTherapyId,
        start_date: startDate,
        end_date: endDate,
      });

      setSlots(data.slots || []);
      if (!data.slots || data.slots.length === 0) {
        setMessage({
          type: "info",
          text: "No available slots found for the selected therapist and date range. Try selecting different dates or another practitioner.",
        });
      }
    } catch (err) {
      console.error("Slot search error:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to search for available slots.",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;

    setBooking(true);
    setMessage({ type: "", text: "" });

    const therapySessions = existingSessions.filter(
      (s) => s.patient_therapy === Number(selectedTherapyId)
    );
    const sessionNumber = therapySessions.length + 1;

    try {
      await bookSession({
        patient_therapy: Number(selectedTherapyId),
        therapist: Number(selectedTherapistId),
        room: selectedSlot.room,
        session_date: selectedSlot.date,
        start_time: selectedSlot.start_time,
        session_number: sessionNumber,
        patient_notes: patientNotes,
      });

      setMessage({
        type: "success",
        text: `Appointment confirmed for ${selectedSlot.date} at ${selectedSlot.start_time.slice(0, 5)}!`,
      });

      setTimeout(() => {
        navigate("/patient/sessions");
      }, 1500);
    } catch (err) {
      console.error("Booking error:", err);
      const errData = err.response?.data;
      let errMsg = "Failed to book session.";
      if (typeof errData === "object" && errData !== null) {
        errMsg = errData.detail || Object.values(errData).flat().join(" ") || errMsg;
      }
      setMessage({ type: "error", text: errMsg });
    } finally {
      setBooking(false);
    }
  };

  const selectedTherapyObj = therapies.find((t) => String(t.id) === String(selectedTherapyId));

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-eyebrow">
          <CalendarPlus size={13} />
          <span>APPOINTMENT CONCIERGE</span>
        </div>
        <h1>Schedule Therapy Session</h1>
        <p>Book your clinical Panchakarma session with verified room and therapist availability.</p>
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
                : message.type === "info"
                ? "rgba(56, 189, 248, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${
              message.type === "success"
                ? "var(--mint-accent)"
                : message.type === "info"
                ? "var(--cyan-accent)"
                : "#ef4444"
            }`,
            color:
              message.type === "success"
                ? "var(--mint-accent)"
                : message.type === "info"
                ? "var(--cyan-accent)"
                : "#fca5a5",
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "28px" }}>
        {/* Booking Query Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Search size={18} style={{ color: "var(--gold-primary)" }} />
              Select Criteria
            </h3>
          </div>

          <form onSubmit={handleSearchSlots}>
            <div className="form-group">
              <label className="form-label">Prescribed Therapy</label>
              {therapies.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--terracotta)" }}>
                  No active prescribed therapies found. Ask your Vaidya to prescribe a treatment plan.
                </p>
              ) : (
                <select
                  value={selectedTherapyId}
                  onChange={(e) => setSelectedTherapyId(e.target.value)}
                  className="select-control"
                  required
                >
                  {therapies.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.therapy_name} ({pt.sessions} sessions prescribed)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Panchakarma Therapist</label>
              <select
                value={selectedTherapistId}
                onChange={(e) => setSelectedTherapistId(e.target.value)}
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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  min={todayStr}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || todayStr}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-control"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Patient Notes / Health Remarks</label>
              <textarea
                rows="2"
                placeholder="e.g. slight stiffness in shoulders, prefer gentle pressure..."
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                className="textarea-control"
              />
            </div>

            <button
              type="submit"
              disabled={searching || therapies.length === 0}
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px", marginTop: "8px" }}
            >
              {searching ? (
                "Scanning Availability..."
              ) : (
                <>
                  <Search size={16} />
                  <span>Find Available Slots</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Slot Selection & Confirmation */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={18} style={{ color: "var(--cyan-accent)" }} />
              Open Time Slots {slots.length > 0 && `(${slots.length} available)`}
            </h3>
          </div>

          {!hasSearched ? (
            <div className="empty-state">
              <Sparkles size={40} className="empty-state-icon" />
              <h4>Awaiting Criteria</h4>
              <p>Configure your therapy parameters on the left and click "Find Available Slots".</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="empty-state">
              <Clock size={40} className="empty-state-icon" />
              <h4>No Slots Available</h4>
              <p>No therapist and room slots matched this range. Please widen dates or switch practitioner.</p>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                  gap: "12px",
                  maxHeight: "380px",
                  overflowY: "auto",
                  paddingRight: "6px",
                  marginBottom: "24px",
                }}
              >
                {slots.map((slot, idx) => {
                  const isSelected =
                    selectedSlot &&
                    selectedSlot.date === slot.date &&
                    selectedSlot.start_time === slot.start_time &&
                    selectedSlot.room === slot.room;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        background: isSelected
                          ? "rgba(212, 175, 55, 0.18)"
                          : "var(--bg-input)",
                        border: isSelected
                          ? "1.5px solid var(--gold-primary)"
                          : "1px solid var(--border-subtle)",
                        boxShadow: isSelected ? "var(--gold-glow)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.86rem",
                          color: isSelected ? "var(--gold-light)" : "var(--text-heading)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Calendar size={13} style={{ color: "var(--gold-primary)" }} />
                        {slot.date}
                      </div>

                      <div
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: 700,
                          color: "var(--mint-accent)",
                          margin: "6px 0 4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Clock size={14} />
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </div>

                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <DoorOpen size={12} style={{ color: "var(--cyan-accent)" }} />
                        {slot.room_name} ({slot.room_number})
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedSlot && (
                <div
                  style={{
                    padding: "20px 24px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(16, 36, 26, 0.9) 100%)",
                    border: "1px solid var(--gold-primary)",
                    boxShadow: "var(--gold-glow)",
                  }}
                >
                  <h4 style={{ color: "var(--gold-light)", fontFamily: "var(--font-serif)", fontSize: "1.1rem", marginBottom: "8px" }}>
                    Confirm Appointment Reservation
                  </h4>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-body)", marginBottom: "16px" }}>
                    Reserving <strong>{selectedTherapyObj?.therapy_name || "Panchakarma"}</strong> on{" "}
                    <strong>{selectedSlot.date}</strong> at <strong>{selectedSlot.start_time.slice(0, 5)}</strong> in{" "}
                    <strong>{selectedSlot.room_name}</strong>.
                  </p>

                  <button
                    onClick={handleBook}
                    disabled={booking}
                    className="btn btn-success"
                    style={{ width: "100%", padding: "13px", fontSize: "0.95rem" }}
                  >
                    {booking ? (
                      "Locking Appointment..."
                    ) : (
                      <>
                        <Check size={18} />
                        <span>Confirm & Book Appointment</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientSchedule;
