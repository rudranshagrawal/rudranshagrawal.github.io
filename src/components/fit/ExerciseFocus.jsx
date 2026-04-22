import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import YouTubeEmbed from "./YouTubeEmbed";
import RestTimer from "./RestTimer";
import { lastBestSet } from "../../lib/fitness-format";
import { getPrefs } from "../../lib/storage";
import { success, tap } from "../../lib/haptics";

export default function ExerciseFocus({
  exercises,
  startIndex = 0,
  todayISO,
  getSetsFor,
  setSetsFor,
  getNotesFor,
  setNotesFor,
  onClose,
}) {
  const [idx, setIdx] = useState(startIndex);
  const current = exercises[idx];
  const [restActive, setRestActive] = useState(false);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const prefs = getPrefs();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const sets = getSetsFor(current.name) || [];
    const last = sets[sets.length - 1] || lastBestSet(current.name, todayISO);
    setWeight(last?.weight ?? 0);
    setReps(last?.reps ?? 10);
    setRestActive(false);
  }, [idx, current.name, getSetsFor, todayISO]);

  const sets = getSetsFor(current.name) || [];
  const notes = getNotesFor(current.name) || "";

  const logSet = () => {
    const next = [...sets, { weight, reps, rpe: null }];
    setSetsFor(current.name, next);
    success();
    setRestActive(true);
  };

  const prev = () => {
    if (idx > 0) {
      tap();
      setIdx(idx - 1);
    }
  };
  const next = () => {
    if (idx < exercises.length - 1) {
      tap();
      setIdx(idx + 1);
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-bg flex flex-col fit-theme"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-line-soft"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}
        >
          <button
            onClick={onClose}
            className="h-11 w-11 flex items-center justify-center text-fg-dim active:scale-95 rounded-full hover:bg-bg-elev"
            aria-label="close focus"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="text-xs text-fg-muted font-medium">
            {idx + 1} of {exercises.length}
          </div>
          <div className="w-11" />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-5 pt-4 pb-10">
          <div className="fit-label mb-1">Focus</div>
          <h2 className="text-2xl font-semibold tracking-tight text-fg mb-5">
            {current.name}
          </h2>

          {current.youtubeId && (
            <div className="mb-6">
              <YouTubeEmbed videoId={current.youtubeId} title={current.name} />
            </div>
          )}

          {/* Big inputs */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <BigNum label="Weight (kg)" value={weight} step={2.5} onChange={setWeight} />
            <BigNum label="Reps" value={reps} step={1} onChange={setReps} />
          </div>

          <button
            onClick={logSet}
            className="w-full min-h-[60px] bg-amber text-white text-base font-semibold rounded-2xl active:scale-[0.98] transition"
            style={{ boxShadow: "0 2px 6px rgba(74, 127, 106, 0.35)" }}
          >
            Log set {sets.length + 1}
          </button>

          {sets.length > 0 && (
            <div className="mt-6">
              <div className="fit-label mb-2">This session</div>
              <div className="bg-bg-elev rounded-xl divide-y divide-line-soft">
                {sets.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 px-4"
                  >
                    <span className="text-sm text-fg-muted tabular-nums">#{i + 1}</span>
                    <span className="text-sm font-medium text-fg tabular-nums">
                      {s.weight} kg × {s.reps}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="fit-label block mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotesFor(current.name, e.target.value)}
              rows={2}
              placeholder="Form cues, how it felt…"
              className="fit-input resize-none text-sm"
            />
          </div>

          {/* Nav */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={prev}
              disabled={idx === 0}
              className="fit-btn disabled:opacity-40"
            >
              ← Prev
            </button>
            <button onClick={next} className="fit-btn">
              {idx === exercises.length - 1 ? "Finish →" : "Next →"}
            </button>
          </div>

          {/* Spacer for rest timer */}
          <div className="h-28" />
        </div>

        {restActive && (
          <RestTimer
            duration={prefs.restTimerSec || 90}
            onDone={() => setRestActive(false)}
            onSkip={() => setRestActive(false)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function BigNum({ label, value, step, onChange }) {
  const dec = () => onChange(Math.max(0, +(Number(value || 0) - step).toFixed(2)));
  const inc = () => onChange(+(Number(value || 0) + step).toFixed(2));
  return (
    <div className="border border-line rounded-2xl bg-white overflow-hidden">
      <div className="text-[10px] font-medium text-fg-muted uppercase tracking-wider px-4 pt-3">
        {label}
      </div>
      <div className="flex items-center">
        <button
          onClick={dec}
          className="w-14 h-20 flex items-center justify-center text-fg-dim active:bg-bg-elev text-xl font-medium"
          aria-label={`decrease ${label}`}
        >
          −
        </button>
        <div className="flex-1 text-center text-3xl tabular-nums font-semibold text-fg">
          {value ?? 0}
        </div>
        <button
          onClick={inc}
          className="w-14 h-20 flex items-center justify-center text-fg-dim active:bg-bg-elev text-xl font-medium"
          aria-label={`increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
