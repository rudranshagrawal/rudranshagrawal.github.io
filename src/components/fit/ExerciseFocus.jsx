import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import YouTubeEmbed from "./YouTubeEmbed";
import RestTimer from "./RestTimer";
import { lastBestSet } from "../../lib/fitness-format";
import { getPrefs } from "../../lib/storage";
import { success, bump, tap } from "../../lib/haptics";

/**
 * Fullscreen single-exercise Focus Mode. Big inputs, big "Log Set" button,
 * auto rest timer, swipe to next exercise. Designed for mid-workout phone use.
 */
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

  // Lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Seed inputs from last-week best or previous set when exercise changes
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
        className="fixed inset-0 z-[60] bg-[#000000] text-fg flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <button
            onClick={onClose}
            className="h-11 w-11 flex items-center justify-center text-fg-muted active:scale-95"
            aria-label="close focus"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="text-[11px] text-fg-muted">
            {idx + 1} / {exercises.length}
          </div>
          <div className="w-11" />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-[11px] text-amber mb-2 uppercase tracking-wider">
            focus
          </div>
          <h2 className="text-2xl text-fg mb-4">{current.name}</h2>

          {current.youtubeId && (
            <div className="mb-5">
              <YouTubeEmbed videoId={current.youtubeId} title={current.name} />
            </div>
          )}

          {/* Big inputs */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <BigNum label="weight (kg)" value={weight} step={2.5} onChange={setWeight} />
            <BigNum label="reps" value={reps} step={1} onChange={setReps} />
          </div>

          <button
            onClick={logSet}
            className="w-full min-h-[64px] bg-amber text-bg text-lg font-semibold active:scale-[0.98] transition"
          >
            log set {sets.length + 1}
          </button>

          {/* Set history */}
          {sets.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] text-fg-muted uppercase tracking-wider mb-2">
                this session
              </div>
              <div className="space-y-1">
                {sets.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-fg-muted w-8">#{i + 1}</span>
                    <span className="text-fg tabular-nums">
                      {s.weight}kg × {s.reps}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mt-6">
            <label className="text-[11px] text-fg-muted uppercase tracking-wider mb-2 block">
              notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotesFor(current.name, e.target.value)}
              rows={2}
              placeholder="form cues, how it felt..."
              className="w-full bg-bg-elev border border-line text-fg text-sm font-mono p-3 outline-none focus:border-amber transition resize-none"
            />
          </div>

          {/* Nav */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={prev}
              disabled={idx === 0}
              className="min-h-[56px] border border-line text-fg-dim active:scale-95 disabled:opacity-30"
            >
              ← prev
            </button>
            <button
              onClick={next}
              className="min-h-[56px] border border-line text-fg-dim active:scale-95"
            >
              {idx === exercises.length - 1 ? "finish →" : "next →"}
            </button>
          </div>

          {/* Spacer so content isn't hidden behind rest timer */}
          <div className="h-32" />
        </div>

        {/* Rest timer */}
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
    <div className="border border-line bg-bg-panel flex flex-col">
      <div className="text-[10px] text-fg-muted uppercase tracking-wider px-3 pt-2">
        {label}
      </div>
      <div className="flex items-center">
        <button
          onClick={dec}
          className="w-14 h-20 flex items-center justify-center text-fg-dim active:bg-bg-elev text-2xl"
          aria-label={`decrease ${label}`}
        >
          −
        </button>
        <div className="flex-1 text-center text-3xl tabular-nums font-semibold text-fg">
          {value ?? 0}
        </div>
        <button
          onClick={inc}
          className="w-14 h-20 flex items-center justify-center text-fg-dim active:bg-bg-elev text-2xl"
          aria-label={`increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
