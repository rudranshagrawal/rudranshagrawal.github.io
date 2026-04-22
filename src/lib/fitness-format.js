// Formatting helpers for WhatsApp message drafts, weekly summaries, and
// AI context payloads. Pure functions, no side effects.

import {
  allSessions,
  allMeals,
  getWeightLog,
  getCheckinHistory,
  getSessionLog,
  getMealLog,
  dayStatus,
} from "./storage";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function todayISO(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function dayOfWeek(d = new Date()) {
  return DAY_NAMES[d.getDay()];
}

/**
 * Given the plan's start date + today, compute the training week number (1-indexed).
 */
export function weekNumber(planStartISO, today = todayISO()) {
  if (!planStartISO) return null;
  const start = new Date(planStartISO);
  const now = new Date(today);
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 0;
  return Math.floor(diffDays / 7) + 1;
}

/**
 * Find the most recent log for a given exercise so we can suggest last-week weight.
 */
export function lastBestSet(exerciseName, excludeDate = null) {
  const sessions = allSessions();
  for (const s of sessions) {
    if (s.date === excludeDate) continue;
    const ex = s.log?.exercises?.find(
      (e) => e.name?.toLowerCase() === exerciseName?.toLowerCase()
    );
    if (!ex || !ex.sets?.length) continue;
    // "best" = highest weight × reps combo
    const best = [...ex.sets].sort(
      (a, b) => (b.weight ?? 0) * (b.reps ?? 0) - (a.weight ?? 0) * (a.reps ?? 0)
    )[0];
    if (best?.weight != null || best?.reps != null) {
      return { date: s.date, ...best };
    }
  }
  return null;
}

/**
 * Aggregate the last N days of data for AI context + check-in drafts.
 */
export function recentSummary(days = 7) {
  const end = new Date();
  const cutoff = new Date();
  cutoff.setDate(end.getDate() - days);
  const cutoffISO = todayISO(cutoff);

  const sessions = allSessions().filter((s) => s.date >= cutoffISO);
  const meals = allMeals().filter((m) => m.date >= cutoffISO);
  const weights = getWeightLog().filter((w) => w.date >= cutoffISO);

  return {
    days,
    sessions: sessions.map((s) => ({
      date: s.date,
      exercises: (s.log?.exercises ?? []).map((e) => ({
        name: e.name,
        sets: e.sets ?? [],
        notes: e.notes || "",
      })),
      sessionNotes: s.log?.sessionNotes || "",
    })),
    meals,
    weights,
  };
}

/**
 * Build a plain-text weekly check-in message for WhatsApp.
 */
export function buildCheckinMessage({ checkin, weekNum, weights = [], sessions = [], notes = "" }) {
  const lines = [];
  lines.push(`*Weekly Check-in — Week ${weekNum ?? "?"}*`);
  lines.push("");

  if (weights.length) {
    const first = weights[0];
    const last = weights[weights.length - 1];
    const delta = last.kg - first.kg;
    lines.push(`*Weight*: ${last.kg} kg (${delta >= 0 ? "+" : ""}${delta.toFixed(1)} this week)`);
  } else if (checkin?.currentWeight) {
    lines.push(`*Weight*: ${checkin.currentWeight} kg`);
  }

  if (checkin?.dietConsistency) lines.push(`*Diet consistency*: ${checkin.dietConsistency}`);
  if (checkin?.workoutsRegular) lines.push(`*Workouts*: ${checkin.workoutsRegular}`);
  if (checkin?.energyLevels) lines.push(`*Energy*: ${checkin.energyLevels}`);
  if (checkin?.physicalChanges) lines.push(`*Physical changes*: ${checkin.physicalChanges}`);
  if (checkin?.mentalState) lines.push(`*Mental*: ${checkin.mentalState}`);

  if (sessions.length) {
    lines.push("");
    lines.push(`*Sessions this week*: ${sessions.length}`);
  }

  if (notes) {
    lines.push("");
    lines.push(notes);
  }

  if (checkin?.attachPics) {
    lines.push("");
    lines.push("_Photos attached separately._");
  }

  return lines.join("\n");
}

/**
 * Human-friendly date heading, e.g. "Monday, Apr 28".
 */
export function prettyDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

/**
 * Check-in history helper: have we submitted one this ISO week already?
 */
export function hasCheckinForWeek(weekNum) {
  return getCheckinHistory().some((c) => c.weekNumber === weekNum);
}

const DAY_NAMES_FOR_DATE = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/**
 * Greeting based on local time of day. Returns plain-text string.
 */
export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h >= 4 && h < 11) return "Good morning";
  if (h >= 11 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 21) return "Good evening";
  return "Still up";
}

/**
 * Given an ISO date, return the day name lowercase (e.g. "monday").
 */
export function dayKeyForISO(iso) {
  return DAY_NAMES_FOR_DATE[new Date(iso + "T12:00:00").getDay()];
}

/**
 * Iterate N days backwards from today, returning ISO date strings newest first.
 */
export function lastNDates(n, endDate = new Date()) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(endDate);
    d.setDate(endDate.getDate() - i);
    out.push(todayISO(d));
  }
  return out;
}

/**
 * Monday-anchored week, returning { mondayISO, days: [iso...] } (Mon→Sun).
 */
export function currentWeekDays(today = new Date()) {
  const dow = today.getDay(); // 0=Sun..6=Sat
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(today);
  mon.setDate(today.getDate() + mondayOffset);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    days.push(todayISO(d));
  }
  return { mondayISO: todayISO(mon), days };
}

/**
 * A "tracked day" is any day where the user has SOME activity:
 * weight logged, or any meal status, or any session entry.
 * Returns the count of consecutive tracked days ending today (or yesterday
 * if today has nothing yet — so the streak isn't broken until a full day
 * passes with zero activity).
 */
export function activityStreak(today = new Date()) {
  const weights = getWeightLog();
  const weightDates = new Set(weights.map((w) => w.date));

  function hasActivity(iso) {
    if (weightDates.has(iso)) return true;
    const session = getSessionLog(iso);
    if (session && (session.exercises?.length > 0 || session.status)) return true;
    const meals = getMealLog(iso);
    if (meals && meals.length > 0) return true;
    return false;
  }

  let streak = 0;
  const todayIso = todayISO(today);
  const todayActive = hasActivity(todayIso);

  // If today has no activity yet, start counting from yesterday so the
  // streak doesn't reset at midnight.
  let start = todayActive ? 0 : 1;
  for (let i = start; i < 400; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = todayISO(d);
    if (hasActivity(iso)) streak++;
    else break;
  }
  return streak;
}

/**
 * Status summary for a given date, used by the week-strip dots.
 * Returns one of: 'done' | 'partial' | 'skipped' | 'rest' | 'pending' | 'future'
 */
export function statusForDate({ plan, iso, today = todayISO() }) {
  if (iso > today) return "future";
  const dayKey = dayKeyForISO(iso);
  return dayStatus({ workouts: plan.workouts, dayKey, date: iso });
}
