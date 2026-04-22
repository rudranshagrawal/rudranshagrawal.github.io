// Typed, namespaced localStorage helpers for the fitness dashboard.
// All keys are prefixed `fit-` to avoid collisions with the rest of the site.

const PREFIX = "fit-";

function fullKey(key) {
  return key.startsWith(PREFIX) ? key : PREFIX + key;
}

function safeParse(str, fallback) {
  if (str == null) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export function get(key, fallback = null) {
  if (typeof window === "undefined") return fallback;
  try {
    return safeParse(localStorage.getItem(fullKey(key)), fallback);
  } catch {
    return fallback;
  }
}

export function set(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(fullKey(key), JSON.stringify(value));
  } catch (e) {
    console.warn("[storage] set failed", key, e);
  }
}

export function remove(key) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(fullKey(key));
  } catch {}
}

// --- Domain-specific helpers ---

export const KEYS = {
  KEY_B64: "key", // persistent decryption key
  PREFS: "prefs",
  WEIGHT_LOG: "weight-log",
  CHECKIN_HISTORY: "checkin-history",
  CHAT_HISTORY: "chat-history",
  AI_USAGE: "ai-usage", // { date: "YYYY-MM-DD", count: n }
};

export function sessionKey(date) {
  return `session-log/${date}`;
}
export function mealKey(date) {
  return `meal-log/${date}`;
}

export function getPrefs() {
  return get(KEYS.PREFS, {
    coachWhatsApp: "",
    restTimerSec: 90,
    units: "kg",
  });
}

export function setPrefs(partial) {
  set(KEYS.PREFS, { ...getPrefs(), ...partial });
}

export function getSessionLog(date) {
  return get(sessionKey(date), null);
}

export function saveSessionLog(date, log) {
  set(sessionKey(date), log);
}

/**
 * Quick-mark an exercise as either "done" or "skipped".
 * - done: if no sets yet, seed with suggested sets (1 set with current values).
 * - skipped: sets an explicit status; preserves any existing logs.
 */
export function quickMarkExercise(date, exerciseName, status, seedSet = null) {
  const log = getSessionLog(date) || { exercises: [], sessionNotes: "" };
  const idx = log.exercises.findIndex((e) => e.name === exerciseName);
  if (idx >= 0) {
    const ex = { ...log.exercises[idx], status };
    if (status === "done" && (!ex.sets || ex.sets.length === 0) && seedSet) {
      ex.sets = [seedSet];
    }
    log.exercises[idx] = ex;
  } else {
    log.exercises.push({
      name: exerciseName,
      sets: status === "done" && seedSet ? [seedSet] : [],
      notes: "",
      status,
    });
  }
  saveSessionLog(date, log);
  return log;
}

/**
 * Clear status for an exercise (back to pending). Doesn't remove logged sets.
 */
export function clearExerciseStatus(date, exerciseName) {
  const log = getSessionLog(date);
  if (!log) return;
  const idx = log.exercises.findIndex((e) => e.name === exerciseName);
  if (idx < 0) return;
  const ex = { ...log.exercises[idx] };
  delete ex.status;
  log.exercises[idx] = ex;
  saveSessionLog(date, log);
}

/**
 * Compute exercise status from existing data:
 *   - explicit 'skipped' → 'skipped'
 *   - explicit 'done' OR sets.length > 0 → 'done'
 *   - else null (pending)
 */
export function exerciseStatus(log, exerciseName) {
  const ex = log?.exercises?.find((e) => e.name === exerciseName);
  if (!ex) return null;
  if (ex.status === "skipped") return "skipped";
  if (ex.status === "done" || (ex.sets && ex.sets.length > 0)) return "done";
  return null;
}

/**
 * Compute a day's status summary from the plan's workout + the session log.
 *   rest, skipped (whole day skipped), done (all exercises addressed),
 *   partial (some addressed), pending (nothing logged yet).
 */
export function dayStatus({ workouts, dayKey, date }) {
  const day = workouts?.[dayKey];
  if (!day) return "pending";
  if (day.rest) return "rest";
  const log = getSessionLog(date);
  const exercises = day.exercises || [];
  if (!log || !log.exercises || log.exercises.length === 0) return "pending";
  if (log.status === "skipped") return "skipped";
  let done = 0;
  let skipped = 0;
  for (const ex of exercises) {
    const st = exerciseStatus(log, ex.name);
    if (st === "done") done++;
    else if (st === "skipped") skipped++;
  }
  const addressed = done + skipped;
  if (addressed === 0) return "pending";
  if (addressed < exercises.length) return "partial";
  if (done === 0) return "skipped";
  return "done";
}

