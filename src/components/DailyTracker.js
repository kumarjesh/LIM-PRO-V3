import { calculateTargets } from "../services/storageService";

const VERDICT_COLOR = { GREEN: "#22c55e", YELLOW: "#eab308", RED: "#ef4444" };

function CircleRing({ value, max, color, label, unit, size = 110 }) {
  const pct = Math.min(value / max, 1);
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", margin: "0 auto" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none"
          stroke={pct > 0.85 ? "#ef4444" : pct > 0.6 ? "#eab308" : color}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ * 0.25}
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
        <text x="50" y="46" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="'Bebas Neue',cursive" letterSpacing="1">
          {value}
        </text>
        <text x="50" y="58" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="monospace">
          {unit}
        </text>
      </svg>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>/ {max} {unit}</div>
    </div>
  );
}

export default function DailyTracker({ log, profile }) {
  const targets = profile ? calculateTargets(profile) : { dailyCalories: 2000, dailySugar: 50, dailyProtein: 60, dailyFat: 65 };

  const totalCal     = log.reduce((s, i) => s + (i.calories || 0), 0);
  const totalSugar   = log.reduce((s, i) => s + (i.sugar_g || 0), 0);
  const totalProtein = log.reduce((s, i) => s + (i.protein_g || 0), 0);
  const totalFat     = log.reduce((s, i) => s + (i.fat_g || 0), 0);

  const remCal   = Math.max(targets.dailyCalories - totalCal, 0);
  const calPct   = Math.round((totalCal / targets.dailyCalories) * 100);
  const sugarPct = Math.round((totalSugar / targets.dailySugar) * 100);

  const barColor = calPct < 60 ? "#22c55e" : calPct < 85 ? "#eab308" : "#ef4444";

  return (
    <div className="fade-in">

      {/* Personalised greeting */}
      {profile && (
        <div style={{
          background: "linear-gradient(135deg,rgba(34,211,238,0.06),rgba(167,139,250,0.06))",
          border: "1px solid rgba(34,211,238,0.12)",
          borderRadius: 14, padding: "12px 16px", marginBottom: 14,
          fontSize: 13, color: "rgba(255,255,255,0.6)",
        }}>
          👋 <strong style={{ color: "#fff" }}>{profile.name}</strong> · {profile.age}y · {["", "🛋️ Sedentary", "🚶 Light", "🏃 Moderate", "💪 Very Active", "⚡ Extreme"][profile.activityLevel]}
          <span style={{ float: "right", color: "#22d3ee", fontWeight: 700 }}>{targets.dailyCalories} kcal goal</span>
        </div>
      )}

      {/* Rings row */}
      <div className="card">
        <div className="section-heading" style={{ marginBottom: 4 }}>TODAY FROM DRINKS</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>Based on your personalised daily targets</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "space-around" }}>
          <CircleRing value={totalCal} max={targets.dailyCalories} color="#f97316" label="CALORIES" unit="kcal" />
          <CircleRing value={parseFloat(totalSugar.toFixed(1))} max={targets.dailySugar} color="#eab308" label="SUGAR" unit="g" />
          <CircleRing value={parseFloat(totalProtein.toFixed(1))} max={targets.dailyProtein} color="#22d3ee" label="PROTEIN" unit="g" />
        </div>
      </div>

      {/* Remaining budget */}
      <div className="card" style={{ background: remCal === 0 ? "rgba(239,68,68,0.06)" : "rgba(34,197,94,0.05)", border: `1px solid ${remCal === 0 ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.15)"}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, color: remCal === 0 ? "#ef4444" : "#22c55e", letterSpacing: 1 }}>
              {remCal}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>KCAL REMAINING TODAY</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontFamily: "'Bebas Neue',cursive", color: barColor }}>{calPct}%</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>OF DAILY GOAL USED</div>
          </div>
        </div>

        <div className="progress-track" style={{ marginTop: 12 }}>
          <div className="progress-fill" style={{ width: `${Math.min(calPct, 100)}%`, background: barColor }} />
        </div>
      </div>

      {/* Sugar budget */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div className="section-heading" style={{ marginBottom: 0 }}>🍬 SUGAR BUDGET</div>
          <span style={{ fontSize: 12, color: sugarPct > 85 ? "#ef4444" : sugarPct > 60 ? "#eab308" : "#22c55e", fontWeight: 700 }}>
            {totalSugar.toFixed(1)}g / {targets.dailySugar}g
          </span>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
          WHO limit: 10% of your {targets.dailyCalories} kcal daily goal
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{
            width: `${Math.min(sugarPct, 100)}%`,
            background: sugarPct > 85 ? "#ef4444" : sugarPct > 60 ? "#eab308" : "#eab308",
          }} />
        </div>
        {sugarPct > 85 && (
          <div style={{ fontSize: 11, color: "#f87171", marginTop: 6 }}>
            ⚠️ Approaching your daily sugar limit. Choose water or zero-sugar drinks next.
          </div>
        )}
      </div>

      {/* Macro totals */}
      <div className="card">
        <div className="section-heading" style={{ marginBottom: 12 }}>TODAY'S MACRO TOTALS</div>
        <div className="macro-row">
          {[
            { label: "CALORIES", val: totalCal, unit: "kcal", color: "#f97316" },
            { label: "SUGAR", val: totalSugar.toFixed(1), unit: "g", color: "#eab308" },
            { label: "PROTEIN", val: totalProtein.toFixed(1), unit: "g", color: "#22d3ee" },
            { label: "FAT", val: totalFat.toFixed(1), unit: "g", color: "#a78bfa" },
          ].map(({ label, val, unit, color }) => (
            <div key={label} className="macro-pill">
              <div className="macro-val" style={{ color }}>{val}<span className="macro-unit">{unit}</span></div>
              <div className="macro-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Verdict breakdown */}
        <div style={{ display: "flex", gap: 8 }}>
          {[["GREEN", "✅", "Safe"], ["YELLOW", "⚠️", "Caution"], ["RED", "🚫", "Avoid"]].map(([v, icon, label]) => {
            const count = log.filter((i) => i.verdict === v).length;
            return (
              <div key={v} style={{
                flex: 1, background: "rgba(255,255,255,0.03)",
                border: `1px solid ${VERDICT_COLOR[v]}25`,
                borderRadius: 10, padding: "10px 4px", textAlign: "center",
              }}>
                <div style={{ fontSize: 16 }}>{icon}</div>
                <div style={{ fontSize: 18, fontFamily: "'Bebas Neue',cursive", color: VERDICT_COLOR[v] }}>{count}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {log.length === 0 && (
        <div style={{ textAlign: "center", padding: "30px 0", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
          No scans today. Go scan a drink! 📷
        </div>
      )}
    </div>
  );
}
