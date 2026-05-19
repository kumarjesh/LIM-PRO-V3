import { useState } from "react";
import { saveProfile, calculateTargets, ACTIVITY_LABELS, GOAL_LABELS } from "../services/storageService";

const STEPS = ["basics", "body", "activity", "goal", "summary"];

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1.5px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: "13px 14px",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  outline: "none",
  fontFamily: "inherit",
  marginBottom: 12,
};

const focusStyle = { borderColor: "#22d3ee" };

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", age: "", gender: "male",
    weight: "", height: "",
    activityLevel: 3,
    goal: "maintenance",
  });
  const [focused, setFocused] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return form.name.trim() && form.age && form.gender;
    if (step === 1) return form.weight && form.height;
    return true;
  };

  const finish = () => {
    const profile = {
      ...form,
      age: parseInt(form.age),
      weight: parseFloat(form.weight),
      height: parseFloat(form.height),
      activityLevel: parseInt(form.activityLevel),
    };
    saveProfile(profile);
    onComplete(profile);
  };

  const targets = form.age && form.weight && form.height
    ? calculateTargets({
        ...form,
        age: parseInt(form.age),
        weight: parseFloat(form.weight),
        height: parseFloat(form.height),
        activityLevel: parseInt(form.activityLevel),
      })
    : null;

  return (
    <div style={{
      minHeight: "100vh", background: "#07090d",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 20px", fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        select option { background: #141a23; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>⚡</div>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: 32, letterSpacing: 4, color: "#22d3ee",
          }}>LIM PRO</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: 2 }}>
            PERSONALISED CALORIE INTELLIGENCE
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 24 : 8, height: 8,
              borderRadius: 4,
              background: i <= step ? "#22d3ee" : "rgba(255,255,255,0.1)",
              transition: "all 0.3s",
            }} />
          ))}
        </div>

        <div style={{
          background: "#0d1117",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: "24px 20px",
        }}>

          {/* STEP 0 — Basics */}
          {step === 0 && (
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, letterSpacing: 2, color: "#22d3ee", marginBottom: 4 }}>
                WHO ARE YOU?
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
                We'll personalise your calorie targets
              </div>

              <label style={labelStyle}>Your Name</label>
              <input
                style={{ ...inputStyle, ...(focused === "name" ? focusStyle : {}) }}
                placeholder="e.g. Rajesh"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
              />

              <label style={labelStyle}>Age</label>
              <input
                type="number" min="10" max="100"
                style={{ ...inputStyle, ...(focused === "age" ? focusStyle : {}) }}
                placeholder="e.g. 28"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
                onFocus={() => setFocused("age")}
                onBlur={() => setFocused(null)}
              />

              <label style={labelStyle}>Gender</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {[["male", "♂ Male"], ["female", "♀ Female"], ["other", "⊕ Other"]].map(([v, l]) => (
                  <button key={v} onClick={() => set("gender", v)}
                    style={{
                      flex: 1, padding: "11px 4px",
                      background: form.gender === v ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${form.gender === v ? "#22d3ee" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 10, color: form.gender === v ? "#22d3ee" : "rgba(255,255,255,0.5)",
                      fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1 — Body */}
          {step === 1 && (
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, letterSpacing: 2, color: "#22d3ee", marginBottom: 4 }}>
                YOUR BODY
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
                Used to calculate your BMR with Mifflin-St Jeor formula
              </div>

              <label style={labelStyle}>Weight (kg)</label>
              <input
                type="number" min="30" max="200"
                style={{ ...inputStyle, ...(focused === "weight" ? focusStyle : {}) }}
                placeholder="e.g. 72"
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
                onFocus={() => setFocused("weight")}
                onBlur={() => setFocused(null)}
              />

              <label style={labelStyle}>Height (cm)</label>
              <input
                type="number" min="100" max="250"
                style={{ ...inputStyle, ...(focused === "height" ? focusStyle : {}) }}
                placeholder="e.g. 175"
                value={form.height}
                onChange={(e) => set("height", e.target.value)}
                onFocus={() => setFocused("height")}
                onBlur={() => setFocused(null)}
              />
            </div>
          )}

          {/* STEP 2 — Activity */}
          {step === 2 && (
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, letterSpacing: 2, color: "#22d3ee", marginBottom: 4 }}>
                ACTIVITY LEVEL
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
                This changes your sugar and calorie thresholds
              </div>

              {[
                [1, "🛋️ Sedentary", "Desk job, little or no exercise"],
                [2, "🚶 Lightly Active", "Light exercise 1–3 days/week"],
                [3, "🏃 Moderately Active", "Gym 3–5 days/week"],
                [4, "💪 Very Active", "Hard training 6–7 days/week"],
                [5, "⚡ Extremely Active", "Twice daily, athlete or on-shoot actor"],
              ].map(([v, label, desc]) => (
                <button key={v} onClick={() => set("activityLevel", v)}
                  style={{
                    width: "100%", marginBottom: 8,
                    padding: "12px 14px", textAlign: "left",
                    background: form.activityLevel === v ? "rgba(34,211,238,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${form.activityLevel === v ? "#22d3ee" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                  }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: form.activityLevel === v ? "#22d3ee" : "#fff" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 3 — Goal */}
          {step === 3 && (
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, letterSpacing: 2, color: "#22d3ee", marginBottom: 4 }}>
                YOUR GOAL
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
                The AI verdict adapts to your specific goal
              </div>

              {[
                ["fatLoss", "🔥 Fat Loss", "Calorie deficit — stricter thresholds"],
                ["maintenance", "⚖️ Maintenance", "Balanced intake for your activity"],
                ["muscleGain", "💪 Muscle Gain", "Protein prioritised, slight surplus"],
                ["endurance", "🏃 Endurance", "Natural sugars allowed for energy"],
              ].map(([v, label, desc]) => (
                <button key={v} onClick={() => set("goal", v)}
                  style={{
                    width: "100%", marginBottom: 8,
                    padding: "12px 14px", textAlign: "left",
                    background: form.goal === v ? "rgba(34,211,238,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${form.goal === v ? "#22d3ee" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                  }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: form.goal === v ? "#22d3ee" : "#fff" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 4 — Summary */}
          {step === 4 && targets && (
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, letterSpacing: 2, color: "#22d3ee", marginBottom: 4 }}>
                YOUR DAILY TARGETS
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
                Calculated using Mifflin-St Jeor + WHO guidelines
              </div>

              <div style={{ background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.15)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                  👋 {form.name}, {form.age}y · {ACTIVITY_LABELS[form.activityLevel]} · {GOAL_LABELS[form.goal]}
                </div>
                {[
                  ["🔥 Daily Calories", `${targets.dailyCalories} kcal`, "#f97316"],
                  ["🍬 Daily Sugar Limit", `${targets.dailySugar}g`, "#eab308"],
                  ["💪 Daily Protein", `${targets.dailyProtein}g`, "#22d3ee"],
                  ["🥑 Daily Fat", `${targets.dailyFat}g`, "#a78bfa"],
                  ["⚡ BMR", `${targets.bmr} kcal`, "rgba(255,255,255,0.4)"],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color }}>{val}</span>
                  </div>
                ))}
              </div>

              {form.age < 18 && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#fca5a5", marginBottom: 12 }}>
                  👶 WHO child guidelines applied — stricter sugar limits & no artificial sweeteners.
                </div>
              )}
              {form.age >= 50 && (
                <div style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#fde68a", marginBottom: 12 }}>
                  🫀 50+ profile: sodium and saturated fat monitored closely.
                </div>
              )}
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                style={{
                  flex: 1, padding: 14,
                  background: "rgba(255,255,255,0.05)",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, color: "rgba(255,255,255,0.5)",
                  fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}>
                ← BACK
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => canNext() && setStep(s => s + 1)}
                disabled={!canNext()}
                style={{
                  flex: 2, padding: 14,
                  background: canNext() ? "linear-gradient(135deg,#0891b2,#7c3aed)" : "rgba(255,255,255,0.06)",
                  border: "none", borderRadius: 12,
                  color: canNext() ? "#fff" : "rgba(255,255,255,0.25)",
                  fontSize: 14, fontWeight: 800,
                  cursor: canNext() ? "pointer" : "not-allowed", fontFamily: "inherit",
                }}>
                NEXT →
              </button>
            ) : (
              <button onClick={finish}
                style={{
                  flex: 2, padding: 14,
                  background: "linear-gradient(135deg,#16a34a,#0891b2)",
                  border: "none", borderRadius: 12,
                  color: "#fff", fontSize: 14, fontWeight: 800,
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                🚀 START SCANNING
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 11,
  color: "rgba(255,255,255,0.4)",
  letterSpacing: 1.5,
  marginBottom: 6,
  fontFamily: "monospace",
};
