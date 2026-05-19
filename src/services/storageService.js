// ── Keys ──────────────────────────────────────────────────────────────────
const TODAY_KEY = () => `lim_log_${new Date().toISOString().slice(0, 10)}`;
const PROFILE_KEY = "lim_user_profile";
const ONBOARDED_KEY = "lim_onboarded";

// ── Onboarding ─────────────────────────────────────────────────────────────
export function isOnboarded() {
  return localStorage.getItem(ONBOARDED_KEY) === "true";
}
export function setOnboarded() {
  localStorage.setItem(ONBOARDED_KEY, "true");
}

// ── Profile ────────────────────────────────────────────────────────────────
export function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null;
  } catch { return null; }
}
export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(ONBOARDED_KEY, "true");
}

// ── BMR + TDEE Calculation (Mifflin-St Jeor) ──────────────────────────────
export function calculateTargets(profile) {
  const { age, gender, weight, height, activityLevel, goal } = profile;

  // BMR
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += gender === "male" ? 5 : -161;

  // Activity multipliers
  const multipliers = { 1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725, 5: 1.9 };
  let tdee = bmr * (multipliers[activityLevel] || 1.375);

  // Goal adjustments
  const goalMultipliers = {
    fatLoss: 0.80,
    maintenance: 1.00,
    muscleGain: 1.15,
    endurance: 1.10,
  };
  const dailyCalories = Math.round(tdee * (goalMultipliers[goal] || 1.0));

  // WHO: max 10% of calories from free sugar
  const dailySugar = Math.round((dailyCalories * 0.10) / 4); // 4kcal per gram

  // Protein: 1.6g/kg for muscle gain, 1.2g/kg others
  const dailyProtein = Math.round(weight * (goal === "muscleGain" ? 1.6 : 1.2));

  // Fat: 25–30% of calories
  const dailyFat = Math.round((dailyCalories * 0.275) / 9); // 9kcal per gram

  // Age-specific sugar cap (stricter for children and 50+)
  let ageSugarCap = dailySugar;
  if (age < 18) ageSugarCap = Math.min(dailySugar, 25);
  if (age >= 50) ageSugarCap = Math.min(dailySugar, 40);

  return {
    dailyCalories,
    dailySugar: ageSugarCap,
    dailyProtein,
    dailyFat,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
}

// ── Verdict Thresholds by Profile ──────────────────────────────────────────
export function getVerdictThresholds(profile) {
  const targets = calculateTargets(profile);
  const { age, activityLevel } = profile;

  // Sugar per drink: 20% of daily sugar budget
  const sugarGreenMax = Math.round(targets.dailySugar * 0.20);
  const sugarYellowMax = Math.round(targets.dailySugar * 0.35);

  // Calories per drink: 10% of daily calories
  const calGreenMax = Math.round(targets.dailyCalories * 0.10);
  const calYellowMax = Math.round(targets.dailyCalories * 0.18);

  return {
    calGreenMax,
    calYellowMax,
    sugarGreenMax,
    sugarYellowMax,
    flagSodium: activityLevel <= 2 || age >= 36,
    strictSweeteners: age < 18,
    flagSaturatedFat: age >= 50,
    targets,
  };
}

// ── Age Group Label ────────────────────────────────────────────────────────
export function getAgeNote(age) {
  if (age < 18) return "WHO child guidelines applied — stricter sugar & no artificial sweeteners.";
  if (age >= 50) return "50+ profile: sodium and saturated fat flagged more aggressively.";
  if (age >= 36) return "36–50 profile: sodium monitored closely for heart health.";
  return null;
}

// ── Daily Log ──────────────────────────────────────────────────────────────
export function getTodayLog() {
  try {
    return JSON.parse(localStorage.getItem(TODAY_KEY()) || "[]");
  } catch { return []; }
}
export function addToLog(entry) {
  try {
    const log = getTodayLog();
    log.unshift(entry);
    localStorage.setItem(TODAY_KEY(), JSON.stringify(log.slice(0, 50)));
  } catch {}
}

// ── Weekly History ─────────────────────────────────────────────────────────
export function getWeekLog() {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `lim_log_${d.toISOString().slice(0, 10)}`;
    try {
      const log = JSON.parse(localStorage.getItem(key) || "[]");
      days.push({ date: d.toISOString().slice(0, 10), log });
    } catch {
      days.push({ date: d.toISOString().slice(0, 10), log: [] });
    }
  }
  return days;
}

// ── Weekly Report Export ───────────────────────────────────────────────────
export function exportWeeklyReport(profile) {
  const week = getWeekLog();
  const targets = profile ? calculateTargets(profile) : null;
  let totalCal = 0, totalSugar = 0, green = 0, yellow = 0, red = 0;
  const sep = "=".repeat(40);
  const lines = ["LIM PRO — PERSONALISED WEEKLY DRINK REPORT", sep, ""];

  if (profile && targets) {
    lines.push(
      `👤 ${profile.name || "User"}, Age: ${profile.age} | ${ACTIVITY_LABELS[profile.activityLevel]}`,
      `🎯 Goal: ${GOAL_LABELS[profile.goal]}`,
      `🔥 Daily Calorie Target: ${targets.dailyCalories} kcal`,
      `🍬 Daily Sugar Limit: ${targets.dailySugar}g`,
      `💪 Daily Protein Target: ${targets.dailyProtein}g`,
      ""
    );
  }

  week.forEach(({ date, log }) => {
    if (log.length === 0) return;
    const dayCal = log.reduce((s, i) => s + (i.calories || 0), 0);
    totalCal += dayCal;
    totalSugar += log.reduce((s, i) => s + (i.sugar_g || 0), 0);
    log.forEach((i) => {
      if (i.verdict === "GREEN") green++;
      else if (i.verdict === "YELLOW") yellow++;
      else if (i.verdict === "RED") red++;
    });
    const pct = targets ? Math.round((dayCal / targets.dailyCalories) * 100) : null;
    lines.push(`📅 ${date}${pct !== null ? ` — ${pct}% of your daily goal` : ""}`);
    log.forEach((i) => {
      const icon = i.verdict === "GREEN" ? "✅" : i.verdict === "YELLOW" ? "⚠️" : "🚫";
      lines.push(`  ${icon} ${i.product || "Unknown"} — ${i.ml}ml — ${i.calories || 0}kcal | Sugar: ${i.sugar_g || 0}g`);
    });
    lines.push(`  Day total: ${dayCal} kcal`, "");
  });

  lines.push(sep);
  lines.push(`WEEK TOTAL: ${totalCal} kcal | Sugar: ${totalSugar.toFixed(1)}g`);
  lines.push(`✅ GREEN: ${green}  ⚠️ YELLOW: ${yellow}  🚫 RED: ${red}`);
  if (targets) {
    const daysOnTarget = week.filter(({ log }) => {
      const d = log.reduce((s, i) => s + (i.calories || 0), 0);
      return d > 0 && d <= targets.dailyCalories;
    }).length;
    lines.push(`🎯 Within your personal target: ${daysOnTarget} / 7 days`);
  }

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lim-report-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export const ACTIVITY_LABELS = {
  1: "🛋️ Sedentary",
  2: "🚶 Lightly Active",
  3: "🏃 Moderately Active",
  4: "💪 Very Active",
  5: "⚡ Extremely Active",
};

export const GOAL_LABELS = {
  fatLoss: "🔥 Fat Loss",
  maintenance: "⚖️ Maintenance",
  muscleGain: "💪 Muscle Gain",
  endurance: "🏃 Endurance",
};
