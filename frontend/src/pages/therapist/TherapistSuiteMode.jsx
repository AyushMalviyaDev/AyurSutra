import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import {
  getSessions,
  recordProgress,
  updateSession,
} from "../../services/schedulingService";

const QUICK_OBSERVATIONS = [
  "Optimal Sweating (Sweda) Achieved",
  "Patient Relaxed & Calmed",
  "Oil Temperature Well-Tolerated",
  "Muscle Stiffness Reduced",
  "Mild Initial Sensitivity",
  "Breathing Deep & Regular",
  "Skin Absorption Normal",
];

const TherapistSuiteMode = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [loading, setLoading] = useState(true);

  // Timer State
  const [secondsLeft, setSecondsLeft] = useState(45 * 60); // 45 minutes default
  const [isRunning, setIsRunning] = useState(false);

  // In-session Quick Logging
  const [discomfort, setDiscomfort] = useState(1);
  const [selectedTags, setSelectedTags] = useState([
    "Optimal Sweating (Sweda) Achieved",
    "Patient Relaxed & Calmed",
  ]);
  const [quickNotes, setQuickNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await getSessions();
        const sList = Array.isArray(data) ? data : data?.results || [];
        setSessions(sList);

        const paramId = searchParams.get("sessionId");
        if (paramId && sList.some((s) => String(s.id) === paramId)) {
          setSelectedSessionId(paramId);
        } else if (sList.length > 0) {
          // Select first scheduled or in-progress session
          const activeSess =
            sList.find((s) => s.status === "IN_PROGRESS" || s.status === "SCHEDULED") ||
            sList[0];
          setSelectedSessionId(String(activeSess.id));
        }
      } catch (err) {
        console.error("Failed to load suite sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [searchParams]);

  // Timer interval
  useEffect(() => {
    let timer = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleFinishAndComplete = async () => {
    if (!selectedSessionId) return;
    setSubmitting(true);

    try {
      const combinedNotes = [
        ...selectedTags,
        quickNotes ? `Notes: ${quickNotes}` : "",
      ]
        .filter(Boolean)
        .join("; ");

      await recordProgress({
        session: Number(selectedSessionId),
        recorded_by: user.id,
        discomfort_level: discomfort,
        patient_response: discomfort <= 2 ? "Patient felt relaxed and comfortable." : "Patient reported manageable discomfort.",
        therapist_observations: combinedNotes,
        progress_notes: "Completed via Therapist In-Suite Console.",
        completed_successfully: true,
      });

      await updateSession(Number(selectedSessionId), { status: "COMPLETED" });

      setCompletedSuccess(true);
      setTimeout(() => {
        navigate("/therapist/schedule");
      }, 2000);
    } catch (err) {
      console.error("Failed to complete in suite mode:", err);
      alert("Failed to save progress. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeSession = sessions.find((s) => String(s.id) === String(selectedSessionId));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050b07",
        color: "#f8fafc",
        padding: "24px 32px",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          paddingBottom: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => navigate("/therapist/schedule")}
            className="btn btn-secondary"
            style={{ padding: "10px 16px", fontSize: "0.95rem" }}
          >
            <ArrowLeft size={18} /> Exit Suite Mode
          </button>

          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--gold-primary)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
              IN-SUITE CLINICAL CONSOLE
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)", color: "var(--text-heading)", fontSize: "1.4rem" }}>
              Therapy Suite Administration
            </h2>
          </div>
        </div>

        {/* Session Selector */}
        {sessions.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Active Patient:</span>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="select-control"
              style={{ padding: "10px 16px", fontSize: "0.95rem", width: "auto" }}
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.patient_name || `Patient #${s.patient}`} — {s.therapy_name} ({s.room_name})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--gold-light)", fontFamily: "var(--font-serif)", fontSize: "1.1rem" }}>
          Initializing In-Suite Console & Syncing Protocol Data...
        </div>
      ) : completedSuccess ? (
        <div
          style={{
            maxWidth: "600px",
            margin: "80px auto",
            textAlign: "center",
            padding: "40px",
            background: "rgba(16, 185, 129, 0.15)",
            border: "2px solid var(--mint-accent)",
            borderRadius: "24px",
          }}
        >
          <CheckCircle2 size={64} style={{ color: "var(--mint-accent)", margin: "0 auto 16px" }} />
          <h2 style={{ fontFamily: "var(--font-serif)", color: "#fff", fontSize: "1.8rem", marginBottom: "8px" }}>
            Session Completed Successfully!
          </h2>
          <p style={{ color: "var(--text-body)", fontSize: "1rem" }}>
            Clinical progress logged and suite record marked as COMPLETED. Returning to schedule...
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "28px", maxWidth: "1400px", margin: "0 auto" }}>
          {/* Left Column: Big Timer & Procedure Context */}
          <div
            style={{
              background: "rgba(18, 38, 28, 0.8)",
              border: "1px solid var(--border-gold)",
              borderRadius: "24px",
              padding: "36px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {/* Session Info Pill */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  background: "rgba(212, 175, 55, 0.15)",
                  border: "1px solid var(--gold-primary)",
                  color: "var(--gold-light)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                {activeSession?.therapy_name || "Panchakarma Treatment"}
              </span>

              <h1 style={{ fontFamily: "var(--font-serif)", color: "#fff", fontSize: "2rem" }}>
                {activeSession?.patient_name || "Patient in Session"}
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                🚪 Suite: {activeSession?.room_name} • Session #{activeSession?.session_number || 1}
              </p>
            </div>

            {/* Giant Countdown Clock */}
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "6.5rem",
                fontWeight: 700,
                color: isRunning ? "var(--mint-accent)" : "var(--gold-light)",
                letterSpacing: "0.05em",
                lineHeight: 1,
                margin: "24px 0",
                textShadow: isRunning ? "0 0 40px rgba(52, 211, 153, 0.3)" : "none",
              }}
            >
              {formatTimer(secondsLeft)}
            </div>

            {/* Big Timer Control Buttons */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
              {!isRunning ? (
                <button
                  onClick={() => setIsRunning(true)}
                  className="btn btn-primary"
                  style={{ padding: "16px 36px", fontSize: "1.15rem", borderRadius: "14px" }}
                >
                  <Play size={22} />
                  <span>Start Procedure</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsRunning(false)}
                  className="btn btn-secondary"
                  style={{ padding: "16px 36px", fontSize: "1.15rem", borderRadius: "14px" }}
                >
                  <Pause size={22} />
                  <span>Pause Timer</span>
                </button>
              )}

              <button
                onClick={() => setSecondsLeft((prev) => prev + 300)}
                className="btn btn-secondary"
                style={{ padding: "16px 24px", fontSize: "1rem", borderRadius: "14px" }}
              >
                +5 Mins
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  setSecondsLeft(45 * 60);
                }}
                className="btn btn-secondary"
                style={{ padding: "16px 20px", fontSize: "1rem", borderRadius: "14px" }}
                title="Reset to 45 mins"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>

          {/* Right Column: One-Tap Touch Charting */}
          <div
            style={{
              background: "rgba(18, 38, 28, 0.8)",
              border: "1px solid var(--border-gold)",
              borderRadius: "24px",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", color: "var(--gold-light)", fontSize: "1.25rem", marginBottom: "4px" }}>
                One-Tap Patient Tolerance (0 - 10)
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "14px" }}>
                Tap the patient's reported sensitivity during therapy:
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: "6px" }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isSelected = discomfort === num;
                  const bg =
                    num <= 3
                      ? "rgba(16, 185, 129, 0.2)"
                      : num <= 6
                      ? "rgba(245, 158, 11, 0.2)"
                      : "rgba(239, 68, 68, 0.2)";
                  const border =
                    num <= 3
                      ? "var(--mint-accent)"
                      : num <= 6
                      ? "var(--warning-amber)"
                      : "var(--danger-crimson)";

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setDiscomfort(num)}
                      style={{
                        padding: "16px 0",
                        borderRadius: "10px",
                        background: isSelected ? border : bg,
                        border: `1.5px solid ${border}`,
                        color: isSelected ? "#000" : "#fff",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        cursor: "pointer",
                        boxShadow: isSelected ? "0 0 15px rgba(255,255,255,0.4)" : "none",
                        transition: "all 0.15s",
                      }}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Touch Clinical Observations */}
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", color: "var(--gold-light)", fontSize: "1.25rem", marginBottom: "4px" }}>
                Quick Clinical Findings
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "12px" }}>
                Tap applicable responses observed in the therapy room:
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {QUICK_OBSERVATIONS.map((obs) => {
                  const isChecked = selectedTags.includes(obs);

                  return (
                    <button
                      key={obs}
                      type="button"
                      onClick={() => handleToggleTag(obs)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "12px",
                        background: isChecked ? "rgba(212, 175, 55, 0.25)" : "var(--bg-input)",
                        border: `1px solid ${isChecked ? "var(--gold-primary)" : "var(--border-subtle)"}`,
                        color: isChecked ? "var(--gold-light)" : "var(--text-body)",
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        fontWeight: isChecked ? 600 : 400,
                        transition: "all 0.15s",
                      }}
                    >
                      {isChecked ? "✓ " : "+ "}
                      {obs}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional text remark */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Additional Suite Remarks (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 100ml warm Mahanarayan oil applied; patient fell into light sleep"
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
                className="input-control"
                style={{ padding: "14px 16px", fontSize: "0.95rem" }}
              />
            </div>

            {/* Giant Complete Action */}
            <button
              onClick={handleFinishAndComplete}
              disabled={submitting || !selectedSessionId}
              className="btn btn-success"
              style={{
                width: "100%",
                padding: "20px",
                fontSize: "1.25rem",
                borderRadius: "16px",
                marginTop: "auto",
                fontWeight: 700,
              }}
            >
              {submitting ? (
                "Logging Progress & Closing Suite..."
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  <span>Complete Procedure & Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistSuiteMode;
