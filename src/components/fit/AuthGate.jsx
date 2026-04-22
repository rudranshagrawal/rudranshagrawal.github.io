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
  const [status, setStatus] = useState("loading"); // loading | ready | no-payload
  const [payload, setPayload] = useState(null);
  const inputRef = useRef(null);

  // Load payload + try cached key on mount
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
      setError("wrong password");
      tap();
    } finally {
      setBusy(false);
      setPassword("");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-fg-muted text-xs animate-pulse">unlocking…</div>
      </div>
    );
  }

  if (status === "no-payload") {
    return (
      <div className="min-h-screen bg-bg text-fg font-mono flex items-center justify-center p-5">
        <div className="w-full max-w-md term-window">
          <div className="term-titlebar">
            <span className="term-dot" style={{ background: "#f87171" }} />
            <span className="term-dot" style={{ background: "#fbbf24" }} />
            <span className="term-dot" style={{ background: "#34d399" }} />
            <span className="ml-3 text-[11px] text-fg-muted">~/fitness — setup</span>
          </div>
          <div className="p-6 text-sm leading-relaxed">
            <div className="text-term-red mb-3">
              <span className="text-amber">$</span> payload not found
            </div>
            <div className="text-fg-dim mb-4">
              run the encrypt script to generate <code className="text-amber">public/fit-payload.json</code>:
            </div>
            <pre className="bg-bg-elev border border-line p-3 text-xs text-fg-dim whitespace-pre-wrap">
{`echo 'FITNESS_PLAN_PASSWORD=your-password' > .env.local
npm run encrypt-plan
git add public/fit-payload.json
git commit -m 'encrypted fitness plan'
git push`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg font-mono flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm term-window"
      >
        <div className="term-titlebar">
          <span className="term-dot" style={{ background: "#f87171" }} />
          <span className="term-dot" style={{ background: "#fbbf24" }} />
          <span className="term-dot" style={{ background: "#34d399" }} />
          <span className="ml-3 text-[11px] text-fg-muted">~/fitness — auth</span>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="mb-5">
            <div className="text-fg-dim text-sm mb-1">
              <span className="text-amber">$</span> sudo unlock
            </div>
            <div className="text-xs text-fg-muted">
              private dashboard. enter password to continue.
            </div>
          </div>

          <label htmlFor="fit-pw" className="text-[11px] text-fg-muted block mb-1.5">
            <span className="text-amber">&gt;</span> password
          </label>
          <input
            id="fit-pw"
            ref={inputRef}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            className="w-full bg-bg-elev border border-line text-fg text-base font-mono p-3 outline-none focus:border-amber transition disabled:opacity-50"
          />

          {error && (
            <div className="mt-3 text-xs text-term-red">
              <span className="text-amber">$</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !password}
            className="mt-5 w-full btn-primary justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? "decrypting…" : "unlock"}
          </button>

          <div className="mt-5 pt-4 border-t border-line text-[10px] text-fg-faint leading-relaxed">
            aes-gcm encrypted · key cached on this device so you won&apos;t be
            asked again until you log out from settings.
          </div>
        </form>
      </motion.div>
    </div>
  );
}
