import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  decryptPlanWithPassword,
  decryptPlanWithKey,
  exportKey,
  importKey,
} from "../../lib/crypto";
import { get, set, KEYS } from "../../lib/storage";
import { tap, success } from "../../lib/haptics";

const PAYLOAD_URL = "/fit-payload.json";

async function fetchPayload() {
  const res = await fetch(PAYLOAD_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error(`payload fetch failed: ${res.status}`);
  return res.json();
}

export default function AuthGate({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("loading");
  const [payload, setPayload] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let p;
      try {
        p = await fetchPayload();
      } catch {
        if (!cancelled) setStatus("no-payload");
        return;
      }
      if (cancelled) return;
      setPayload(p);

      const cached = get(KEYS.KEY_B64);
      if (!cached) {
        setStatus("ready");
        return;
      }
      try {
        const key = await importKey(cached);
        const plan = await decryptPlanWithKey(p, key);
        if (!cancelled) onUnlock(plan);
      } catch {
        set(KEYS.KEY_B64, null);
        if (!cancelled) setStatus("ready");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onUnlock]);

  useEffect(() => {
    if (status === "ready") setTimeout(() => inputRef.current?.focus(), 100);
  }, [status]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!password || busy || !payload) return;
    setBusy(true);
    setError("");
    try {
      const { plan, key } = await decryptPlanWithPassword(payload, password);
      const raw = await exportKey(key);
      set(KEYS.KEY_B64, raw);
      success();
      onUnlock(plan);
    } catch {
      setError("Wrong password");
      tap();
    } finally {
      setBusy(false);
      setPassword("");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-fg-muted text-sm">Unlocking…</div>
      </div>
    );
  }

  if (status === "no-payload") {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="w-full max-w-md fit-card p-7">
          <div className="h-12 w-12 rounded-full bg-term-red/10 text-term-red flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-fg mb-2">Setup required</h1>
          <p className="text-sm text-fg-dim leading-relaxed mb-4">
            The encrypted plan hasn&apos;t been generated yet. Run this in your
            terminal, then refresh:
          </p>
          <pre className="bg-bg-elev rounded-xl p-4 text-xs text-fg-dim whitespace-pre-wrap overflow-x-auto">
{`echo 'FITNESS_PLAN_PASSWORD=your-password' > .env.local
npm run encrypt-plan
git add public/fit-payload.json
git commit -m 'Encrypted fitness plan'
git push`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-amber text-white flex items-center justify-center mb-3 shadow-sm">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Fitness</h1>
          <p className="text-sm text-fg-muted mt-1">Private dashboard</p>
        </div>

        <form onSubmit={onSubmit} className="fit-card p-6">
          <label
            htmlFor="fit-pw"
            className="fit-label block mb-2"
          >
            Password
          </label>
          <input
            id="fit-pw"
            ref={inputRef}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            className="fit-input disabled:opacity-50"
            placeholder="Enter to unlock"
          />

          {error && (
            <div className="mt-3 text-sm text-term-red">{error}</div>
          )}

          <button
            type="submit"
            disabled={busy || !password}
            className="fit-btn-primary w-full mt-5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? "Unlocking…" : "Unlock"}
          </button>

          <p className="mt-5 text-xs text-fg-faint leading-relaxed">
            You&apos;ll only be asked once per device. Tap &ldquo;Log out&rdquo;
            in Settings to reset.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
