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

export function getMealLog(date) {
  return get(mealKey(date), []);
}

export function appendMealLog(date, entry) {
  const existing = getMealLog(date);
  set(mealKey(date), [...existing, entry]);
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
