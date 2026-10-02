import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Sliders,
  Calendar,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useAuth from "../../hooks/useAuth";
import {
  getProgress,
  recordProgress,
  getSessions,
  updateSession,
} from "../../services/schedulingService";

const TherapistProgress = () => {
  const { user } = useAuth();
  const [progressLogs, setProgressLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    session: "",
    discomfort_level: 0,
    patient_response: "",
    therapist_observations: "",
    progress_notes: "",
    completed_successfully: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadData = useCallback(async () => {
    try {
      const [progRes, sessRes] = await Promise.all([
        getProgress(),
        getSessions(),
      ]);

      const pList = Array.isArray(progRes) ? progRes : progRes?.results || [];
      const sList = Array.isArray(sessRes) ? sessRes : sessRes?.results || [];

      setProgressLogs(pList);
      setSessions(sList);
      if (sList.length > 0 && !formData.session) {
        setFormData((prev) => ({ ...prev, session: String(sList[0].id) }));
      }
    } catch (err) {
      console.error("Failed to load progress records:", err);
      setMessage({ type: "error", text: "Failed to load progress logs." });
    } finally {
      setLoading(false);
    }
  }, [formData.session]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      await recordProgress({
        session: Number(formData.session),
        recorded_by: user.id,
        discomfort_level: Number(formData.discomfort_level),
        patient_response: formData.patient_response,
        therapist_observations: formData.therapist_observations,
        progress_notes: formData.progress_notes,
        completed_successfully: formData.completed_successfully,
      });

      if (formData.completed_successfully) {
        await updateSession(Number(formData.session), { status: "COMPLETED" }).catch(() => {});
      }

      setMessage({ type: "success", text: "Session clinical progress logged successfully!" });
      setShowAdd(false);
      setFormData({
        session: sessions.length > 0 ? String(sessions[0].id) : "",
        discomfort_level: 0,
        patient_response: "",
        therapist_observations: "",
        progress_notes: "",
        completed_successfully: true,
      });
      await loadData();
    } catch (err) {
      console.error("Failed to log progress:", err);
      const detail =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Failed to log progress.";
      setMessage({ type: "error", text: detail });
    } finally {
      setSubmitting(false);
    }
  };

  const getDiscomfortColor = (level) => {
    if (level <= 3) return "var(--mint-accent)";
    if (level <= 6) return "var(--warning-amber)";
    return "var(--danger-crimson)";
  };

  const getDiscomfortLabel = (level) => {
    if (level === 0) return "No Discomfort (Optimal)";
    if (level <= 3) return "Mild / Well-Tolerated";
    if (level <= 6) return "Moderate Discomfort";
    return "Significant Discomfort / Sensitivity";
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
            <Activity size={13} />
            <span>CLINICAL OBSERVATIONS & COMPLIANCE</span>
          </div>
          <h1>Therapy Progress Logs</h1>
          <p>Document patient tolerance, clinical observations, and complete therapy sessions.</p>
        </div>

        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Log Session Progress</span>
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

      {/* Progress Recording Modal */}
      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ width: "600px" }}>
            <div className="modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Activity size={20} style={{ color: "var(--gold-primary)" }} />
                Record Clinical Progress
              </h3>
              <button onClick={() => setShowAdd(false)} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Therapy Session</label>
                <select
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                  className="select-control"
                  required
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.session_number || 1} - {s.therapy_name} ({s.patient_name || `Patient #${s.patient}`}) - {s.session_date}
                    </option>
                  ))}
                </select>
              </div>

              {/* Discomfort Slider */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Patient Discomfort Level (0 to 10)
                  </label>
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: getDiscomfortColor(Number(formData.discomfort_level)),
                    }}
                  >
                    Level {formData.discomfort_level} • {getDiscomfortLabel(Number(formData.discomfort_level))}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.discomfort_level}
                  onChange={(e) => setFormData({ ...formData, discomfort_level: e.target.value })}
                  style={{
                    width: "100%",
                    accentColor: "var(--gold-primary)",
                    cursor: "pointer",
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Patient Response & Subjective Feedback</label>
                <input
                  type="text"
                  placeholder="e.g. Felt relaxed, reported reduction in muscle tightness"
                  value={formData.patient_response}
                  onChange={(e) => setFormData({ ...formData, patient_response: e.target.value })}
                  className="input-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Therapist Clinical Observations</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Skin absorption normal; sweat response achieved within 15 mins..."
                  value={formData.therapist_observations}
                  onChange={(e) => setFormData({ ...formData, therapist_observations: e.target.value })}
                  className="textarea-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">General Progress & Post-Care Instructions</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Advised lukewarm bath, light diet (Kitchari), and rest..."
                  value={formData.progress_notes}
                  onChange={(e) => setFormData({ ...formData, progress_notes: e.target.value })}
                  className="textarea-control"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 14px",
                  background: "var(--bg-input)",
                  borderRadius: "10px",
                  border: "1px solid var(--border-subtle)",
                  marginBottom: "20px",
                }}
              >
                <input
                  type="checkbox"
                  id="completedCheck"
                  checked={formData.completed_successfully}
                  onChange={(e) => setFormData({ ...formData, completed_successfully: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: "var(--gold-primary)" }}
                />
                <label htmlFor="completedCheck" style={{ fontSize: "0.88rem", color: "var(--text-heading)", cursor: "pointer" }}>
                  Mark Therapy Session as <strong>COMPLETED</strong> in master schedule
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? "Saving Log..." : "Save Progress & Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Logs List */}
      {loading ? (
        <div className="empty-state">
          <Activity size={36} className="empty-state-icon" />
          <h4>Loading Progress Logs...</h4>
        </div>
      ) : progressLogs.length === 0 ? (
        <div className="empty-state card">
          <Sliders size={40} className="empty-state-icon" />
          <h4>No Clinical Progress Logged Yet</h4>
          <p>Click "Log Session Progress" after administering a Panchakarma procedure.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {progressLogs.map((log) => {
            const session = sessions.find((s) => s.id === log.session);
            const discColor = getDiscomfortColor(log.discomfort_level);

            return (
              <div key={log.id} className="card" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        background: "rgba(212, 175, 55, 0.15)",
                        border: "1px solid rgba(212, 175, 55, 0.3)",
                        color: "var(--gold-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Activity size={18} />
                    </div>

                    <div>
                      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", color: "var(--text-heading)" }}>
                        {session ? session.therapy_name : `Session #${log.session}`}
                      </h3>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <User size={12} />
                        <span>{session?.patient_name || `Patient in Session #${log.session}`}</span>
                        <span>•</span>
                        <Calendar size={12} />
                        <span>{log.recorded_at?.slice(0, 10) || "Recorded"}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: discColor,
                      background: "var(--bg-input)",
                      border: `1px solid ${discColor}`,
                      padding: "4px 10px",
                      borderRadius: "12px",
                    }}
                  >
                    Discomfort: {log.discomfort_level} / 10
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "10px" }}>
                  {log.patient_response && (
                    <div style={{ background: "var(--bg-input)", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mint-accent)", fontWeight: 700, marginBottom: "2px" }}>
                        Patient Response
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-body)" }}>{log.patient_response}</p>
                    </div>
                  )}

                  {log.therapist_observations && (
                    <div style={{ background: "var(--bg-input)", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold-primary)", fontWeight: 700, marginBottom: "2px" }}>
                        Therapist Observations
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-body)" }}>{log.therapist_observations}</p>
                    </div>
                  )}
                </div>

                {log.progress_notes && (
                  <div style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
                    <strong style={{ color: "var(--text-body)" }}>Notes:</strong> {log.progress_notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TherapistProgress;
