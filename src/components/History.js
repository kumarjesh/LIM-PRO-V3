const VERDICT_COLOR = { GREEN: "#22c55e", YELLOW: "#eab308", RED: "#ef4444" };
const VERDICT_ICON  = { GREEN: "✅", YELLOW: "⚠️", RED: "🚫" };

export default function History({ log, onExport }) {
  const fmt = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div className="section-heading">TODAY'S DRINK LOG</div>
          <div className="section-sub">{log.length} SCAN{log.length !== 1 ? "S" : ""} TODAY</div>
        </div>
        <button onClick={onExport} style={{
          background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)",
          borderRadius: 10, padding: "8px 14px", color: "#a78bfa",
          fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}>📤 EXPORT WEEK</button>
      </div>

      {log.length === 0 && (
        <div style={{
          textAlign: "center", padding: "48px 24px",
          background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)",
          borderRadius: 16,
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No scans today yet.<br />Go scan your first drink!</div>
        </div>
      )}

      {log.map((item, idx) => (
        <div key={idx} className="history-item">
          {item.image
            ? <img src={item.image} alt="thumb" className="history-thumb" />
            : <div className="history-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🥤</div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.product || "Unknown product"}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              {item.ml}ml · {item.calories || 0} kcal · {item.sugar_g || 0}g sugar
            </div>
            {item.timestamp && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 2, fontFamily: "monospace" }}>
                {fmt(item.timestamp)}
              </div>
            )}
          </div>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 18 }}>{VERDICT_ICON[item.verdict] || "❓"}</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: VERDICT_COLOR[item.verdict] || "#888", marginTop: 2, fontFamily: "monospace" }}>
              {item.verdict || "—"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
