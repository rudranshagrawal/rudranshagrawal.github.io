import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPrefs, setPrefs, logout, exportAll, importAll } from "../../lib/storage";

export default function SettingsSheet({ onClose, onLogout }) {
  const [prefs, setLocal] = useState(() => getPrefs());
  const [status, setStatus] = useState("");
  const fileRef = useRef(null);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const save = (partial) => {
    const next = { ...prefs, ...partial };
    setLocal(next);
    setPrefs(partial);
  };

  const handleExport = () => {
    const dump = exportAll();
    const blob = new Blob([JSON.stringify(dump, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `fitness-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("exported");
    setTimeout(() => setStatus(""), 2000);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      importAll(data);
      setStatus("imported — reload to see changes");
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setStatus("import failed — invalid file");
    }
  };

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 bg-bg border-t border-amber max-h-[88vh] overflow-y-auto"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Grab handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="h-1 w-10 rounded-full bg-line-bright" />
          </div>

          <div className="px-5 pb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg text-fg">
                <span className="text-amber">$</span> settings
              </h2>
              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center text-fg-muted active:scale-95"
                aria-label="close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <Row label="coach whatsapp number">
              <input
                type="tel"
                inputMode="tel"
                placeholder="+91 98765 43210"
                value={prefs.coachWhatsApp || ""}
                onChange={(e) => save({ coachWhatsApp: e.target.value })}
                className="w-full bg-bg-elev border border-line text-fg font-mono text-sm p-3 outline-none focus:border-amber transition"
              />
              <p className="mt-1 text-[10px] text-fg-faint">
                include country code (e.g. +91 for india).
              </p>
            </Row>

            <Row label="default rest timer">
              <div className="flex gap-2">
                {[60, 90, 120, 180].map((s) => (
                  <button
                    key={s}
                    onClick={() => save({ restTimerSec: s })}
                    className={`flex-1 min-h-[48px] border text-sm transition ${
                      prefs.restTimerSec === s
                        ? "border-amber bg-amber text-bg"
                        : "border-line text-fg-dim active:scale-95"
                    }`}
                  >
                    {s < 60 ? `${s}s` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="data backup">
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleExport} className="btn flex-1 justify-center">
                  export json
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="btn flex-1 justify-center"
                >
                  import json
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json"
                  onChange={handleImport}
                  className="hidden"
                />
              </div>
              <p className="mt-2 text-[10px] text-fg-faint">
                back up before clearing browser data. import overwrites all
                current fit-* data.
              </p>
              {status && (
                <div className="mt-2 text-[11px] text-term-green">{status}</div>
              )}
            </Row>

            <Row label="session">
              <button
                onClick={handleLogout}
                className="btn w-full justify-center border-term-red/40 text-term-red hover:border-term-red hover:text-term-red"
              >
                log out of this device
              </button>
              <p className="mt-2 text-[10px] text-fg-faint">
                clears the cached decryption key. you&apos;ll enter your password
                next time you open <code className="text-amber">/fitness</code>.
              </p>
            </Row>

            <div className="mt-6 pt-4 border-t border-line text-[10px] text-fg-faint">
              tip: sign into youtube premium in this browser for ad-free
              exercise demos. if ads still appear on ios, disable &quot;prevent
              cross-site tracking&quot; for this site.
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Row({ label, children }) {
  return (
    <div className="mb-6">
      <label className="text-[11px] text-fg-muted block mb-2 uppercase tracking-wider">
        <span className="text-fg-faint">//</span> {label}
      </label>
      {children}
    </div>
  );
}
