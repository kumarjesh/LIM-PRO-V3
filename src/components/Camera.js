import { useRef, useState, useCallback } from "react";

export default function Camera({ onCapture }) {
  const videoRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = async () => {
    setError(null);
    setStarted(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: 640, height: 480 }
      });
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setStreaming(true);
          };
        }
      }, 100);
    } catch {
      setError("Camera access denied. Please allow camera permission and retry.");
      setStarted(false);
    }
  };

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const b64 = canvas.toDataURL("image/jpeg", 0.85);
    video.srcObject?.getTracks().forEach((t) => t.stop());
    setStreaming(false);
    setStarted(false);
    onCapture(b64);
  }, [onCapture]);

  return (
    <div style={{ marginBottom: 16 }}>
      {error && <div className="error-box">{error}</div>}
      <div style={{
        borderRadius: 18, overflow: "hidden",
        background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)",
        position: "relative",
      }}>
        <video ref={videoRef} autoPlay muted playsInline
          style={{ width: "100%", display: "block", background: "#0a0f17", minHeight: started ? 220 : 0, maxHeight: 300, objectFit: "cover" }} />
        {streaming && (
          <>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {[
                { top: 12, left: 12, borderTop: "2px solid #22d3ee", borderLeft: "2px solid #22d3ee", borderRadius: "4px 0 0 0" },
                { top: 12, right: 12, borderTop: "2px solid #22d3ee", borderRight: "2px solid #22d3ee", borderRadius: "0 4px 0 0" },
                { bottom: 56, left: 12, borderBottom: "2px solid #22d3ee", borderLeft: "2px solid #22d3ee", borderRadius: "0 0 0 4px" },
                { bottom: 56, right: 12, borderBottom: "2px solid #22d3ee", borderRight: "2px solid #22d3ee", borderRadius: "0 0 4px 0" },
              ].map((s, i) => <div key={i} style={{ position: "absolute", width: 24, height: 24, ...s }} />)}
            </div>
            <button onClick={capture} style={{
              position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
              background: "#22d3ee", border: "none", borderRadius: 50,
              padding: "11px 28px", fontWeight: 800, fontSize: 13,
              cursor: "pointer", letterSpacing: 1, fontFamily: "inherit",
            }}>✅ SNAP IT</button>
          </>
        )}
      </div>
      {!started && (
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={startCamera}>
          📷  OPEN CAMERA
        </button>
      )}
    </div>
  );
}
