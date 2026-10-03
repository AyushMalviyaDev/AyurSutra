import { useState } from "react";
import { Sparkles, Activity, Info } from "lucide-react";

const MARMA_POINTS = [
  {
    id: "shiro",
    name: "Shiro Marma (Crown / Cranium)",
    region: "Head & Cranium",
    x: 150,
    y: 45,
    dosha: "Vata (Prana) & Pitta (Sadhaka)",
    therapy: "Shirodhara & Nasya",
    purpose: "Relieves insomnia, mental fatigue, hypertension, and sensory overload through soothing herbal oil stream.",
  },
  {
    id: "greeva",
    name: "Manya & Greeva Marma (Cervical Spine)",
    region: "Neck & Upper Spine",
    x: 150,
    y: 92,
    dosha: "Vata (Udana & Vyana)",
    therapy: "Greeva Basti & Abhyanga",
    purpose: "Pacifies cervical stiffness, neck strain, and enhances arterial circulation to the brain.",
  },
  {
    id: "hridaya",
    name: "Hridaya Marma (Cardiac Center)",
    region: "Thorax / Center Chest",
    x: 150,
    y: 145,
    dosha: "Pitta (Sadhaka) & Kapha (Avalambaka)",
    therapy: "Hrid Basti & Swedana",
    purpose: "Nourishes the vital prana channel, relieves emotional stress, and eases muscular constriction.",
  },
  {
    id: "nabhi",
    name: "Nabhi Marma (Solar Plexus & Umbilicus)",
    region: "Abdomen & Digestive Core",
    x: 150,
    y: 205,
    dosha: "Pitta (Pachaka) & Vata (Samana)",
    therapy: "Virechana & Udara Abhyanga",
    purpose: "Seat of digestive fire (Jatharagni); essential for metabolic toxin (Ama) expulsion.",
  },
  {
    id: "kati",
    name: "Kati & Nitamba Marma (Lumbosacral)",
    region: "Lower Back & Pelvis",
    x: 150,
    y: 260,
    dosha: "Vata (Apana Vata)",
    therapy: "Kati Basti & Patra Pinda Swedana",
    purpose: "Primary seat of Vata; relieves lumbar disc compression, sciatica, and chronic spinal tension.",
  },
  {
    id: "janu",
    name: "Janu Marma (Knee Joints)",
    region: "Bilateral Knees",
    x: 150,
    y: 380,
    dosha: "Vata (Vyana) & Kapha (Shleshaka)",
    therapy: "Janu Basti & Patra Potali",
    purpose: "Replenishes synovial fluid (Shleshaka Kapha), reduces osteoarthritic friction and inflammation.",
  },
  {
    id: "pada",
    name: "Talahridaya Marma (Plantar Center)",
    region: "Feet Soles",
    x: 150,
    y: 475,
    dosha: "Vata (Vyana & Apana)",
    therapy: "Padabhyanga (Foot Oleation)",
    purpose: "Calms sensory nerves, cools eye heat (Chakshushya), and promotes deep, uninterrupted sleep.",
  },
];

