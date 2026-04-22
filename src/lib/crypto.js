// Web Crypto AES-GCM + PBKDF2 wrappers for the encrypted fitness plan payload.
// Runs browser-side; mirrors scripts/encrypt-plan.mjs.

const ITERATIONS = 100_000;

function fromB64(str) {
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function toB64(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const material = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    true,
    ["decrypt"]
  );
}

/**
 * Decrypt a payload with a password. Returns the decoded JSON plan.
 * Throws on wrong password or tampered ciphertext (AES-GCM authenticated).
 */
export async function decryptPlanWithPassword(payload, password) {
  const salt = fromB64(payload.salt);
  const iv = fromB64(payload.iv);
  const ct = fromB64(payload.ct);
  const key = await deriveKey(password, salt);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  const text = new TextDecoder().decode(plaintext);
  return { plan: JSON.parse(text), key };
}

/**
 * Export a CryptoKey to a base64 string for localStorage persistence.
 */
export async function exportKey(key) {
  const raw = await crypto.subtle.exportKey("raw", key);
  return toB64(new Uint8Array(raw));
}

/**
 * Import a base64-encoded raw key back into a CryptoKey.
 */
export async function importKey(b64) {
  const raw = fromB64(b64);
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM", length: 256 },
    true,
    ["decrypt"]
  );
}

/**
 * Decrypt a payload with an already-derived CryptoKey (skip PBKDF2).
 * Used on subsequent visits when the key is cached in localStorage.
 */
export async function decryptPlanWithKey(payload, key) {
  const iv = fromB64(payload.iv);
  const ct = fromB64(payload.ct);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return JSON.parse(new TextDecoder().decode(plaintext));
}
