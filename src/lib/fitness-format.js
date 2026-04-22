// Formatting helpers for WhatsApp message drafts, weekly summaries, and
// AI context payloads. Pure functions, no side effects.

import { allSessions, allMeals, getWeightLog, getCheckinHistory } from "./storage";

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
