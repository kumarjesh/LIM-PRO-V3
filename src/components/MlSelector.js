import { useState } from "react";

const PRESETS = [100, 150, 200, 250, 330, 500, 750, 1000];

export default function MlSelector({ image, selectedMl, onSelect, onAnalyze, onBack, error }) {
  const [customMl, setCustomMl] = useState("");
  const [customError, setCustomError] = useState("");

  const handlePreset = (ml) => { onSelect(ml); setCustomMl(""); setCustomError(""); };

  const handleCustom = (val) => {
    setCustomMl(val);
    setCustomError("");
    const num = Number(val);
    if (val && (isNaN(num) || num < 1 || num > 5000)) {
      setCustomError("Enter between 1ml and 5000ml");
      onSelect(null);
    } else if (val) {
      onSelect(num);
    } else {
      onSelect(null);
    }
  };

  const isValid = selectedMl && selectedMl >= 1 && selectedMl <= 5000;

  return (
    <div className="fade-in">
      {image && (
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 16, maxHeight: 180 }}>
          <img src={image} alt="scanned" style={{ width: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}
      <div className="card">
        <div className="section-heading">HOW MUCH DID YOU DRINK?</div>
        <div className="section-sub">SELECT OR TYPE YOUR QUANTITY</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
          {PRESETS.map((ml) => {
            const active = selectedMl === ml && !customMl;
            return (
              <button key={ml} onClick={() => handlePreset(ml)} style={{
                background: active ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${active ? "#22d3ee" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12, padding: "12px 4px", cursor: "pointer",
                color: active ? "#22d3ee" : "rgba(255,255,255,0.55)",
                fontWeight: active ? 800 : 500, fontSize: 13, transition: "all 0.15s", fontFamily: "inherit",
              }}>
                {ml}<span style={{ fontSize: 9, opacity: 0.6 }}>ml</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>OR CUSTOM</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <input type="number" min="1" max="5000" placeholder="e.g. 375" value={customMl}
            onChange={(e) => handleCustom(e.target.value)}
            style={{
              flex: 1, background: customMl ? "rgba(34,211,238,0.06)" : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${customMl && !customError ? "#22d3ee" : customError ? "#ef4444" : "rgba(255,255,255,0.12)"}`,
              borderRadius: 12, padding: "13px 14px", color: "#fff",
              fontSize: 16, fontWeight: 700, outline: "none", fontFamily: "monospace", transition: "border-color 0.15s",
            }} />
          <div style={{
            background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: "13px 16px", color: "rgba(255,255,255,0.4)",
            fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center",
          }}>ml</div>
        </div>

        {customError && <div style={{ fontSize: 11, color: "#f87171", marginBottom: 10 }}>⚠ {customError}</div>}

        {isValid && (
          <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 14, fontFamily: "monospace" }}>
            Calculating for <span style={{ color: "#22d3ee", fontWeight: 700 }}>{selectedMl}ml</span>
          </div>
        )}

        {error && <div className="error-box" style={{ marginBottom: 14 }}>{error}</div>}

        <button className={`btn ${isValid ? "btn-primary" : "btn-disabled"}`}
          onClick={isValid ? onAnalyze : undefined} disabled={!isValid}>
          {isValid ? `ANALYZE ${selectedMl}ml  →` : "SELECT OR ENTER QUANTITY"}
        </button>
      </div>

      <button onClick={onBack} style={{
        width: "100%", padding: "11px", background: "none", border: "none",
        color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
      }}>← Scan a different pack</button>
    </div>
  );
}
