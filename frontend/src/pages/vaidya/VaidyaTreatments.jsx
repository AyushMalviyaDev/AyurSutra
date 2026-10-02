import { useEffect, useState, useCallback } from "react";
import {
  Sparkles,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  User,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useAuth from "../../hooks/useAuth";
import { getTherapies, getPatientTherapies, prescribeTherapy } from "../../services/therapyService";
import { getUsers } from "../../services/authService";

const VaidyaTreatments = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient: "",
    therapy: "",
    sessions: 5,
    physician_notes: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadData = useCallback(async () => {
    try {
      const [plansRes, ptsRes, thRes] = await Promise.all([
        getPatientTherapies(),
        getUsers("PATIENT"),
        getTherapies(),
      ]);

      const planList = Array.isArray(plansRes) ? plansRes : plansRes?.results || [];
      const ptList = Array.isArray(ptsRes) ? ptsRes : ptsRes?.results || [];
      const thList = Array.isArray(thRes) ? thRes : thRes?.results || [];

      setPlans(planList);
      setPatients(ptList);
      setTherapies(thList);

      if (ptList.length > 0 && !formData.patient) {
        setFormData((prev) => ({ ...prev, patient: String(ptList[0].id) }));
      }
      if (thList.length > 0 && !formData.therapy) {
        setFormData((prev) => ({ ...prev, therapy: String(thList[0].id) }));
      }
    } catch (err) {
      console.error("Failed to load treatments:", err);
      setMessage({ type: "error", text: "Failed to load treatment plans or therapies." });
    } finally {
      setLoading(false);
    }
  }, [formData.patient, formData.therapy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePrescribe = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      await prescribeTherapy({
        patient: Number(formData.patient),
        therapy: Number(formData.therapy),
        prescribed_by: user.id,
        sessions: Number(formData.sessions),
        physician_notes: formData.physician_notes,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      });

      setMessage({ type: "success", text: "Panchakarma treatment plan prescribed successfully!" });
      setShowModal(false);
      setFormData({
        patient: patients.length > 0 ? String(patients[0].id) : "",
        therapy: therapies.length > 0 ? String(therapies[0].id) : "",
        sessions: 5,
        physician_notes: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
      });
      await loadData();
    } catch (err) {
      console.error("Failed to prescribe:", err);
      const detail =
        err.response?.data?.detail ||
        Object.values(err.response?.data || {}).flat().join(" ") ||
        "Failed to prescribe therapy.";
      setMessage({ type: "error", text: detail });
    } finally {
      setSubmitting(false);
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
            <Sparkles size={13} />
            <span>CLINICAL PROTOCOLS & PRESCRIPTIONS</span>
          </div>
          <h1>Panchakarma Regimens</h1>
          <p>Prescribe classical detoxification and rejuvenation protocols customized for each patient.</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Prescribe Regimen</span>
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

      {/* Prescription Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} style={{ color: "var(--gold-primary)" }} />
                Prescribe Panchakarma Protocol
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePrescribe}>
              <div className="form-group">
                <label className="form-label">Select Patient</label>
                <select
                  value={formData.patient}
                  onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                  className="select-control"
                  required
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name || p.last_name
                        ? `${p.first_name} ${p.last_name} (${p.username})`
                        : p.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Panchakarma Therapy</label>
                <select
                  value={formData.therapy}
                  onChange={(e) => setFormData({ ...formData, therapy: e.target.value })}
                  className="select-control"
                  required
                >
                  {therapies.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.duration_minutes || 60} mins)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Prescribed Number of Sessions</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.sessions}
                  onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
                  className="input-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Physician Clinical Instructions & Notes</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Prescribed for Vata-Pitta pacification. Apply Mahanarayan taila with moderate pressure..."
                  value={formData.physician_notes}
                  onChange={(e) => setFormData({ ...formData, physician_notes: e.target.value })}
                  className="textarea-control"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? "Prescribing..." : "Confirm Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Treatment Plans Cards */}
      {loading ? (
        <div className="empty-state">
          <Sparkles size={36} className="empty-state-icon" />
          <h4>Loading Treatment Plans...</h4>
        </div>
      ) : plans.length === 0 ? (
        <div className="empty-state card">
          <FileText size={40} className="empty-state-icon" />
          <h4>No Prescriptions on Record</h4>
          <p>Click "Prescribe Regimen" to assign a Panchakarma protocol to a patient.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" }}>
          {plans.map((plan) => {
            const completed = plan.completed_sessions || 0;
            const total = plan.sessions || 1;
            const pct = Math.min(100, Math.round((completed / total) * 100));

            return (
              <div
                key={plan.id}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px",
                  marginBottom: 0,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span className={`status-badge ${plan.status?.toLowerCase()}`}>
                      {plan.status}
                    </span>

                    <span style={{ fontSize: "0.8rem", color: "var(--gold-light)", fontWeight: 600 }}>
                      {completed} / {total} Completed
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.25rem",
                      color: "var(--text-heading)",
                      marginBottom: "4px",
                    }}
                  >
                    {plan.therapy_name || "Panchakarma Protocol"}
                  </h3>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.88rem", color: "var(--mint-accent)", marginBottom: "12px" }}>
                    <User size={14} />
                    <span>Patient: {plan.patient_name || `Patient #${plan.patient}`}</span>
                  </div>

                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>

                  {plan.notes && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "10px 14px",
                        background: "var(--bg-input)",
                        borderRadius: "10px",
                        fontSize: "0.82rem",
                        color: "var(--text-body)",
                        lineHeight: 1.5,
                      }}
                    >
                      <strong style={{ color: "var(--gold-light)", display: "block", marginBottom: "2px" }}>
                        Clinical Notes:
                      </strong>
                      {plan.notes}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border-subtle)",
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>Protocol ID: #{plan.id}</span>
                  <span>{plan.start_date ? `Started: ${plan.start_date}` : "Ongoing"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default VaidyaTreatments;
