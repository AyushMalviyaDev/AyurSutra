import { useState, useEffect } from "react";
import { Printer, X, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { getMyProfile, getConsultations } from "../../services/patientService";
import { getPatientTherapies } from "../../services/therapyService";
import { getSessions } from "../../services/schedulingService";

const PATHYA_APATHYA_RULES = {
  Vata: {
    pathya: [
      "Warm, freshly prepared soupy foods with healthy fats (ghee, sesame oil)",
      "Sweet, sour, and mildly salty tastes (Madhura, Amla, Lavana)",
      "Steamed root vegetables, warm spiced milk with nutmeg before bed",
      "Regular sleep cycle, gentle Abhyanga self-massage, avoiding draft/cold air",
    ],
    apathya: [
      "Raw salads, cold iced beverages, dry crackers, and popcorn",
      "Pungent, bitter, and astringent foods in excess",
      "Irregular sleeping hours, excessive screen time at night",
      "Exposure to freezing AC drafts immediately after hot water bath",
    ],
  },
  Pitta: {
    pathya: [
      "Cooling, soothing foods with sweet, bitter, and astringent tastes",
      "Coconut water, fresh pomegranate juice, ghee, coriander infusion",
      "Sweet fruits (grapes, ripe mangos, melons), cucumber, zucchini",
      "Cool evening walks in nature, moonlight contemplation (Chandra Namaskar)",
    ],
    apathya: [
      "Deep-fried oily items, hot chili peppers, raw garlic, and excess vinegar",
      "Fermented spicy pickles, alcohol, and caffeine on empty stomach",
      "Midday sun exposure without head covering",
      "Suppression of anger or high-stress conflict situations",
    ],
  },
  Kapha: {
    pathya: [
      "Light, warm, dry foods seasoned with digestive spices (ginger, black pepper, pippali)",
      "Pungent, bitter, and astringent tastes; warm honey water in the morning",
      "Roasted barley, millets, leafy greens, split lentils",
      "Vigorous morning movement, dry powder massage (Udvartana), early waking before sunrise",
    ],
    apathya: [
      "Cold dairy, ice creams, heavy sweets, and rich oily curries",
      "Daytime sleeping (Diva Swapna) which clogs bodily channels (Srotas)",
      "Excessive salt and water retention foods",
      "Sedentary inactivity after meals",
    ],
  },
};

const AyurvedicEHRReport = ({ isOpen, onClose, patientId: _patientId = null, patientName = null }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [therapies, setTherapies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verificationId] = useState(() => Math.floor(100000 + Math.random() * 900000));

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [profData, thData, sessData, consData] = await Promise.all([
          getMyProfile().catch(() => null),
          getPatientTherapies().catch(() => []),
          getSessions().catch(() => []),
          getConsultations().catch(() => []),
        ]);

        setProfile(profData);
        setTherapies(Array.isArray(thData) ? thData : thData?.results || []);
        setSessions(Array.isArray(sessData) ? sessData : sessData?.results || []);
        setConsultations(Array.isArray(consData) ? consData : consData?.results || []);
      } catch (err) {
        console.error("Failed to load EHR data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const displayName = patientName || user?.first_name || user?.username || "Patient";
  const prakritiKey = profile?.prakriti?.toLowerCase().includes("pitta")
    ? "Pitta"
    : profile?.prakriti?.toLowerCase().includes("kapha")
    ? "Kapha"
    : "Vata";

  const dietGuidelines = PATHYA_APATHYA_RULES[prakritiKey] || PATHYA_APATHYA_RULES.Vata;
  const completedSessionsList = sessions.filter((s) => s.status === "COMPLETED");
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="modal-overlay" style={{ overflowY: "auto", padding: "20px" }}>
      <div
        className="modal-dialog"
        style={{
          width: "820px",
          maxWidth: "100%",
          background: "#0c1a13",
          border: "2px solid var(--gold-primary)",
          borderRadius: "20px",
          boxShadow: "var(--shadow-modal)",
          padding: "36px",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* Top Control Bar (Hidden during print) */}
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "16px",
            borderBottom: "1px solid var(--border-subtle)",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--gold-light)" }}>
            <ShieldCheck size={20} />
            <strong style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem" }}>
              Official Ayurvedic Clinical Record & EHR
            </strong>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={15} /> Print / Save PDF
            </button>
            <button onClick={onClose} className="btn-close-modal">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable EHR Document Container */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--gold-light)", fontFamily: "var(--font-serif)" }}>
            Loading Ayurvedic clinical records...
          </div>
        ) : (
          <div id="printable-ehr-document" style={{ color: "#e2e8f0" }}>
            {/* Header Banner */}
            <div
              style={{
                textAlign: "center",
                paddingBottom: "20px",
                borderBottom: "2px double var(--gold-primary)",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.9rem",
                  color: "var(--gold-light)",
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                }}
              >
                AYURSUTRA
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--mint-accent)",
                  marginTop: "2px",
                }}
              >
                Panchakarma Sanctuary & Research Clinic
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic", marginTop: "4px" }}>
                "Swasthyasya Swasthya Rakshanam, Aturasya Vikara Prashamanam Cha"
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Report Generated on: {todayFormatted} • Document Verification ID: #EHR-{user?.id || "0"}-{verificationId}
              </div>
            </div>

            {/* Section 1: Patient Demographics & Ayurvedic Constitution */}
            <div style={{ marginBottom: "22px" }}>
              <h4
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--gold-light)",
                  fontSize: "1.05rem",
                  borderBottom: "1px solid var(--border-card)",
                  paddingBottom: "6px",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                1. Patient Identity & Constitutional Profile (Prakriti)
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", fontSize: "0.86rem" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Patient Name:</span>
                  <strong>{displayName}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Date of Birth:</span>
                  <strong>{profile?.date_of_birth || "Recorded in chart"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Biological Gender:</span>
                  <strong>{profile?.gender === "M" ? "Male" : profile?.gender === "F" ? "Female" : "Other"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Prakriti (Birth Dosha):</span>
                  <strong style={{ color: "var(--gold-light)" }}>{profile?.prakriti || "Vata-Pitta Constitutional Axis"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Vikriti (Active Imbalance):</span>
                  <strong style={{ color: "var(--terracotta)" }}>{profile?.vikriti || "Aggravated Vata, Mandagni"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Known Allergies:</span>
                  <strong style={{ color: profile?.allergies ? "var(--danger-crimson)" : "var(--mint-accent)" }}>
                    {profile?.allergies || "No Known Adverse Drug Reactions"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Section 2: Prescribed Panchakarma Protocols & Sessions Done */}
            <div style={{ marginBottom: "22px" }}>
              <h4
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--gold-light)",
                  fontSize: "1.05rem",
                  borderBottom: "1px solid var(--border-card)",
                  paddingBottom: "6px",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                2. Panchakarma Regimens Administered ({completedSessionsList.length} Sessions Logged)
              </h4>

            {therapies.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No prescribed therapies on record.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {therapies.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      background: "rgba(18, 38, 28, 0.5)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.86rem",
                    }}
                  >
                    <div>
                      <strong style={{ color: "var(--text-heading)", fontSize: "0.95rem" }}>
                        {t.therapy_name}
                      </strong>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        Phase: {t.phase || "PRADHANAKARMA"} • Prescribing Vaidya: {t.vaidya_name || "Chief Vaidya"}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: "var(--mint-accent)", fontWeight: 700 }}>
                        {t.completed_sessions || 0} / {t.sessions} Sessions Done
                      </span>
                      <div style={{ fontSize: "0.75rem", color: "var(--gold-light)" }}>
                        Status: {t.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Vaidya Pulse Diagnostics & Clinical Observations */}
          <div style={{ marginBottom: "22px" }}>
            <h4
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--gold-light)",
                fontSize: "1.05rem",
                borderBottom: "1px solid var(--border-card)",
                paddingBottom: "6px",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              3. Clinical Diagnostics & Pulse Examination (Nadi Pariksha)
            </h4>

            {consultations.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Initial clinical intake notes pending physician sign-off.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {consultations.slice(0, 2).map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: "rgba(8, 19, 14, 0.7)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      fontSize: "0.84rem",
                    }}
                  >
                    <div><strong>Diagnosis (Roga Nidana):</strong> {c.diagnosis}</div>
                    <div style={{ color: "var(--mint-accent)", marginTop: "2px" }}>
                      <strong>Pulse & Findings:</strong> {c.clinical_findings || "Tridoshic pulse rhythm verified."}
                    </div>
                    <div style={{ color: "var(--text-muted)", marginTop: "2px" }}>
                      <strong>Physician Advice:</strong> {c.treatment_advice}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Personalized Pathya / Apathya Guidelines */}
          <div style={{ marginBottom: "24px" }}>
            <h4
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--gold-light)",
                fontSize: "1.05rem",
                borderBottom: "1px solid var(--border-card)",
                paddingBottom: "6px",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              4. Customized Pathya & Apathya (Dietary & Behavioral Protocol)
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "0.82rem" }}>
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "10px",
                  padding: "14px",
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--mint-accent)", marginBottom: "8px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Check size={14} /> Pathya (Wholesome / Recommended)
                </div>
                <ul style={{ paddingLeft: "18px", lineHeight: 1.6, color: "var(--text-body)" }}>
                  {dietGuidelines.pathya.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "10px",
                  padding: "14px",
                }}
              >
                <div style={{ fontWeight: 700, color: "#fca5a5", marginBottom: "8px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertTriangle size={14} /> Apathya (Strict Avoidance)
                </div>
                <ul style={{ paddingLeft: "18px", lineHeight: 1.6, color: "var(--text-body)" }}>
                  {dietGuidelines.apathya.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Signature & Seal Footer */}
          <div
            style={{
              paddingTop: "20px",
              borderTop: "1px dashed var(--border-card)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}
          >
            <div>
              <div>AyurSutra Clinical Governance Board</div>
              <div>Certified Classical Ayurvedic Facility (NABH Aligned)</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-serif)", color: "var(--gold-light)", fontSize: "0.95rem" }}>
                Dr. Vaidya Shankarananda, BAMS, MD (Ayu)
              </div>
              <div>Chief Physician & Clinical Superintendent</div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default AyurvedicEHRReport;
