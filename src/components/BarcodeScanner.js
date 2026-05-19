import { useEffect, useRef, useState } from "react";

async function fetchByBarcode(barcode) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
  const data = await res.json();
  if (data.status !== 1) throw new Error("Product not found");
  const p = data.product;
  const n = p.nutriments || {};
  const canvas = document.createElement("canvas");
  canvas.width = 400; canvas.height = 300;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 400, 300);
  ctx.fillStyle = "#000"; ctx.font = "bold 18px sans-serif";
  ctx.fillText(p.product_name || "Unknown", 20, 40);
  ctx.font = "14px sans-serif";
  [
    `Brand: ${p.brands || ""}`,
    `Energy: ${n["energy-kcal_100g"] || 0} kcal/100ml`,
    `Sugar: ${n.sugars_100g || 0}g/100ml`,
    `Protein: ${n.proteins_100g || 0}g/100ml`,
    `Fat: ${n.fat_100g || 0}g/100ml`,
    `Carbs: ${n.carbohydrates_100g || 0}g/100ml`,
    `Additives: ${(p.additives_tags || []).join(", ") || "None listed"}`,
    `Ingredients: ${(p.ingredients_text || "").slice(0, 120)}`,
  ].forEach((l, i) => ctx.fillText(l, 20, 80 + i * 24));
  return canvas.toDataURL("image/jpeg", 0.9);
}

export default function BarcodeScanner({ onResult }) {
  const scannerRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    return () => { try { scannerRef.current?.stop(); } catch {} };
  }, []);

  const startScan = async () => {
    setStatus("scanning"); setMsg("");
    if (!window.Html5Qrcode) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
      script.onload = () => initScanner();
      document.head.appendChild(script);
    } else { initScanner(); }
  };

  const initScanner = () => {
    try {
      const scanner = new window.Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;
      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 120 } },
        async (code) => {
          scanner.stop();
          setStatus("loading");
          setMsg(`Found: ${code} — fetching product...`);
          try {
            const imageB64 = await fetchByBarcode(code);
            onResult(imageB64);
          } catch {
            setStatus("error");
            setMsg("Product not found. Try camera mode to scan the label directly.");
          }
        },
        () => {}
      );
    } catch {
      setStatus("error");
      setMsg("Could not start scanner. Try camera or gallery mode.");
    }
  };

  const stopScan = () => {
    try { scannerRef.current?.stop(); } catch {}
    setStatus("idle"); setMsg("");
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div id="barcode-reader" style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#0d1117", minHeight: status === "scanning" ? 220 : 0 }} />
      {msg && (
        <div style={{
          margin: "10px 0", padding: "10px 14px",
          background: status === "error" ? "rgba(239,68,68,0.1)" : "rgba(34,211,238,0.08)",
          border: `1px solid ${status === "error" ? "rgba(239,68,68,0.3)" : "rgba(34,211,238,0.2)"}`,
          borderRadius: 10, fontSize: 12,
          color: status === "error" ? "#fca5a5" : "#22d3ee",
        }}>{msg}</div>
      )}
      {status === "idle" && <button className="btn btn-primary" onClick={startScan}>▦  SCAN BARCODE</button>}
      {status === "scanning" && <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={stopScan}>✕ STOP SCANNING</button>}
      {status === "loading" && (
        <div style={{ textAlign: "center", padding: "20px", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          <div className="spinner" style={{ margin: "0 auto 10px" }} />
          Fetching from Open Food Facts...
        </div>
      )}
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 10 }}>
        Powered by Open Food Facts · Free · No key needed
      </div>
    </div>
  );
}
