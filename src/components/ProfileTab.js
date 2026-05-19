import { useState } from "react";
import { saveProfile, calculateTargets, ACTIVITY_LABELS, GOAL_LABELS, getAgeNote } from "../services/storageService";

export default function ProfileTab({ profile, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const targets = calculateTargets(profile);
  const ageNote = getAgeNote(profile.age);

  const save = () => {
    const updated = {
      ...form,
      age: parseInt(form.age),
      weight: parseFloat(form.weight),
      height: parseFloat(form.height),
      activityLevel: parseInt(form.activityLevel),
    };
    saveProfile(updated);
    onUpdate(updated);
    setEditing(false);
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid #22d3ee",
    borderRadius: 10,
    padding: "10px 12px",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    outline: "none",
    fontFamily: "inherit",
    marginBottom: 10,
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div className="section-heading">👤 MY PROFILE</div>
          <div className="section-sub">YOUR PERSONALISED TARGETS</div>
        </div>
        <button
          onClick={() => { setEditing(!editing); setForm({ ...profile }); }}
          style={{
            background: editing ? "rgba(239,68,68,0.1)" : "rgba(34,211,238,0.1)",
            border: `1px solid ${editing ? "rgba(239,68,68,0.3)" : "rgba(34,211,238,0.25)"}`,
            borderRadius: 8, padding: "6px 14px",
            color: editing ? "#fca5a5" : "#22d3ee",
            fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {editing ? "CANCEL" : "✏️ EDIT"}
        </button>
      </div>

      {/* Age note */}
      {ageNote && (
        <div style={{
          background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)",
          borderRadius: 10, padding: "10px 14px",
          fontSize: 12, color: "#fde68a", marginBottom: 14,
        }}>
          ℹ️ {ageNote}
        </div>
      )}

      {/* Edit form */}
      {editing ? (
        <div className="card">
          <div className="section-heading" style={{ marginBottom: 14 }}>EDIT PROFILE</div>

          {[
            ["Name", "name", "text", "Your name"],
            ["Age", "age", "number", "Years"],
            ["Weight (kg)", "weight", "number", "kg"],
            ["Height (cm)", "height", "number", "cm"],
          ].map(([label, key, type, placeholder]) => (
            <div key={key}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1, marginBottom: 4, fontFamily: "monospace" }}>{label.toUpperCase()}</div>
              <input type={type} placeholder={placeholder} value={form[key]}
                onChange={(e) => set(key, e.target.value)} style={inputStyle} />
            </div>
          ))}

          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1, marginBottom: 8, fontFamily: "monospace" }}>GENDER</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {[["male", "♂ Male"], ["female", "♀ Female"], ["other", "⊕ Other"]].map(([v, l]) => (
              <button key={v} onClick={() => set("gender", v)} style={{
                flex: 1, padding: "9px 4px",
                background: form.gender === v ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${form.gender === v ? "#22d3ee" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8, color: form.gender === v ? "#22d3ee" : "rgba(255,255,255,0.5)",
                fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>{l}</button>
            ))}
          </div>

          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1, marginBottom: 8, fontFamily: "monospace" }}>ACTIVITY LEVEL</div>
          {[1, 2, 3, 4, 5].map((v) => (
            <button key={v} onClick={() => set("activityLevel", v)} style={{
              width: "100%", padding: "9px 12px", textAlign: "left", marginBottom: 6,
              background: form.activityLevel === v ? "rgba(34,211,238,0.1)" : "rgba(255,255,255,0.03)",
              border: `1.5px solid ${form.activityLevel === v ? "#22d3ee" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 10, color: form.activityLevel === v ? "#22d3ee" : "rgba(255,255,255,0.6)",
              fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>{ACTIVITY_LABELS[v]}</button>
          ))}

          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1, margin: "12px 0 8px", fontFamily: "monospace" }}>GOAL</div>
          {Object.entries(GOAL_LABELS).map(([v, l]) => (
            <button key={v} onClick={() => set("goal", v)} style={{
              width: "100%", padding: "9px 12px", textAlign: "left", marginBottom: 6,
              background: form.goal === v ? "rgba(34,211,238,0.1)" : "rgba(255,255,255,0.03)",
              border: `1.5px solid ${form.goal === v ? "#22d3ee" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 10, color: form.goal === v ? "#22d3ee" : "rgba(255,255,255,0.6)",
              fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>{l}</button>
          ))}

          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={save}>
            💾 SAVE PROFILE
          </button>
        </div>
      ) : (
        <>
          {/* Profile summary card */}
          <div className="card" style={{ background: "linear-gradient(135deg,rgba(34,211,238,0.06),rgba(167,139,250,0.06))", border: "1px solid rgba(34,211,238,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "linear-gradient(135deg,#0891b2,#7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0,
              }}>
                {profile.gender === "female" ? "👩" : "👨"}
              </div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, letterSpacing: 2, color: "#fff" }}>{profile.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  {profile.age}y · {profile.weight}kg · {profile.height}cm
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 50, padding: "4px 12px", fontSize: 11, color: "#22d3ee", fontWeight: 700 }}>
                {ACTIVITY_LABELS[profile.activityLevel]}
              </span>
              <span style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 50, padding: "4px 12px", fontSize: 11, color: "#a78bfa", fontWeight: 700 }}>
                {GOAL_LABELS[profile.goal]}
              </span>
            </div>
          </div>

          {/* Daily targets */}
          <div className="card">
            <div className="section-heading" style={{ marginBottom: 12 }}>YOUR DAILY TARGETS</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
              Calculated via Mifflin-St Jeor formula · WHO guidelines applied
            </div>
            {[
              ["🔥 Calories", `${targets.dailyCalories} kcal`, "#f97316"],
              ["🍬 Sugar Limit", `${targets.dailySugar}g`, "#eab308"],
              ["💪 Protein", `${targets.dailyProtein}g`, "#22d3ee"],
              ["🥑 Fat", `${targets.dailyFat}g`, "#a78bfa"],
              ["⚡ BMR", `${targets.bmr} kcal`, "rgba(255,255,255,0.4)"],
              ["🔁 TDEE", `${targets.tdee} kcal`, "rgba(255,255,255,0.4)"],
            ].map(([label, val, color]) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{label}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color, fontFamily: "'Bebas Neue',cursive", letterSpacing: 1 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Personalised thresholds info */}
          <div className="card">
            <div className="section-heading" style={{ marginBottom: 10 }}>YOUR SCAN THRESHOLDS</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>
              Each drink is judged against YOUR personal limits — not generic WHO values
            </div>
            {(() => {
              const t = require("../services/storageService").getVerdictThresholds(profile);
              return [
                ["🟢 GREEN if calories ≤", `${t.calGreenMax} kcal`],
                ["🟡 YELLOW if calories ≤", `${t.calYellowMax} kcal`],
                ["🟢 GREEN if sugar ≤", `${t.sugarGreenMax}g`],
                ["🟡 YELLOW if sugar ≤", `${t.sugarYellowMax}g`],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 12 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{val}</span>
                </div>
              ));
            })()}
          </div>
        </>
      )}
    </div>
  );
}
