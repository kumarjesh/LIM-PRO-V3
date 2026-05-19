import { useState, useRef, useEffect } from "react";
import Camera from "./components/Camera";
import MlSelector from "./components/MlSelector";
import VerdictCard from "./components/VerdictCard";
import DailyTracker from "./components/DailyTracker";
import History from "./components/History";
import BarcodeScanner from "./components/BarcodeScanner";
import ProfileTab from "./components/ProfileTab";
import Onboarding from "./components/Onboarding";
import { analyzeDrink } from "./services/geminiService";
import { getTodayLog, addToLog, exportWeeklyReport, isOnboarded, getProfile, calculateTargets } from "./services/storageService";
import "./App.css";

export default function App() {
  const [onboarded, setOnboarded]     = useState(isOnboarded());
  const [profile, setProfile]         = useState(getProfile());
  const [step, setStep]               = useState("home");
  const [image, setImage]             = useState(null);
  const [selectedMl, setSelectedMl]   = useState(null);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState(null);
  const [tab, setTab]                 = useState("scan");
  const [todayLog, setTodayLog]       = useState(getTodayLog());
  const [scanMode, setScanMode]       = useState("camera");
  const fileRef                       = useRef(null);

  useEffect(() => { setTodayLog(getTodayLog()); }, [tab]);

  const handleOnboardingComplete = (p) => {
    setProfile(p);
    setOnboarded(true);
  };

  const handleProfileUpdate = (p) => {
    setProfile(p);
  };

  const handleImageReady = (b64) => {
    setImage(b64);
    setStep("ml");
    setError(null);
  };

  const analyze = async () => {
    if (!selectedMl || selectedMl < 1) return;
    setStep("loading");
    setError(null);
    try {
      const data = await analyzeDrink(image, selectedMl, profile);
      setResult(data);
      addToLog({ ...data, ml: selectedMl, image, timestamp: Date.now() });
      setTodayLog(getTodayLog());
      setStep("result");
    } catch (err) {
      // Log the REAL error so we can debug it in the console
      console.error("[LIM PRO] analyzeDrink failed:", err);
      setError(`Analysis failed: ${err.message}`);
      setStep("ml");
    }
  };

  const reset = () => {
    setStep("home");
    setImage(null);
    setSelectedMl(null);
    setResult(null);
    setError(null);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleImageReady(ev.target.result);
    reader.readAsDataURL(file);
  };

  const todayCalories = todayLog.reduce((s, i) => s + (i.calories || 0), 0);
  const targets = profile ? calculateTargets(profile) : null;
  const calPct  = targets ? Math.round((todayCalories / targets.dailyCalories) * 100) : null;

  if (!onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="app-shell">

      {/* ── Top Bar ── */}
      <header className="top-bar">
        <div className="brand">
          <span className="brand-icon">⚡</span>
          <div>
            <div className="brand-name">LIM PRO</div>
            <div className="brand-sub">CALORIE INTELLIGENCE</div>
          </div>
        </div>
        <div className="today-chip" onClick={() => setTab("tracker")}
          style={{ background: calPct > 85 ? "rgba(239,68,68,0.15)" : "rgba(249,115,22,0.12)", borderColor: calPct > 85 ? "rgba(239,68,68,0.3)" : "rgba(249,115,22,0.3)", color: calPct > 85 ? "#fca5a5" : "#f97316" }}>
          🔥 {todayCalories} kcal
          {targets && <span style={{ opacity: 0.6, fontSize: 10 }}> / {targets.dailyCalories}</span>}
        </div>
      </header>

      {/* ── Tab Nav ── */}
      <nav className="tab-nav">
        {[
          { id: "scan",    icon: "📷", label: "SCAN"    },
          { id: "history", icon: "📋", label: "LOG"     },
          { id: "tracker", icon: "📊", label: "TRACKER" },
          { id: "profile", icon: "👤", label: "PROFILE" },
        ].map((t) => (
          <button key={t.id}
            className={`tab-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => { setTab(t.id); if (t.id === "scan") reset(); }}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      <main className="main-content">

        {/* SCAN TAB */}
        {tab === "scan" && (
          <>
            {step === "home" && (
              <div className="fade-in">
                {profile && (
                  <div style={{
                    background: "linear-gradient(135deg,rgba(34,211,238,0.06),rgba(167,139,250,0.06))",
                    border: "1px solid rgba(34,211,238,0.12)",
                    borderRadius: 14, padding: "10px 14px", marginBottom: 14,
                    fontSize: 12, color: "rgba(255,255,255,0.5)",
                  }}>
                    Hey <strong style={{ color: "#fff" }}>{profile.name}</strong> 👋 · {targets?.dailyCalories} kcal goal · {["", "🛋️ Sedentary", "🚶 Light", "🏃 Moderate", "💪 Very Active", "⚡ Extreme"][profile.activityLevel]}
                  </div>
                )}

                <div className="mode-row">
                  {[
                    { id: "camera",  icon: "📷", label: "Camera"  },
                    { id: "barcode", icon: "▦",  label: "Barcode" },
                    { id: "upload",  icon: "🖼️", label: "Gallery" },
                  ].map((m) => (
                    <button key={m.id}
                      className={`mode-btn ${scanMode === m.id ? "active" : ""}`}
                      onClick={() => setScanMode(m.id)}>
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>

                {error && <div className="error-box">{error}</div>}

                {scanMode === "camera"  && <Camera onCapture={handleImageReady} />}
                {scanMode === "barcode" && <BarcodeScanner onResult={handleImageReady} />}
                {scanMode === "upload"  && (
                  <div className="upload-zone" onClick={() => fileRef.current.click()}>
                    <div className="upload-icon">🖼️</div>
                    <div className="upload-title">TAP TO UPLOAD</div>
                    <div className="upload-sub">JPG, PNG from your gallery</div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
                  </div>
                )}

                <div className="hero-chips">
                  {["🔥 Calories", "🍬 Sugar", "💪 Protein", "🚦 WHO Safety", "📊 Macros"].map((c) => (
                    <span key={c} className="chip">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {step === "ml" && (
              <MlSelector
                image={image} selectedMl={selectedMl}
                onSelect={setSelectedMl} onAnalyze={analyze}
                onBack={reset} error={error}
              />
            )}

            {step === "loading" && (
              <div className="loading-screen fade-in">
                <div className="spinner" />
                <div className="loading-title">ANALYZING...</div>
                <div className="loading-sub">
                  {profile ? `Personalising for ${profile.name} · ${["","Sedentary","Light","Moderate","Very Active","Extreme"][profile.activityLevel]} profile` : "Reading label · Counting macros · Checking safety"}
                </div>
              </div>
            )}

            {step === "result" && result && (
              <VerdictCard
                result={result} image={image} ml={selectedMl}
                profile={profile}
                onRescan={() => { setStep("ml"); setResult(null); }}
                onNew={reset}
              />
            )}
          </>
        )}

        {tab === "history" && (
          <History log={todayLog} onExport={() => exportWeeklyReport(profile)} />
        )}

        {tab === "tracker" && (
          <DailyTracker log={todayLog} profile={profile} />
        )}

        {tab === "profile" && (
          <ProfileTab profile={profile} onUpdate={handleProfileUpdate} />
        )}

      </main>
    </div>
  );
}