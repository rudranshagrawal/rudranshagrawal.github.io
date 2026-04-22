import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { success, tap } from "../../lib/haptics";

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
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        className="fixed left-0 right-0 z-40 bg-white border-t border-line"
        style={{
          bottom: "env(safe-area-inset-bottom)",
          boxShadow: "0 -4px 12px rgba(31, 31, 31, 0.06)",
        }}
      >
        <div className="h-1 bg-line-soft">
          <div
            className="h-full bg-amber transition-all duration-1000 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="max-w-lg mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-fg-muted uppercase tracking-wider font-medium">
              Rest
            </div>
            <div className="text-2xl font-semibold tabular-nums text-fg">
              {mins}:{String(secs).padStart(2, "0")}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                tap();
                setRemaining((r) => Math.min(duration + 60, r + 15));
              }}
              className="h-11 min-w-[48px] px-3 rounded-full border border-line text-fg-dim text-sm active:scale-95"
              aria-label="add 15 seconds"
            >
              +15s
            </button>
            <button
              onClick={() => {
                tap();
                setPaused((p) => !p);
              }}
              className="h-11 min-w-[48px] px-3 rounded-full border border-line text-fg-dim text-sm active:scale-95"
            >
              {paused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={() => {
                tap();
                onSkip?.();
              }}
              className="h-11 min-w-[48px] px-4 rounded-full bg-amber text-white text-sm font-medium active:scale-95"
            >
              Skip
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
