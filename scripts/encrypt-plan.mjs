#!/usr/bin/env node
/**
 * Build-time encryption of the plaintext fitness plan.
 *
 *   Input:   src/data/fit-plan.source.js  (ES module exporting `plan`, gitignored)
 *   Input:   .env.local  (must contain FITNESS_PLAN_PASSWORD)
 *   Output:  src/data/fit-payload.json  (opaque AES-GCM ciphertext — safe to commit)
 *
 * Usage:
 *   echo "FITNESS_PLAN_PASSWORD=your-password" > .env.local
 *   npm run encrypt-plan
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SOURCE = resolve(ROOT, "src/data/fit-plan.source.js");
const OUT = resolve(ROOT, "public/fit-payload.json");
const ENV_FILE = resolve(ROOT, ".env.local");

// Minimal .env.local parser (no dep)
function loadEnv() {
  if (!existsSync(ENV_FILE)) return {};
  const raw = readFileSync(ENV_FILE, "utf8");
  const out = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

function b64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await webcrypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return webcrypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  );
}

async function main() {
  if (!existsSync(SOURCE)) {
    console.error(`[encrypt-plan] Missing plaintext source: ${SOURCE}`);
    console.error("Create it first (it will be gitignored) with a default export of your plan object.");
    process.exit(1);
  }

  const env = loadEnv();
  const password = env.FITNESS_PLAN_PASSWORD || process.env.FITNESS_PLAN_PASSWORD;
  if (!password) {
    console.error("[encrypt-plan] FITNESS_PLAN_PASSWORD not set in .env.local or environment.");
    process.exit(1);
  }

  // Dynamic import the plaintext plan module
  const mod = await import(pathToFileURL(SOURCE).href);
  const plan = mod.default ?? mod.plan;
  if (!plan) {
    console.error("[encrypt-plan] Source must `export default` (or `export const plan =`) the plan object.");
    process.exit(1);
  }
  const plaintext = new TextEncoder().encode(JSON.stringify(plan));

  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = new Uint8Array(
    await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext)
  );

  const payload = {
    v: 1,
    alg: "AES-GCM",
    kdf: "PBKDF2-SHA256-100000",
    salt: b64(salt),
    iv: b64(iv),
    ct: b64(ciphertext),
  };

  writeFileSync(OUT, JSON.stringify(payload, null, 2));
  console.log(`[encrypt-plan] ✓ Wrote ${OUT} (${ciphertext.length} bytes ciphertext)`);
}

main().catch((e) => {
  console.error("[encrypt-plan] failed:", e);
  process.exit(1);
});
