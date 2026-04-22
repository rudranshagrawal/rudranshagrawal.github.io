import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { success, tap } from "../../lib/haptics";

/**
 * Full-width bottom-docked rest timer. Auto-starts after a set is logged.
 * Parent renders this and controls mount/unmount. `duration` in seconds.
 */
export default function RestTimer({ duration = 90, onDone, onSkip }) {
  const [remaining, setRemaining] = useState(duration);
  const [paused, setPaused] = useState(false);
  const endedRef = useRef(false);

  useEffect(() => {
    setRemaining(duration);
    endedRef.current = false;
  }, [duration]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1 && !endedRef.current) {
          endedRef.current = true;
          success();
          setTimeout(() => onDone?.(), 50);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused, onDone]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = Math.min(100, ((duration - remaining) / duration) * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className="fixed left-0 right-0 z-40 bg-bg-elev border-t border-amber"
        style={{ bottom: "calc(64px + env(safe-area-inset-bottom))" }}
      >
        <div className="h-1 bg-line">
          <div
            className="h-full bg-amber transition-all duration-1000 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-semibold tabular-nums text-amber">
              {mins}:{String(secs).padStart(2, "0")}
            </div>
            <div className="text-[10px] text-fg-muted uppercase tracking-wider">
              rest
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                tap();
                setRemaining((r) => Math.min(duration + 60, r + 15));
              }}
              className="h-11 min-w-[48px] px-3 border border-line text-fg-dim active:scale-95 text-sm"
              aria-label="add 15 seconds"
            >
              +15
            </button>
            <button
              onClick={() => {
                tap();
                setPaused((p) => !p);
              }}
              className="h-11 min-w-[48px] px-3 border border-line text-fg-dim active:scale-95 text-sm"
            >
              {paused ? "resume" : "pause"}
            </button>
            <button
              onClick={() => {
                tap();
                onSkip?.();
              }}
              className="h-11 min-w-[48px] px-3 border border-amber bg-amber text-bg active:scale-95 text-sm font-medium"
            >
              skip
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
