import { useEffect, useState, useCallback } from "react";
import {
  Stethoscope,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  User,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useAuth from "../../hooks/useAuth";
import { getConsultations, createConsultation } from "../../services/patientService";
import { getUsers } from "../../services/authService";

const VaidyaConsultations = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    patient: "",
    chief_complaint: "",
    clinical_findings: "",
    diagnosis: "",
    treatment_advice: "",
    follow_up_date: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadData = useCallback(async () => {
    try {
      const [consRes, ptsRes] = await Promise.all([
        getConsultations(),
        getUsers("PATIENT"),
      ]);

      const cList = Array.isArray(consRes) ? consRes : consRes?.results || [];
      const pList = Array.isArray(ptsRes) ? ptsRes : ptsRes?.results || [];

      setConsultations(cList);
      setPatients(pList);
      if (pList.length > 0 && !formData.patient) {
        setFormData((prev) => ({ ...prev, patient: String(pList[0].id) }));
      }
    } catch (err) {
      console.error("Failed to load consultations:", err);
      setMessage({ type: "error", text: "Failed to load clinical consultation records." });
    } finally {
      setLoading(false);
    }
  }, [formData.patient]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      await createConsultation({
        patient: Number(formData.patient),
        vaidya: user.id,
        chief_complaint: formData.chief_complaint,
        clinical_findings: formData.clinical_findings,
        diagnosis: formData.diagnosis,
        treatment_advice: formData.treatment_advice,
        follow_up_date: formData.follow_up_date || null,
      });

      setMessage({ type: "success", text: "Clinical consultation logged successfully!" });
      setShowAdd(false);
      setFormData({
        patient: patients.length > 0 ? String(patients[0].id) : "",
        chief_complaint: "",
        clinical_findings: "",
        diagnosis: "",
        treatment_advice: "",
        follow_up_date: "",
      });
      await loadData();
    } catch (err) {
      console.error("Consultation submit error:", err);
      const detail = err.response?.data?.detail || "Failed to log consultation.";
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
            <Stethoscope size={13} />
            <span>CLINICAL DIAGNOSTICS</span>
          </div>
          <h1>Patient Consultations</h1>
          <p>Document patient complaints, pulse (Nadi) findings, and Ayurvedic therapeutic guidance.</p>
        </div>

        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>New Consultation</span>
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

      {/* Add Consultation Modal */}
      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ width: "620px" }}>
            <div className="modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Stethoscope size={20} style={{ color: "var(--gold-primary)" }} />
                Record Clinical Consultation
              </h3>
              <button onClick={() => setShowAdd(false)} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Patient</label>
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
                <label className="form-label">Chief Complaint / Symptoms</label>
                <input
                  type="text"
                  placeholder="e.g. Chronic lower back stiffness, insomnia, irregular digestion"
                  value={formData.chief_complaint}
                  onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                  className="input-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clinical & Pulse (Nadi) Findings</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Mandagni noted; Pitta-Vata pulse rhythm (Manduka/Sarpa gati)..."
                  value={formData.clinical_findings}
                  onChange={(e) => setFormData({ ...formData, clinical_findings: e.target.value })}
                  className="textarea-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ayurvedic Diagnosis (Roga Nidana)</label>
                <input
                  type="text"
                  placeholder="e.g. Kati Graha due to Vata Prakopa"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="input-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Treatment Advice & Regimen Recommendation</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Advised 7 sessions of Kati Basti followed by Patra Pinda Swedana..."
                  value={formData.treatment_advice}
                  onChange={(e) => setFormData({ ...formData, treatment_advice: e.target.value })}
                  className="textarea-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Follow-up Date</label>
                <input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  className="input-control"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? "Saving Record..." : "Save Consultation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consultations Records List */}
      {loading ? (
        <div className="empty-state">
          <Stethoscope size={36} className="empty-state-icon" />
          <h4>Loading Consultations...</h4>
        </div>
      ) : consultations.length === 0 ? (
        <div className="empty-state card">
          <Stethoscope size={40} className="empty-state-icon" />
          <h4>No Consultation Records Found</h4>
          <p>Click "New Consultation" to record clinical observations for a patient.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {consultations.map((c) => (
            <div key={c.id} className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: "rgba(56, 189, 248, 0.12)",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      color: "var(--cyan-accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <User size={18} />
                  </div>

                  <div>
                    <h3 style={{ fontFamily: "var(--font-serif)", color: "var(--text-heading)", fontSize: "1.15rem" }}>
                      Patient #{c.patient}
                    </h3>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={12} />
                      <span>{c.consultation_date || c.created_at?.slice(0, 10)}</span>
                    </div>
                  </div>
                </div>

                {c.follow_up_date && (
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--gold-light)",
                      background: "rgba(212, 175, 55, 0.12)",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                      padding: "4px 10px",
                      borderRadius: "12px",
                    }}
                  >
                    Follow-up: {c.follow_up_date}
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                <div style={{ background: "var(--bg-input)", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--terracotta)", fontWeight: 700, marginBottom: "4px" }}>
                    Chief Complaint
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}>{c.chief_complaint}</p>
                </div>

                <div style={{ background: "var(--bg-input)", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold-primary)", fontWeight: 700, marginBottom: "4px" }}>
                    Diagnosis (Roga Nidana)
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-primary)", fontWeight: 600 }}>{c.diagnosis}</p>
                </div>
              </div>

              {c.clinical_findings && (
                <div style={{ fontSize: "0.85rem", color: "var(--text-body)", marginBottom: "8px" }}>
                  <strong style={{ color: "var(--mint-accent)" }}>Clinical Findings & Nadi:</strong> {c.clinical_findings}
                </div>
              )}

              {c.treatment_advice && (
                <div style={{ fontSize: "0.85rem", color: "var(--text-body)" }}>
                  <strong style={{ color: "var(--gold-light)" }}>Physician Regimen Advice:</strong> {c.treatment_advice}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default VaidyaConsultations;
