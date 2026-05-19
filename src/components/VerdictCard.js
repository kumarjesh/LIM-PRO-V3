import { useEffect, useRef } from "react";
import { calculateTargets, getTodayLog, getAgeNote } from "../services/storageService";

const VERDICT_CONFIG = {
  GREEN:  { bg: "linear-gradient(160deg,#052e16,#14532d)", glow: "#22c55e", ring: "#4ade80", icon: "✅", label: "DRINK IT",    badgeBg: "#dcfce7", badgeText: "#14532d" },
  YELLOW: { bg: "linear-gradient(160deg,#1c1400,#3d2e00)", glow: "#eab308", ring: "#facc15", icon: "⚠️", label: "THINK TWICE", badgeBg: "#fef9c3", badgeText: "#713f12" },
  RED:    { bg: "linear-gradient(160deg,#1c0000,#3b0a0a)", glow: "#ef4444", ring: "#f87171", icon: "🚫", label: "SKIP IT",     badgeBg: "#fee2e2", badgeText: "#7f1d1d" },
};

function MacroPie({ protein, carbs, fat }) {
  const total = (protein || 0) * 4 + (carbs || 0) * 4 + (fat || 0) * 9;
  if (total === 0) return null;
  const slices = [
    { pct: ((protein || 0) * 4 / total) * 100, color: "#22d3ee", label: "Protein", val: protein, unit: "g" },
    { pct: ((carbs || 0) * 4 / total) * 100,   color: "#f97316", label: "Carbs",   val: carbs,   unit: "g" },
    { pct: ((fat || 0) * 9 / total) * 100,     color: "#a78bfa", label: "Fat",     val: fat,     unit: "g" },
  ];
  const R = 40, CX = 50, CY = 50;
  let paths = [], start = -90;
  slices.forEach(({ pct, color }) => {
    const angle = (pct / 100) * 360;
    const end = start + angle;
    const r2d = Math.PI / 180;
    const x1 = CX + R * Math.cos(start * r2d), y1 = CY + R * Math.sin(start * r2d);
    const x2 = CX + R * Math.cos(end * r2d),   y2 = CY + R * Math.sin(end * r2d);
    if (pct > 1) paths.push(
      <path key={color} d={`M${CX},${CY} L${x1},${y1} A${R},${R} 0 ${angle > 180 ? 1 : 0},1 ${x2},${y2} Z`} fill={color} opacity={0.85} />
    );
    start = end;
  });
  return (
    <div className="pie-wrap">
      <svg width="90" height="90" viewBox="0 0 100 100">
        {paths}
        <circle cx={CX} cy={CY} r={24} fill="#0d1117" />
        <text x={CX} y={CY + 4} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">MACROS</text>
      </svg>
      <div className="pie-legend">
        {slices.map(({ color, label, val, unit }) => (
          <div key={label} className="legend-item">
            <div className="legend-dot" style={{ background: color }} />
            <span>{label}:</span>
            <span style={{ color: "#fff", fontWeight: 700 }}>{val ?? 0}{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function speakSummary(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.95; utt.pitch = 1;
  window.speechSynthesis.speak(utt);
}

export default function VerdictCard({ result, image, ml, profile, onRescan, onNew }) {
  const vc = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.RED;
  const spokenRef = useRef(false);

  useEffect(() => {
    if (!spokenRef.current && result.summary) {
      setTimeout(() => speakSummary(result.summary), 600);
      spokenRef.current = true;
    }
  }, [result.summary]);

  // Personalised remaining budget
  let remCal = null, remSugar = null;
  if (profile) {
    const targets = calculateTargets(profile);
    const log = getTodayLog();
    const usedCal   = log.reduce((s, i) => s + (i.calories || 0), 0);
    const usedSugar = log.reduce((s, i) => s + (i.sugar_g || 0), 0);
    remCal   = Math.max(targets.dailyCalories - usedCal, 0);
    remSugar = Math.max(targets.dailySugar - usedSugar, 0);
  }

  const ageNote = profile ? getAgeNote(profile.age) : null;

  return (
    <div className="verdict-appear">
      {/* Main verdict card */}
      <div style={{
        background: vc.bg, borderRadius: 22, padding: "26px 22px",
        border: `1.5px solid ${vc.ring}35`,
        boxShadow: `0 0 48px ${vc.glow}18`,
        marginBottom: 14, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)",
          width: 140, height: 140, borderRadius: "50%",
          background: `radial-gradient(circle,${vc.glow}28,transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 46, marginBottom: 6 }}>{vc.icon}</div>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 34, letterSpacing: 5, color: vc.ring, lineHeight: 1, marginBottom: 8 }}>
            {vc.label}
          </div>
          <div style={{ display: "inline-block", background: vc.badgeBg, color: vc.badgeText, borderRadius: 50, padding: "4px 14px", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
            {result.brand ? `${result.brand} · ` : ""}{result.product || "PRODUCT"}
          </div>
        </div>

        {/* Macro pills */}
        <div className="macro-row">
          {[
            { label: "CALORIES", val: result.calories,  unit: "kcal", color: "#f97316" },
            { label: "SUGAR",    val: result.sugar_g,   unit: "g",    color: "#eab308" },
            { label: "PROTEIN",  val: result.protein_g, unit: "g",    color: "#22d3ee" },
            { label: "FAT",      val: result.fat_g,     unit: "g",    color: "#a78bfa" },
          ].map(({ label, val, unit, color }) => (
            <div key={label} className="macro-pill">
              <div className="macro-val" style={{ color }}>{val ?? "—"}<span className="macro-unit">{unit}</span></div>
              <div className="macro-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Personalised remaining budget */}
        {remCal !== null && (
          <div style={{
            background: "rgba(0,0,0,0.25)", borderRadius: 12,
            padding: "10px 14px", marginBottom: 12,
            display: "flex", justifyContent: "space-around",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: remCal < 200 ? "#ef4444" : "#22c55e" }}>{remCal}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>KCAL LEFT TODAY</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: remSugar < 5 ? "#ef4444" : "#eab308" }}>{remSugar?.toFixed(1)}g</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>SUGAR LEFT TODAY</div>
            </div>
            {profile && (
              <>
                <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 1, marginBottom: 2 }}>YOUR LEVEL</div>
                  <div style={{ fontSize: 10, color: "#22d3ee", fontWeight: 700 }}>
                    {["", "🛋️", "🚶", "🏃", "💪", "⚡"][profile.activityLevel]}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Qty chip */}
        <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 14, fontFamily: "monospace" }}>
          Based on <strong style={{ color: "rgba(255,255,255,0.6)" }}>{ml}ml</strong> consumed
        </div>

        {/* Summary */}
        <div style={{
          background: "rgba(0,0,0,0.3)", borderRadius: 14, padding: "14px 16px",
          fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.5, marginBottom: 10,
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <span>{result.summary}</span>
          <button onClick={() => speakSummary(result.summary)} title="Read aloud"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, flexShrink: 0, padding: 0 }}>
            🔊
          </button>
        </div>

        {/* Tip */}
        {result.tip && (
          <div style={{ background: `${vc.glow}12`, border: `1px solid ${vc.glow}28`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: vc.ring, fontWeight: 600 }}>
            💡 {result.tip}
          </div>
        )}

        {/* Age note */}
        {(ageNote || result.age_note) && (
          <div style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 10, padding: "9px 14px", fontSize: 12, color: "#fde68a", marginTop: 10 }}>
            ℹ️ {result.age_note || ageNote}
          </div>
        )}
      </div>

      {/* Macro pie */}
      <MacroPie protein={result.protein_g} carbs={result.carbs_g} fat={result.fat_g} />

      {/* Ingredient flags */}
      {((result.flags_bad?.length > 0) || (result.flags_good?.length > 0)) && (
        <div className="card">
          <div className="section-heading" style={{ marginBottom: 10 }}>INGREDIENT REPORT</div>
          <div className="flag-row">
            {result.flags_bad?.map((f) => <span key={f} className="flag-chip flag-bad">🚩 {f}</span>)}
            {result.flags_good?.map((f) => <span key={f} className="flag-chip flag-good">✅ {f}</span>)}
          </div>
        </div>
      )}

      {image && (
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 14, maxHeight: 130 }}>
          <img src={image} alt="scanned pack" style={{ width: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}

      <button className="btn btn-secondary" style={{ marginBottom: 8 }} onClick={onRescan}>🔄 CHANGE QUANTITY</button>
      <button className="btn btn-primary" onClick={onNew}>📷 SCAN ANOTHER DRINK</button>
    </div>
  );
}