const MarmaBodyMap = ({ onSelectTherapy }) => {
  const [selectedPoint, setSelectedPoint] = useState(MARMA_POINTS[4]); // Default to Kati

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <Activity size={18} style={{ color: "var(--gold-primary)" }} />
            Interactive Marma & Dosha Anatomical Map
          </h3>
          <p className="card-subtitle">
            Explore classical vital energy centers (Marmas) and targeted Panchakarma therapy zones
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.3fr",
          gap: "24px",
          alignItems: "center",
        }}
      >
        {/* SVG Silhouette with interactive Marma Hotspots */}
        <div
          style={{
            position: "relative",
            background: "radial-gradient(circle, rgba(16, 36, 26, 0.9) 0%, rgba(6, 14, 10, 0.95) 100%)",
            border: "1px solid var(--border-card)",
            borderRadius: "16px",
            padding: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "inset 0 0 30px rgba(0, 0, 0, 0.6)",
          }}
        >
          <svg
            viewBox="0 0 300 520"
            style={{ width: "100%", maxHeight: "420px", display: "block" }}
          >
            {/* Ambient Body Aura */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Stylized Human Figure Silhouette */}
            <path
              d="M 150,20 
                 C 136,20 126,30 126,45 
                 C 126,60 134,70 142,75 
                 L 138,88 
                 C 120,95 95,115 85,150 
                 L 60,230 
                 C 55,245 65,255 75,250 
                 L 95,185 
                 L 100,280 
                 L 110,360 
                 L 105,480 
                 C 105,495 125,495 125,480 
                 L 135,360 
                 L 145,280 
                 L 155,280 
                 L 165,360 
                 L 175,480 
                 C 175,495 195,495 195,480 
                 L 190,360 
                 L 200,280 
                 L 205,185 
                 L 225,250 
                 C 235,255 245,245 240,230 
                 L 215,150 
                 C 205,115 180,95 162,88 
                 L 158,75 
                 C 166,70 174,60 174,45 
                 C 174,30 164,20 150,20 Z"
              fill="rgba(20, 48, 34, 0.45)"
              stroke="rgba(52, 211, 153, 0.35)"
              strokeWidth="1.5"
            />

            {/* Spine Energy Meridian (Sushumna Nadi) */}
            <line
              x1="150"
              y1="45"
              x2="150"
              y2="280"
              stroke="rgba(212, 175, 55, 0.3)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Marma Hotspots */}
            {MARMA_POINTS.map((pt) => {
              const isSelected = selectedPoint.id === pt.id;

              return (
                <g
                  key={pt.id}
                  onClick={() => setSelectedPoint(pt)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Pulse Ring when selected */}
                  {isSelected && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="16"
                      fill="none"
                      stroke="var(--gold-primary)"
                      strokeWidth="2"
                      opacity="0.8"
                      filter="url(#glow)"
                    >
                      <animate
                        attributeName="r"
                        values="10;22;10"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.9;0.1;0.9"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Hotspot Outer Circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? "9" : "7"}
                    fill={isSelected ? "var(--gold-primary)" : "rgba(16, 185, 129, 0.85)"}
                    stroke={isSelected ? "#fff" : "rgba(255, 255, 255, 0.5)"}
                    strokeWidth="2"
                    filter="url(#glow)"
                  />

                  {/* Hotspot Inner Dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="3"
                    fill={isSelected ? "var(--bg-canvas)" : "#fff"}
                  />
                </g>
              );
            })}
          </svg>

          <span
            style={{
              position: "absolute",
              bottom: "12px",
              left: "14px",
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Info size={12} /> Tap points to inspect
          </span>
        </div>

        {/* Selected Marma Clinical Details */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(20, 42, 31, 0.8) 0%, rgba(12, 26, 19, 0.9) 100%)",
            border: "1px solid var(--border-gold)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--gold-primary)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              VITAL ENERGY POINT
            </span>

            <span
              style={{
                fontSize: "0.78rem",
                padding: "3px 10px",
                borderRadius: "12px",
                background: "var(--mint-tint)",
                color: "var(--mint-accent)",
                border: "1px solid rgba(52, 211, 153, 0.3)",
                fontWeight: 600,
              }}
            >
              {selectedPoint.region}
            </span>
          </div>

          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.4rem",
              color: "var(--text-heading)",
              marginBottom: "8px",
            }}
          >
            {selectedPoint.name}
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              margin: "16px 0",
              fontSize: "0.88rem",
            }}
          >
            <div style={{ background: "var(--bg-input)", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>
                Governing Dosha Axis:
              </span>
              <strong style={{ color: "var(--gold-light)" }}>{selectedPoint.dosha}</strong>
            </div>

            <div style={{ background: "var(--bg-input)", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>
                Panchakarma Protocol:
              </span>
              <strong style={{ color: "var(--mint-accent)" }}>{selectedPoint.therapy}</strong>
            </div>
          </div>

          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-body)",
              lineHeight: 1.5,
              marginBottom: "20px",
            }}
          >
            {selectedPoint.purpose}
          </p>

          {onSelectTherapy && (
            <button
              onClick={() => onSelectTherapy(selectedPoint.therapy)}
              className="btn btn-primary"
              style={{ width: "100%", padding: "11px" }}
            >
              <Sparkles size={16} />
              <span>Select {selectedPoint.therapy.split("&")[0].trim()}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarmaBodyMap;
