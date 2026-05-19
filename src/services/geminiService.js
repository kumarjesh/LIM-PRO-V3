import { getVerdictThresholds } from "./storageService";

function buildPrompt(ml, profile, thresholds) {
  const { calGreenMax, calYellowMax, sugarGreenMax, sugarYellowMax, flagSodium, strictSweeteners, flagSaturatedFat } = thresholds;
  const { age, activityLevel, goal } = profile;

  const activityMap = { 1: "Sedentary", 2: "Lightly Active", 3: "Moderately Active", 4: "Very Active", 5: "Extremely Active" };
  const goalMap = { fatLoss: "Fat Loss", maintenance: "Maintenance", muscleGain: "Muscle Gain", endurance: "Endurance" };

  return `
You are a precision fitness nutrition analyst. The user has a personalised health profile:
- Age: ${age} years
- Activity Level: ${activityMap[activityLevel] || "Moderately Active"}
- Goal: ${goalMap[goal] || "Maintenance"}
- Quantity consumed: ${ml}ml

They scanned a tetra pack label. Analyze it and respond ONLY in this exact JSON (no markdown, no backticks):

{
  "product": "product name from label",
  "brand": "brand name",
  "verdict": "GREEN" or "YELLOW" or "RED",
  "calories": <integer for ${ml}ml>,
  "sugar_g": <grams of sugar for ${ml}ml>,
  "protein_g": <grams of protein for ${ml}ml>,
  "fat_g": <grams of fat for ${ml}ml>,
  "carbs_g": <grams of carbs for ${ml}ml>,
  "sodium_mg": <milligrams of sodium for ${ml}ml>,
  "summary": "<MAX 20 WORDS: punchy verdict personalised to their age and activity level>",
  "tip": "<MAX 15 WORDS: one actionable tip for their specific goal>",
  "flags_bad": ["harmful ingredients found"],
  "flags_good": ["positive attributes found"],
  "age_note": "<specific note for age ${age} if relevant, else empty string>"
}

PERSONALISED VERDICT RULES for this user (for ${ml}ml consumed):
GREEN  → calories <= ${calGreenMax} AND sugar <= ${sugarGreenMax}g AND no harmful additives
YELLOW → calories ${calGreenMax + 1}-${calYellowMax} OR sugar ${sugarGreenMax + 1}-${sugarYellowMax}g OR some additives
RED    → calories > ${calYellowMax} OR sugar > ${sugarYellowMax}g OR banned additives OR expired

ADDITIONAL RULES for this profile:
${age < 18 ? "- UNDER 18: Apply strict WHO child guidelines. Any artificial sweetener = RED. Flag all added sugars aggressively." : ""}
${age >= 50 ? "- AGE 50+: Flag saturated fat > 3g as YELLOW. Flag sodium > 400mg as YELLOW for heart health." : ""}
${age >= 36 && age < 50 ? "- AGE 36-50: Flag sodium > 500mg as YELLOW for cardiovascular health." : ""}
${flagSodium ? "- Flag sodium > 500mg for this sedentary/lightly active profile." : ""}
${strictSweeteners ? "- Zero tolerance for artificial sweeteners for this age group." : ""}
${flagSaturatedFat ? "- Flag saturated fat carefully for this age group." : ""}
${goal === "fatLoss" ? "- Fat loss goal: be extra strict on calories and sugar. Anything over the limit should be YELLOW minimum." : ""}
${goal === "endurance" ? "- Endurance goal: natural sugars (glucose, fructose) for energy are acceptable, reward electrolyte content." : ""}

WHO banned additives: Sudan dyes, Cyclamate, Trans fats. Flag as RED.
WHO caution additives: Aspartame, Saccharin, Acesulfame-K, Sodium Benzoate, HFCS, Red 40, Yellow 5. Flag as YELLOW.

If label unreadable: return verdict RED, summary "Cannot read label - avoid to be safe.", empty arrays for flags.
Scale ALL values proportionally from per-100ml figures on the label to ${ml}ml.
`;
}

export async function analyzeDrink(base64Image, ml, profile) {
  const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

  // Key check
  if (!API_KEY || API_KEY.trim() === "") {
    throw new Error("API key missing. Add REACT_APP_GEMINI_API_KEY to your .env file and restart the dev server.");
  }

  // Thresholds & prompt
  const thresholds = profile ? getVerdictThresholds(profile) : {
    calGreenMax: 80, calYellowMax: 150,
    sugarGreenMax: 8, sugarYellowMax: 15,
    flagSodium: false, strictSweeteners: false, flagSaturatedFat: false,
  };

  const prompt = profile
    ? buildPrompt(ml, profile, thresholds)
    : `Analyze this tetra pack label for ${ml}ml consumed. Return JSON only (no markdown): {product, brand, verdict (GREEN/YELLOW/RED), calories, sugar_g, protein_g, fat_g, carbs_g, sodium_mg, summary (20 words max), tip (15 words max), flags_bad [], flags_good [], age_note ""}. GREEN: cal<80, sugar<8g. YELLOW: cal 80-150, sugar 8-15g. RED: cal>150, sugar>15g or banned additives.`;

  // Models confirmed available in your Google AI Studio account
  const MODELS = [
    { name: "gemini-2.5-flash", version: "v1beta" }, // best free — fast, vision, 1M context
    { name: "gemini-2.0-flash", version: "v1beta" }, // fallback
    { name: "gemini-2.0-flash-lite", version: "v1beta" }, // last resort
  ];

  let lastError = null;

  for (const { name: model, version } of MODELS) {
    const URL = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${API_KEY}`;

    try {
      console.log(`[LIM PRO] Trying model: ${model}`);

      const res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image.includes(",") ? base64Image.split(",")[1] : base64Image,
                },
              },
              { text: "Analyze this tetra pack label now. Return ONLY raw JSON, no markdown, no backticks." },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = errBody?.error?.message || res.statusText;
        console.warn(`[LIM PRO] Model ${model} failed (${res.status}): ${msg}`);
        lastError = new Error(`Gemini error ${res.status}: ${msg}`);
        continue;
      }

      const data = await res.json();
      console.log(`[LIM PRO] Raw response from ${model}:`, data);

      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!raw) {
        console.warn(`[LIM PRO] Empty response from ${model}`);
        lastError = new Error("Empty response from Gemini");
        continue;
      }

      const clean = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      console.log(`[LIM PRO] Cleaned JSON from ${model}:`, clean);

      try {
        return JSON.parse(clean);
      } catch (parseErr) {
        console.warn(`[LIM PRO] JSON parse failed for ${model}:`, parseErr.message, "\nRaw:", clean);
        lastError = new Error(`Could not parse Gemini response: ${parseErr.message}`);
        continue;
      }

    } catch (networkErr) {
      console.warn(`[LIM PRO] Network error with ${model}:`, networkErr.message);
      lastError = networkErr;
      continue;
    }
  }

  console.error("[LIM PRO] All models failed. Last error:", lastError);
  throw lastError || new Error("All Gemini models failed. Check your API key and network.");
}