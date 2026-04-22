import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPrefs,
  setPrefs,
  logout,
  exportAll,
  importAll,
} from "../../lib/storage";

export default function SettingsSheet({ onClose, onLogout }) {
  const [prefs, setLocal] = useState(() => getPrefs());
  const [status, setStatus] = useState("");
  const fileRef = useRef(null);

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
    setStatus("Exported");
    setTimeout(() => setStatus(""), 2000);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      importAll(data);
      setStatus("Imported — reloading…");
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setStatus("Import failed — invalid file");
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
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 bg-bg rounded-t-3xl max-h-[88vh] overflow-y-auto"
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
            boxShadow: "0 -8px 24px rgba(31, 31, 31, 0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pt-2 pb-1">
            <div className="h-1 w-10 rounded-full bg-line-bright" />
          </div>

          <div className="px-5 pb-6 max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-fg">Settings</h2>
              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center text-fg-muted active:scale-95 rounded-full"
                aria-label="close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <Row label="Coach WhatsApp">
              <input
                type="tel"
                inputMode="tel"
                placeholder="+91 98765 43210"
                value={prefs.coachWhatsApp || ""}
                onChange={(e) => save({ coachWhatsApp: e.target.value })}
                className="fit-input"
              />
              <p className="mt-1.5 text-xs text-fg-muted">
                Include country code. Used for weekly check-in messages.
              </p>
            </Row>

            <Row label="Default rest timer">
              <div className="flex gap-2">
                {[60, 90, 120, 180].map((s) => (
                  <button
                    key={s}
                    onClick={() => save({ restTimerSec: s })}
                    className={`flex-1 min-h-[48px] rounded-full text-sm font-medium transition active:scale-95 ${
                      prefs.restTimerSec === s
                        ? "bg-amber text-white"
                        : "bg-white border border-line text-fg-dim"
                    }`}
                  >
                    {s < 60
                      ? `${s}s`
                      : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Data backup">
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleExport} className="fit-btn flex-1">
                  Export JSON
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="fit-btn flex-1"
                >
                  Import JSON
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json"
                  onChange={handleImport}
                  className="hidden"
                />
              </div>
              <p className="mt-2 text-xs text-fg-muted">
                Back up before clearing browser data. Import overwrites all
                current dashboard data.
              </p>
              {status && (
                <div className="mt-2 text-sm text-term-green font-medium">
                  {status}
                </div>
              )}
            </Row>

            <Row label="Session">
              <button
                onClick={handleLogout}
                className="fit-btn-danger w-full"
              >
                Log out of this device
              </button>
              <p className="mt-2 text-xs text-fg-muted">
                Clears the cached decryption key. You&apos;ll enter your
                password next time you open /fitness.
              </p>
            </Row>

            <div className="mt-6 pt-5 border-t border-line-soft text-xs text-fg-muted leading-relaxed">
              <strong className="text-fg-dim">YouTube tip:</strong> sign into
              YouTube Premium in this browser for ad-free exercise demos. On
              iOS, if ads still appear, disable &ldquo;Prevent Cross-Site
              Tracking&rdquo; for this site in Safari settings.
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
      <label className="fit-label block mb-2">{label}</label>
      {children}
    </div>
  );
}
