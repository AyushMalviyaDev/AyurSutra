import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Activity,
  ArrowRight,
  CalendarPlus,
  DoorOpen,
  User,
  Heart,
  Droplets,
  FileText,
  Map,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import PatientHeader from "../../components/patient/PatientHeader";
import PanchakarmaProtocolTimeline from "../../components/clinical/PanchakarmaProtocolTimeline";
import MarmaBodyMap from "../../components/clinical/MarmaBodyMap";
import AyurvedicEHRReport from "../../components/clinical/AyurvedicEHRReport";
import { getMySessions } from "../../services/patientService";
import { getPatientTherapies } from "../../services/therapyService";

const PatientDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waterCount, setWaterCount] = useState(4);
  const [assessmentMood, setAssessmentMood] = useState(null);
  const [showEHR, setShowEHR] = useState(false);
  const [showMarmaMap, setShowMarmaMap] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [sessionsData, therapiesData] = await Promise.all([
          getMySessions().catch(() => []),
          getPatientTherapies().catch(() => []),
        ]);

        setSessions(Array.isArray(sessionsData) ? sessionsData : sessionsData?.results || []);
        setTherapies(Array.isArray(therapiesData) ? therapiesData : therapiesData?.results || []);
      } catch (error) {
        console.error("Failed to load patient dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const completedSessions = sessions.filter(
    (session) => session.status === "COMPLETED"
  ).length;

  const upcomingSessions = sessions.filter(
    (session) =>
      session.status === "SCHEDULED" ||
      session.status === "IN_PROGRESS"
  );

  const nextSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  const totalSessionsCount = sessions.length;
  const progressPercent =
    totalSessionsCount > 0
      ? Math.round((completedSessions / totalSessionsCount) * 100)
      : 0;

  return (
    <DashboardLayout>
      <PatientHeader />

      {/* Clinical Operations & Discovery Bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setShowMarmaMap(!showMarmaMap)}
          className={`btn btn-sm ${showMarmaMap ? "btn-primary" : "btn-secondary"}`}
        >
          <Map size={15} /> {showMarmaMap ? "Hide Body Map" : "Explore Marma & Dosha Map"}
        </button>
        <button
          onClick={() => setShowEHR(true)}
          className="btn btn-secondary btn-sm"
        >
          <FileText size={15} /> View Ayurvedic EHR Report
        </button>
      </div>

      {/* Marma Anatomical Map */}
      {showMarmaMap && (
        <div style={{ marginBottom: "24px" }}>
          <MarmaBodyMap />
        </div>
      )}

      {/* 3-Phase Panchakarma Protocol & Samsarjana Diet Engine */}
      <div style={{ marginBottom: "24px" }}>
        <PanchakarmaProtocolTimeline therapies={therapies} />
      </div>

      {/* Spotlight Next Appointment Banner */}
      {nextSession && (
        <div className="hero-spotlight">
          <div>
            <span className="spotlight-badge">
              <Sparkles size={13} /> Next Panchakarma Appointment
            </span>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                color: "#fff",
                fontSize: "1.45rem",
                margin: "8px 0 6px",
              }}
            >
              {nextSession.therapy_name}
            </h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                fontSize: "0.88rem",
                color: "var(--text-body)",
                alignItems: "center",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <Calendar size={15} style={{ color: "var(--gold-primary)" }} />
                {nextSession.session_date} at {nextSession.start_time?.slice(0, 5)}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <DoorOpen size={15} style={{ color: "var(--cyan-accent)" }} />
                {nextSession.room_name}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <User size={15} style={{ color: "var(--mint-accent)" }} />
                {nextSession.therapist_name}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/patient/sessions" className="btn btn-primary">
              <span>View Appointment</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper gold">
            <Sparkles size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Prescribed Therapies</span>
            <strong className="stat-value">{therapies.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper mint">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Sessions Completed</span>
            <strong className="stat-value">{completedSessions}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper cyan">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Upcoming Sessions</span>
            <strong className="stat-value">{upcomingSessions.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper terracotta">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Treatment Progress</span>
            <strong className="stat-value">{progressPercent}%</strong>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Left Column: Therapies & Itinerary */}
        <div>
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Sparkles size={19} style={{ color: "var(--gold-primary)" }} />
                  Prescribed Therapy Plan
                </h3>
                <p className="card-subtitle">
                  Your customized clinical Panchakarma treatments
                </p>
              </div>

              <Link to="/patient/schedule" className="btn btn-primary btn-sm">
                <CalendarPlus size={15} /> Book Slot
              </Link>
            </div>

            {loading ? (
              <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>Loading therapy plans...</p>
            ) : therapies.length === 0 ? (
              <div className="empty-state">
                <Sparkles size={36} className="empty-state-icon" />
                <h4>No Prescriptions Yet</h4>
                <p>Your Vaidya has not assigned a treatment plan yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {therapies.map((pt) => {
                  const done = pt.completed_sessions || 0;
                  const total = pt.sessions || 1;
                  const pct = Math.min(100, Math.round((done / total) * 100));

                  return (
                    <div
                      key={pt.id}
                      style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "14px",
                        padding: "18px 20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        transition: "border-color 0.2s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <h4
                            style={{
                              fontFamily: "var(--font-serif)",
                              fontSize: "1.1rem",
                              color: "var(--text-heading)",
                            }}
                          >
                            {pt.therapy_name || "Panchakarma Therapy"}
                          </h4>
                          {pt.notes && (
                            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                              {pt.notes}
                            </p>
                          )}
                        </div>

                        <span
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--gold-light)",
                            fontWeight: 600,
                            background: "rgba(212, 175, 55, 0.12)",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            border: "1px solid rgba(212, 175, 55, 0.25)",
                          }}
                        >
                          {done} of {total} Done
                        </span>
                      </div>

                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        <span>Status: <strong style={{ color: "var(--mint-accent)" }}>{pt.status}</strong></span>
                        <Link
                          to="/patient/schedule"
                          style={{
                            color: "var(--gold-primary)",
                            textDecoration: "none",
                            fontWeight: 600,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          Book Next <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Sessions List */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Clock size={19} style={{ color: "var(--cyan-accent)" }} />
                  Upcoming Appointments
                </h3>
                <p className="card-subtitle">Your scheduled sessions</p>
              </div>

              <Link to="/patient/sessions" className="btn btn-secondary btn-sm">
                View All
              </Link>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="empty-state">
                <Clock size={36} className="empty-state-icon" />
                <h4>No Upcoming Sessions</h4>
                <p>Book a slot to begin your therapy session.</p>
                <Link to="/patient/schedule" className="btn btn-primary btn-sm" style={{ marginTop: "12px" }}>
                  Schedule Session
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {upcomingSessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    style={{
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "12px",
                      padding: "14px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <h4 style={{ color: "var(--text-heading)", fontSize: "0.95rem" }}>
                        {session.therapy_name}
                      </h4>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        📅 {session.session_date} | ⏰ {session.start_time?.slice(0, 5)} - {session.end_time?.slice(0, 5)}
                      </p>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        🚪 Room: {session.room_name} • 👨‍⚕️ Therapist: {session.therapist_name}
                      </p>
                    </div>

                    <span className={`status-badge ${session.status?.toLowerCase()}`}>
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Daily Wellness & Dinacharya */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Water Tracker Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Droplets size={19} style={{ color: "var(--cyan-accent)" }} />
                Hydration (Ushnodaka)
              </h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "14px" }}>
              Drink warm herbal water regularly to eliminate ama (toxins).
            </p>

            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "2.5rem",
                  color: "var(--cyan-accent)",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {waterCount}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>/ 8 glasses logged</span>
            </div>

            <div className="progress-track" style={{ marginBottom: "16px" }}>
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #0284c7 0%, var(--cyan-accent) 100%)",
                  width: `${Math.min(100, (waterCount / 8) * 100)}%`,
                  borderRadius: "999px",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setWaterCount((prev) => Math.min(prev + 1, 12))}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                +1 Glass
              </button>
              <button
                type="button"
                onClick={() => setWaterCount(0)}
                className="btn btn-secondary btn-sm"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Self-Assessment Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Heart size={19} style={{ color: "var(--terracotta)" }} />
                Daily Swasthya Check
              </h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "14px" }}>
              How is your energy and digestion today?
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
              {["Energized (Prana)", "Calm & Light", "Heavy / Sluggish", "Fatigued"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAssessmentMood(item)}
                  style={{
                    padding: "10px 8px",
                    background: assessmentMood === item ? "rgba(212, 175, 55, 0.18)" : "var(--bg-input)",
                    border: `1px solid ${assessmentMood === item ? "var(--gold-primary)" : "var(--border-subtle)"}`,
                    color: assessmentMood === item ? "var(--gold-light)" : "var(--text-body)",
                    borderRadius: "10px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontWeight: assessmentMood === item ? 600 : 400,
                    transition: "all 0.15s",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            {assessmentMood && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "var(--mint-tint)",
                  border: "1px solid rgba(52, 211, 153, 0.3)",
                  borderRadius: "10px",
                  color: "var(--mint-accent)",
                  fontSize: "0.8rem",
                }}
              >
                ✓ Logged: {assessmentMood}. Your Vaidya will see this in consultation.
              </div>
            )}
          </div>
        </div>
      </div>

      <AyurvedicEHRReport isOpen={showEHR} onClose={() => setShowEHR(false)} />
    </DashboardLayout>
  );
};

export default PatientDashboard;