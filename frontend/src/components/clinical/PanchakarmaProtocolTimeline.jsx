import { useState } from "react";
import { Sparkles, Utensils, CheckCircle2 } from "lucide-react";

const PHASES = [
  {
    key: "PURVAKARMA",
    name: "1. Purvakarma (Preparation)",
    sanskrit: "पूर्व कर्म",
    timeline: "Days 1 to 3",
    description: "Deepana & Pachana (kindling Agni), followed by Abhyanga (oleation) and Swedana (sudation) to mobilize deep tissues toxins (Ama).",
    therapies: ["Abhyanga", "Swedana", "Shirodhara"],
  },
  {
    key: "PRADHANAKARMA",
    name: "2. Pradhanakarma (Elimination)",
    sanskrit: "प्रधान कर्म",
    timeline: "Days 4 to 7",
    description: "Root purification procedures that systematically eliminate mobilized doshic toxins from the cellular matrix.",
    therapies: ["Virechana", "Basti", "Nasya"],
  },
  {
    key: "PASCHATKARMA",
    name: "3. Paschatkarma & Samsarjana (Rejuvenation)",
    sanskrit: "पश्चात् कर्म",
    timeline: "Days 8 to 14",
    description: "Restoring digestive Agni through graduated Samsarjana Krama nutrition and cellular tissue rebuilding with Rasayana herbs.",
    therapies: ["Samsarjana Krama", "Rasayana"],
  },
];

const SAMSARJANA_MEALS = [
  {
    step: "Stage 1: Peya (Manda / Clear Rice Water)",
    timing: "Post-Detox Meals 1 & 2",
    dosha: "Gently ignites weakened Jatharagni without provoking Pitta",
    recipe: "Slowly boiled red rice water strained clear, served warm with a pinch of rock salt (Saindhava).",
  },
  {
    step: "Stage 2: Vilepi (Thick Rice Gruel)",
    timing: "Post-Detox Meals 3 & 4",
    dosha: "Provides light nourishment while stabilizing digestive tract",
    recipe: "Soft, four-times cooked broken rice, semi-solid texture with toasted cumin and fresh ginger.",
  },
  {
    step: "Stage 3: Mudga Yusha (Mung Broth)",
    timing: "Post-Detox Meals 5 & 6",
    dosha: "Supplies essential plant amino acids without taxing digestion",
    recipe: "Golden split mung lentils simmered with turmeric, coriander, and tempered in half-teaspoon pure cow ghee.",
  },
  {
    step: "Stage 4: Odana (Whole Cooked Grains with Ghee)",
    timing: "Post-Detox Meal 7 onwards",
    dosha: "Complete metabolic normalization and cellular strength (Bala)",
    recipe: "Steamed aged Shali rice with light vegetable stew (lauki / bottle gourd) and cumin infusion.",
  },
];

const PanchakarmaProtocolTimeline = ({ therapies = [] }) => {
  const [activeTab, setActiveTab] = useState("timeline"); // "timeline" or "samsarjana"

  // Infer current phase from prescribed therapies
  const hasPradhana = therapies.some(
    (t) => t.phase === "PRADHANAKARMA" || ["Virechana", "Basti", "Nasya"].includes(t.therapy_name)
  );
  const currentPhaseIndex = hasPradhana ? 1 : 0;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <Sparkles size={18} style={{ color: "var(--gold-primary)" }} />
            Panchakarma Protocol & Phase Governance
          </h3>
          <p className="card-subtitle">
            Authentic 3-phase clinical detoxification and metabolic restoration roadmap
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`btn btn-sm ${activeTab === "timeline" ? "btn-primary" : "btn-secondary"}`}
          >
            3-Phase Flow
          </button>
          <button
            onClick={() => setActiveTab("samsarjana")}
            className={`btn btn-sm ${activeTab === "samsarjana" ? "btn-primary" : "btn-secondary"}`}
          >
            <Utensils size={13} /> Samsarjana Diet
          </button>
        </div>
      </div>

      {activeTab === "timeline" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
          {PHASES.map((phase, idx) => {
            const isCompleted = idx < currentPhaseIndex;
            const isCurrent = idx === currentPhaseIndex;

            return (
              <div
                key={phase.key}
                style={{
                  padding: "20px",
                  borderRadius: "14px",
                  background: isCurrent
                    ? "linear-gradient(135deg, rgba(212, 175, 55, 0.14) 0%, rgba(16, 36, 26, 0.85) 100%)"
                    : "var(--bg-input)",
                  border: isCurrent
                    ? "1.5px solid var(--gold-primary)"
                    : "1px solid var(--border-subtle)",
                  boxShadow: isCurrent ? "var(--gold-glow)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                  position: "relative",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: isCurrent ? "var(--gold-light)" : "var(--text-muted)",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {phase.timeline}
                    </span>

                    {isCompleted ? (
                      <span className="status-badge completed">
                        <CheckCircle2 size={12} /> Done
                      </span>
                    ) : isCurrent ? (
                      <span className="status-badge in_progress">
                        ● Active Phase
                      </span>
                    ) : (
                      <span className="status-badge scheduled">
                        Upcoming
                      </span>
                    )}
                  </div>

                  <h4
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.15rem",
                      color: "var(--text-heading)",
                      marginBottom: "2px",
                    }}
                  >
                    {phase.name}
                  </h4>
                  <div style={{ fontSize: "0.8rem", color: "var(--gold-primary)", marginBottom: "10px" }}>
                    {phase.sanskrit}
                  </div>

                  <p style={{ fontSize: "0.84rem", color: "var(--text-body)", lineHeight: 1.5, marginBottom: "14px" }}>
                    {phase.description}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: "10px",
                    borderTop: "1px solid var(--border-subtle)",
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <strong style={{ color: "var(--text-body)" }}>Key Modalities:</strong>{" "}
                  {phase.therapies.join(", ")}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <div
            style={{
              padding: "14px 18px",
              background: "rgba(212, 175, 55, 0.12)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: "12px",
              marginBottom: "20px",
              fontSize: "0.86rem",
              color: "var(--text-heading)",
              lineHeight: 1.5,
            }}
          >
            <strong>The Science of Samsarjana Krama:</strong> After intensive purification (Virechana or Basti), the metabolic digestive flame (Jatharagni) is in an infant-like delicate state. Consuming regular heavy food will produce toxic residue (*Ama*). This classical 4-stage graduated regimen rekindles the digestive fire systematically.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            {SAMSARJANA_MEALS.map((meal, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ fontSize: "0.72rem", color: "var(--mint-accent)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {meal.timing}
                </div>
                <h4 style={{ fontFamily: "var(--font-serif)", color: "var(--gold-light)", fontSize: "1rem" }}>
                  {meal.step}
                </h4>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  <strong>Physiological Aim:</strong> {meal.dosha}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-body)", background: "rgba(0,0,0,0.25)", padding: "10px", borderRadius: "8px", marginTop: "auto" }}>
                  <strong>Preparation:</strong> {meal.recipe}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PanchakarmaProtocolTimeline;
