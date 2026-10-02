import { useState, useEffect } from "react";
import {
  User,
  Sparkles,
  Phone,
  Save,
  CheckCircle2,
  AlertCircle,
  Activity,
  Heart,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getMyProfile, updateMyProfile, getAssessments } from "../../services/patientService";

const PatientProfile = () => {
  const [profile, setProfile] = useState({
    date_of_birth: "",
    gender: "",
    phone: "",
    address: "",
    prakriti: "",
    vikriti: "",
    medical_history: "",
    allergies: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, assessmentsData] = await Promise.all([
          getMyProfile(),
          getAssessments().catch(() => []),
        ]);

        if (profileData) {
          setProfile({
            date_of_birth: profileData.date_of_birth || "",
            gender: profileData.gender || "",
            phone: profileData.phone || "",
            address: profileData.address || "",
            prakriti: profileData.prakriti || "",
            vikriti: profileData.vikriti || "",
            medical_history: profileData.medical_history || "",
            allergies: profileData.allergies || "",
            emergency_contact_name: profileData.emergency_contact_name || "",
            emergency_contact_phone: profileData.emergency_contact_phone || "",
          });
        }

        setAssessments(
          Array.isArray(assessmentsData)
            ? assessmentsData
            : assessmentsData?.results || []
        );
      } catch (err) {
        console.error("Failed to load profile:", err);
        setMessage({ type: "error", text: "Failed to load profile details." });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await updateMyProfile(profile);
      setMessage({ type: "success", text: "Profile details saved successfully!" });
    } catch (err) {
      console.error("Update failed:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="empty-state">
          <Activity size={36} className="empty-state-icon" />
          <h4>Loading Profile Details...</h4>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-eyebrow">
          <User size={13} />
          <span>HEALTH RECORD & PROFILE</span>
        </div>
        <h1>Patient Profile</h1>
        <p>Manage your personal details, Prakriti Ayurvedic constitution, and clinical assessments.</p>
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

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "28px", alignItems: "start" }}>
          {/* Left Column: Personal & Ayurvedic Profile */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Personal Details */}
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-header">
                <h3 className="card-title">
                  <User size={18} style={{ color: "var(--gold-primary)" }} />
                  Personal Information
                </h3>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={profile.date_of_birth}
                    onChange={handleChange}
                    className="input-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleChange}
                    className="select-control"
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    value={profile.phone}
                    onChange={handleChange}
                    className="input-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="City, State, Country"
                    value={profile.address}
                    onChange={handleChange}
                    className="input-control"
                  />
                </div>
              </div>
            </div>

            {/* Ayurvedic Profile */}
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-header">
                <h3 className="card-title">
                  <Sparkles size={18} style={{ color: "var(--gold-primary)" }} />
                  Ayurvedic Constitution (Dosha)
                </h3>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prakriti (Birth Constitution)</label>
                  <input
                    type="text"
                    name="prakriti"
                    placeholder="e.g. Vata-Pitta, Pitta-Kapha"
                    value={profile.prakriti}
                    onChange={handleChange}
                    className="input-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vikriti (Current Imbalance)</label>
                  <input
                    type="text"
                    name="vikriti"
                    placeholder="e.g. Vata aggravated, Pitta excess"
                    value={profile.vikriti}
                    onChange={handleChange}
                    className="input-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Medical History / Past Conditions</label>
                <textarea
                  rows="3"
                  name="medical_history"
                  placeholder="Details of previous diagnoses, chronic conditions, surgeries..."
                  value={profile.medical_history}
                  onChange={handleChange}
                  className="textarea-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Allergies & Contraindications</label>
                <input
                  type="text"
                  name="allergies"
                  placeholder="e.g. Sesame oil allergy, nut allergy, herbal hypersensitivity"
                  value={profile.allergies}
                  onChange={handleChange}
                  className="input-control"
                />
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-header">
                <h3 className="card-title">
                  <Phone size={18} style={{ color: "var(--cyan-accent)" }} />
                  Emergency Contact
                </h3>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Contact Name</label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    placeholder="Full name"
                    value={profile.emergency_contact_name}
                    onChange={handleChange}
                    className="input-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    name="emergency_contact_phone"
                    placeholder="+91 9876543210"
                    value={profile.emergency_contact_phone}
                    onChange={handleChange}
                    className="input-control"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ width: "100%", padding: "12px", marginTop: "10px" }}
              >
                {saving ? (
                  "Saving Profile..."
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Clinical Assessments */}
          <div>
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">
                    <Activity size={18} style={{ color: "var(--mint-accent)" }} />
                    Vaidya Clinical Assessments
                  </h3>
                  <p className="card-subtitle">Formal evaluations conducted by physicians</p>
                </div>
              </div>

              {assessments.length === 0 ? (
                <div className="empty-state">
                  <Heart size={36} className="empty-state-icon" />
                  <h4>No Clinical Assessments</h4>
                  <p>Your Vaidya has not conducted a formal constitutional assessment yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {assessments.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        padding: "16px",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            color: "var(--gold-primary)",
                            textTransform: "uppercase",
                          }}
                        >
                          Assessment #{a.id}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {a.assessment_date || a.created_at?.slice(0, 10)}
                        </span>
                      </div>

                      {a.chief_complaint && (
                        <p style={{ fontSize: "0.88rem", color: "var(--text-heading)", marginBottom: "6px" }}>
                          <strong>Chief Complaint:</strong> {a.chief_complaint}
                        </p>
                      )}

                      {a.pulse_diagnosis && (
                        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                          <strong>Nadi (Pulse):</strong> {a.pulse_diagnosis}
                        </p>
                      )}

                      {a.tongue_diagnosis && (
                        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                          <strong>Jihva (Tongue):</strong> {a.tongue_diagnosis}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default PatientProfile;
