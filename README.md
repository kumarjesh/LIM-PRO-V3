# ⚡ LIM PRO v3 — Calorie Intelligence Scanner

> **AI-powered tetra pack scanner for fitness freaks and actors who track every calorie.**
> Point your camera at any tetra pack → get instant calorie, macro & WHO safety verdict — personalised to YOUR body and goals.

![LIM Pro](https://img.shields.io/badge/LIM-PRO_v3-22d3ee?style=for-the-badge&logo=react&logoColor=white)
![WHO Compliant](https://img.shields.io/badge/WHO-Compliant-16a34a?style=for-the-badge)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)
![PWA](https://img.shields.io/badge/PWA-Ready-a855f7?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)

---

## 📱 Live Demo

> 🔗 **[lim-pro.vercel.app](https://lim-pro.vercel.app)**
> Open on your phone and tap **Add to Home Screen** for the full PWA experience.

---

## 📖 Table of Contents

- [What is LIM Pro?](#-what-is-lim-pro)
- [What's New in v3](#-whats-new-in-v3)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Personalisation System](#-personalisation-system)
- [WHO Safety Guidelines](#-who-safety-guidelines)
- [Verdict System](#-verdict-system)
- [Feature Details](#-feature-details)
- [Deployment](#-deployment)
- [Install as PWA](#-install-as-pwa-on-phone)
- [Known Issues & Fixes](#-known-issues--fixes)
- [Roadmap](#-roadmap)
- [Disclaimer](#-disclaimer)
- [License](#-license)

---

## 🧠 What is LIM Pro?

**LIM Pro (Large Image Model — Pro Edition)** is a Progressive Web App built for fitness enthusiasts, athletes, and actors who obsessively track their calorie intake.

Scan any tetra pack label using your phone camera, barcode scanner, or gallery upload. The AI reads the nutrition label, calculates macros for your **exact quantity consumed**, and gives you an instant **GREEN / YELLOW / RED** verdict — now **personalised to your body stats and fitness goal** using the Mifflin-St Jeor formula and WHO dietary standards.

**No app store. No install. Just open the URL on your phone.**

---

## 🆕 What's New in v3

| v1 | v2 | **v3** |
|---|---|---|
| Basic scan + verdict | + Calorie tracker + History | **+ Full onboarding** |
| Generic WHO thresholds | + Barcode scanner | **+ Personalised BMR targets** |
| Single-file React app | + Weekly export | **+ Profile tab with editing** |
| — | + Macro pie chart | **+ Age-aware WHO rules** |
| — | + Voice summary | **+ Goal-based verdict thresholds** |
| — | — | **+ Mifflin-St Jeor formula** |

---

## ✨ Features

| Feature | Description |
|---|---|
| 👤 **Onboarding Flow** | 5-step setup: name, age, gender, body stats, activity level, goal |
| 📷 **Camera Scan** | Live rear camera with corner-bracket overlay for label capture |
| ▦ **Barcode Scanner** | Scan barcode → auto-fetch from Open Food Facts database |
| 🖼️ **Gallery Upload** | Upload from photo gallery for already-photographed packs |
| 🎯 **Quantity Selector** | 8 presets (100–1000ml) + custom ml input for any amount |
| 🤖 **Gemini 2.5 Flash** | Vision AI reads nutrition labels and understands ingredients |
| 🏥 **WHO Compliance** | Checks sugar, sodium, additives, artificial sweeteners, expiry |
| 🟢🟡🔴 **Traffic Light Verdict** | DRINK IT / THINK TWICE / SKIP IT — instant and clear |
| 🎯 **Personalised Thresholds** | Verdict adapts to YOUR calorie budget, not a generic person |
| 🔥 **Calorie Tracker** | Daily counter synced to your BMR-calculated goal |
| 📊 **Macro Pie Chart** | Visual Protein / Carbs / Fat breakdown per your quantity |
| 🚩 **Ingredient Flags** | Red chips for harmful additives, green chips for positives |
| 🔊 **Voice Summary** | Auto-reads the verdict aloud — hands-free at the gym |
| 📋 **Drink History Log** | Every scan saved with thumbnail, calories, time, verdict |
| 📤 **Weekly Report Export** | Download a .txt summary of your 7-day drink intake |
| 👤 **Profile Tab** | View and edit your targets, thresholds, and body data anytime |
| 📱 **PWA** | Installable on Android & iPhone, opens fullscreen like a native app |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  ONBOARDING LAYER                   │
│                                                     │
│  Name · Age · Gender · Weight · Height · Activity   │
│  Goal → Mifflin-St Jeor BMR → Personalised Targets  │
└──────────────────────────┬──────────────────────────┘
                           │ profile stored in localStorage
┌──────────────────────────▼──────────────────────────┐
│                   CAPTURE LAYER                     │
│                                                     │
│  📷 Camera      ▦ Barcode       🖼️ Gallery          │
│  getUserMedia   html5-qrcode    FileReader           │
│         └─────────────┴──────────────┘              │
│                      │ base64 JPEG image             │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  ANALYZE LAYER                      │
│                                                     │
│  Gemini 2.5 Flash Vision API                        │
│  + WHO Fitness System Prompt                        │
│  + Personalised thresholds from profile             │
│  + Quantity (ml) proportional scaling               │
│                      │ Structured JSON response     │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                   JUDGE LAYER                       │
│                                                     │
│   ✅ GREEN        ⚠️ YELLOW         🚫 RED           │
│   DRINK IT      THINK TWICE       SKIP IT           │
│                                                     │
│  Macros · Pie Chart · Flags · Voice · History       │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 (CRA) | UI, state management, camera |
| Vision AI | Google Gemini 2.5 Flash | Label reading & nutrition analysis |
| Barcode | html5-qrcode (CDN) | Camera-based barcode scanning |
| Food Database | Open Food Facts API | Free barcode-to-nutrition lookup |
| Nutrition Formula | Mifflin-St Jeor | BMR / TDEE calculation |
| Voice | Web Speech API | Built-in browser text-to-speech |
| Storage | localStorage | Scan history, profile, daily log |
| Styling | Custom CSS | Dark gym aesthetic, zero UI library |
| Hosting | Vercel (free) | HTTPS + auto-deploy from GitHub |

---

## 📁 Project Structure

```
lim-pro-v3/
├── public/
│   └── index.html                  # Google Fonts, PWA meta tags
├── src/
│   ├── components/
│   │   ├── Camera.js               # Live camera with snap overlay
│   │   ├── MlSelector.js           # Quantity picker (presets + custom)
│   │   ├── VerdictCard.js          # Verdict, macros, pie chart, flags, voice
│   │   ├── DailyTracker.js         # Calorie goal + progress bar
│   │   ├── History.js              # Today's scan log + weekly export
│   │   ├── BarcodeScanner.js       # Barcode → Open Food Facts API
│   │   ├── Onboarding.js           # 5-step first-run setup flow
│   │   └── ProfileTab.js           # View & edit profile + targets
│   ├── services/
│   │   ├── geminiService.js        # Gemini API call + personalised WHO prompt
│   │   └── storageService.js       # localStorage: log, goal, profile, export
│   ├── App.js                      # Main shell: tabs, steps, onboarding gate
│   ├── App.css                     # Full dark gym aesthetic styles
│   └── index.js                    # React entry point
├── .env                            # API key — NEVER commit this
├── .env.example                    # Template for new contributors
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- npm v7+
- Free Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/lim-pro-v3.git
cd lim-pro-v3
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Get a Free Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **Get API Key** → **Create API key in new project**
4. Copy the key — it starts with `AIzaSy...`
5. No credit card required ✅

### 4. Create Your .env File

In the project root (same folder as `package.json`):

```env
REACT_APP_GEMINI_API_KEY=AIzaSyYOUR_KEY_HERE
```

> ⚠️ Variable MUST start with `REACT_APP_` — React silently ignores anything else.
> ⚠️ Never commit `.env` to GitHub — it's already in `.gitignore`.

### 5. Run Locally

```bash
npm start
```

Opens at `http://localhost:3000`

To test camera and PWA on your phone (same WiFi):

```
http://192.168.x.x:3000
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_GEMINI_API_KEY` | ✅ Yes | From aistudio.google.com — free tier, 15 req/min |

> Always restart `npm start` after editing `.env`.

---

## 👤 Personalisation System

LIM Pro v3 introduces a full personalisation engine. On first launch, the 5-step onboarding collects:

| Input | Used For |
|---|---|
| Name | Personalised greeting |
| Age | WHO child rules (<18), senior flags (50+) |
| Gender | Mifflin-St Jeor BMR formula |
| Weight (kg) | BMR + protein target |
| Height (cm) | BMR calculation |
| Activity Level (1–5) | TDEE multiplier |
| Goal | Calorie surplus/deficit + verdict strictness |

### How Targets Are Calculated

```
BMR (male)   = 10×weight + 6.25×height − 5×age + 5
BMR (female) = 10×weight + 6.25×height − 5×age − 161

TDEE = BMR × activity multiplier
     (1.2 / 1.375 / 1.55 / 1.725 / 1.9)

Daily Calories:
  Fat Loss    → TDEE − 500 kcal
  Maintenance → TDEE
  Muscle Gain → TDEE + 300 kcal
  Endurance   → TDEE + 200 kcal

Daily Sugar  = 10% of daily calories ÷ 4 (WHO guideline)
Daily Protein = weight × multiplier (2.2 for fat loss, 2.5 for muscle gain…)
Daily Fat    = 28% of daily calories ÷ 9
```

### Personalised Verdict Thresholds

Rather than fixed WHO limits (80 / 150 kcal), the GREEN / YELLOW boundary is computed per user:

```
Per-drink budget = (daily calories ÷ 4 drinks) × goal factor × activity bonus

Goal factor:   fatLoss=0.7 · maintenance=1.0 · muscleGain=1.1 · endurance=1.2
Activity bonus: level ≥4 → ×1.3 (athletes can handle more)

calGreenMax  = per-drink budget × 0.5
calYellowMax = per-drink budget × 0.9
```

A 70kg endurance runner will get a GREEN on a 120 kcal sports drink that a sedentary person would see as YELLOW — because the app knows their body.

---

## 🏥 WHO Safety Guidelines Used

| Parameter | WHO Threshold | Verdict Impact |
|---|---|---|
| Free Sugar | >12g per 100ml | CAUTION / UNSAFE |
| Sodium | >600mg per 100ml | CAUTION / UNSAFE |
| Aspartame / Saccharin / Ace-K | Any amount | CAUTION (RED for under-18) |
| Sudan dyes / Cyclamate / Trans fats | Any amount | UNSAFE → RED |
| High Fructose Corn Syrup (HFCS) | Any amount | CAUTION |
| Artificial colors (Red 40, Yellow 5) | Any amount | CAUTION |
| Expired product | Any | UNSAFE → RED |
| Unreadable label | — | RED (cannot verify safety) |
| Age < 18 | — | Stricter sugar limits, zero artificial sweeteners |
| Age ≥ 50 | — | Sodium and saturated fat monitored closely |

Reference: [WHO Healthy Diet Fact Sheet](https://www.who.int/news-room/fact-sheets/detail/healthy-diet)

---

## 🎯 Verdict System

```
✅ GREEN   → calories ≤ calGreenMax  AND sugar ≤ sugarGreenMax  AND no banned additives
⚠️ YELLOW  → calories ≤ calYellowMax OR  sugar ≤ sugarYellowMax OR  some additives
🚫 RED     → calories > calYellowMax OR  sugar > sugarYellowMax OR  WHO violation
```

All thresholds are **personalised per user** — not fixed generic values.

### Sample JSON Response from Gemini

```json
{
  "product": "Tropicana Orange Juice",
  "brand": "Tropicana",
  "verdict": "GREEN",
  "calories": 45,
  "sugar_g": 9.5,
  "protein_g": 0.5,
  "fat_g": 0.1,
  "carbs_g": 10.5,
  "summary": "Light juice, fits your endurance macros for today.",
  "tip": "Drink pre-workout to fuel your run naturally.",
  "flags_bad": [],
  "flags_good": ["No preservatives", "Natural flavors", "Vitamin C source"]
}
```

All values are scaled to the **exact ml quantity** the user selected.

---

## 🔍 Feature Details

### 👤 Onboarding (5 Steps)
First-run wizard collects name, age, gender, weight, height, activity level, and fitness goal. Calculates personalised BMR, TDEE, daily calories, sugar, protein, and fat targets using Mifflin-St Jeor + WHO formulas. Stored in localStorage — never leaves the device.

### 📷 Camera Scan
Rear camera (`facingMode: environment`) with cyan corner bracket overlay. Captures at 640×480 JPEG quality 0.85. Works on Android Chrome and iPhone Safari.

### ▦ Barcode Scanner
Dynamically loads `html5-qrcode` from CDN. Reads barcode, fetches nutrition from Open Food Facts (free, no API key). Converts the data to a canvas image and feeds it into the Gemini pipeline — same flow as camera scan.

### 🎯 Quantity Selector
8 presets: 100 / 150 / 200 / 250 / 330 / 500 / 750 / 1000ml. Custom input: 1–5000ml. All macros scaled proportionally to the selected quantity before the Gemini prompt is sent.

### 🔊 Voice Summary
Uses the browser's built-in `SpeechSynthesis` API — zero cost, zero library. Auto-plays when the verdict loads. Tap 🔊 to replay anytime.

### 📊 Macro Pie Chart
Custom SVG pie chart with no external library. Displays Protein / Carbs / Fat as a percentage of total calories with a donut-style centre label.

### 🚩 Ingredient Flags
Color-coded chips rendered below the verdict card. Red chips = harmful or banned additives found. Green chips = positive attributes confirmed (e.g. "No preservatives", "Electrolytes").

### 🔥 Daily Calorie Tracker
All scans stored in localStorage keyed by date. Progress bar animates from green → yellow → red as you approach your personalised daily limit. Fully editable from the Tracker tab.

### 👤 Profile Tab
View your full profile, BMR, TDEE, and daily targets at a glance. Tap EDIT to update any field — targets recalculate instantly. Shows your personalised scan thresholds (the exact kcal/sugar limits your verdicts use).

### 📤 Weekly Report Export
Plain `.txt` file with 7 days of history: per-day calorie totals, per-scan details with verdict icons, and a weekly summary with GREEN / YELLOW / RED counts.

---

## 🌐 Deployment

### Deploy to Vercel (Free)

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) → **Import** → **Deploy**.

### Add Your API Key in Vercel

```
Project → Settings → Environment Variables

Name:   REACT_APP_GEMINI_API_KEY
Value:  AIzaSyYOUR_KEY_HERE

☑ Production   ☑ Preview   ☑ Development
```

Save → Deployments → ⋯ → **Redeploy**.

### Push Future Updates

```bash
git add .
git commit -m "your update"
git push origin main
# Vercel auto-deploys in ~60 seconds
```

---

## 📱 Install as PWA on Phone

### Android (Chrome)
1. Open your Vercel URL in Chrome
2. Tap ⋮ menu → **Add to Home screen** → **Add**

### iPhone (Safari only)
1. Open your Vercel URL in Safari
2. Tap the Share button → **Add to Home Screen** → **Add**

Opens fullscreen with no browser bar — just like a native app.

---

## 🐛 Known Issues & Fixes

| Issue | Fix |
|---|---|
| `Module not found: storageService` | Create `src/services/storageService.js` with all exported functions (see storageService section) |
| Black camera screen | Ensure `<video muted autoPlay playsInline>` and use `onloadedmetadata` to call `.play()` |
| "Analysis failed" error | Add API key in Vercel Environment Variables and redeploy |
| Camera permission denied | Tap the camera icon in the browser address bar → Allow → Refresh |
| Barcode product not found | Product absent from Open Food Facts — use Camera mode to scan label directly |
| Build fails on Vercel | Run `npm run build` locally first and fix all ESLint errors before pushing |
| API key not loading | Variable must start with `REACT_APP_` — restart `npm start` after editing `.env` |
| Profile not saving | Ensure `storageService.js` exports `saveProfile` and `getProfile` correctly |
| Onboarding shows every reload | `getProfile()` must return `null` only when no profile exists in localStorage |

---

## 🗺️ Roadmap

- [x] Camera scan with WHO verdict
- [x] Custom ml quantity input
- [x] Daily calorie tracker with editable goal
- [x] Ingredient red flag / green flag chips
- [x] Macro pie chart (SVG, no library)
- [x] Voice summary (Web Speech API)
- [x] Barcode scanner + Open Food Facts
- [x] Weekly report export (.txt)
- [x] PWA — installable on phone via Vercel
- [x] 5-step onboarding with profile storage
- [x] Mifflin-St Jeor BMR / TDEE calculation
- [x] Personalised verdict thresholds per user
- [x] Age-aware WHO rules (child / 50+ profiles)
- [x] Profile tab with editing and threshold display
- [ ] Compare two drinks side by side
- [ ] Share verdict as a shareable image card
- [ ] Push notification when daily calorie limit is reached
- [ ] Multi-language support (Hindi, Tamil, Kannada…)
- [ ] Offline mode with cached Gemini responses
- [ ] Dark / light mode toggle

---

## ⚠️ Disclaimer

LIM Pro provides **AI-assisted guidance** based on WHO dietary standards for **informational purposes only**. It is **not a substitute for professional medical or nutritional advice**.

AI accuracy depends on image quality, label clarity, and lighting conditions. Always verify critical nutritional information manually. Consult a qualified health professional or registered dietitian for specific dietary decisions.

Calorie and macro calculations are estimates based on the Mifflin-St Jeor formula and standard WHO multipliers. Individual metabolic rates vary.

---

## 📄 License

MIT License — free to use, modify, and distribute with attribution.

---

## 🙌 Built With

- [React 18](https://reactjs.org/) — UI framework
- [Google Gemini 2.5 Flash API](https://aistudio.google.com/) — Vision AI (free tier, 15 req/min)
- [Open Food Facts](https://world.openfoodfacts.org/) — Free global food database
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) — Barcode scanning via CDN
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) — Browser-native voice output
- [Vercel](https://vercel.com/) — Free HTTPS hosting with GitHub auto-deploy
- [WHO Guidelines](https://www.who.int/news-room/fact-sheets/detail/healthy-diet) — Dietary safety standards
- [Mifflin-St Jeor Equation](https://pubmed.ncbi.nlm.nih.gov/2305711/) — BMR calculation formula

---

*Built with 💪 for fitness freaks, athletes, and actors who take nutrition seriously.*
*Powered by LIM (Large Image Model) architecture + Google Gemini 2.5 Flash Vision AI.*