/**
 * Mark the entire workout day as skipped.
 */
export function skipWorkoutDay(date) {
  const existing = getSessionLog(date) || { exercises: [], sessionNotes: "" };
  saveSessionLog(date, { ...existing, status: "skipped" });
}

export function unSkipWorkoutDay(date) {
  const log = getSessionLog(date);
  if (!log) return;
  const { status, ...rest } = log;
  saveSessionLog(date, rest);
}

export function getMealLog(date) {
  return get(mealKey(date), []);
}

export function appendMealLog(date, entry) {
  const existing = getMealLog(date);
  const status = entry.status || "eaten";
  set(mealKey(date), [...existing, { ...entry, status }]);
}

/**
 * Quick-mark a meal as either "eaten" or "skipped" with minimal data.
 * Overwrites any previous entry for that meal on that date.
 */
export function quickMarkMeal(date, mealId, mealTitle, status) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const existing = getMealLog(date).filter((e) => e.mealId !== mealId);
  const entry = {
    mealId,
    mealTitle,
    status,
    timeEaten: status === "eaten" ? `${hh}:${mm}` : "",
    minutesToCook: 0,
    notes: "",
    loggedAt: new Date().toISOString(),
  };
  set(mealKey(date), [...existing, entry]);
  return entry;
}

/**
 * Remove a meal entry for the given meal id on a date (sets it back to pending).
 */
export function clearMealEntry(date, mealId) {
  const existing = getMealLog(date).filter((e) => e.mealId !== mealId);
  set(mealKey(date), existing);
}

/**
 * Get the status for a specific meal on a date:
 *   'eaten' | 'skipped' | null
 */
export function getMealStatus(date, mealId) {
  const entries = getMealLog(date);
  const latest = entries.filter((e) => e.mealId === mealId).slice(-1)[0];
  return latest?.status ?? null;
}

export function getWeightLog() {
  return get(KEYS.WEIGHT_LOG, []);
}

export function addWeight(date, kg) {
  const log = getWeightLog();
  const filtered = log.filter((e) => e.date !== date); // overwrite same-day
  set(KEYS.WEIGHT_LOG, [...filtered, { date, kg }].sort((a, b) => a.date.localeCompare(b.date)));
}

export function getCheckinHistory() {
  return get(KEYS.CHECKIN_HISTORY, []);
}

export function addCheckin(entry) {
  const existing = getCheckinHistory();
  set(KEYS.CHECKIN_HISTORY, [...existing, entry]);
}

export function getChatHistory() {
  return get(KEYS.CHAT_HISTORY, []);
}

export function setChatHistory(messages) {
  set(KEYS.CHAT_HISTORY, messages);
}

export function clearChatHistory() {
  set(KEYS.CHAT_HISTORY, []);
}

// --- Scan helpers for Log tab / export ---

/**
 * Return all session logs keyed by date, sorted most-recent first.
 */
export function allSessions() {
  if (typeof window === "undefined") return [];
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k?.startsWith(PREFIX + "session-log/")) continue;
    const date = k.replace(PREFIX + "session-log/", "");
    out.push({ date, log: safeParse(localStorage.getItem(k), null) });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export function allMeals() {
  if (typeof window === "undefined") return [];
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k?.startsWith(PREFIX + "meal-log/")) continue;
    const date = k.replace(PREFIX + "meal-log/", "");
    out.push({ date, entries: safeParse(localStorage.getItem(k), []) });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Dump every fit-* key into a single JSON object for export.
 */
export function exportAll() {
  if (typeof window === "undefined") return {};
  const out = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(PREFIX)) {
      out[k] = localStorage.getItem(k);
    }
  }
  return out;
}

/**
 * Restore from a previously-exported dump. Overwrites existing fit-* keys.
 */
export function importAll(dump) {
  if (typeof window === "undefined" || !dump || typeof dump !== "object") return;
  // wipe existing fit-* first
  const toRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(PREFIX)) toRemove.push(k);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
  // restore
  for (const [k, v] of Object.entries(dump)) {
    if (typeof k === "string" && k.startsWith(PREFIX) && typeof v === "string") {
      localStorage.setItem(k, v);
    }
  }
}

export function logout() {
  remove(KEYS.KEY_B64);
}
