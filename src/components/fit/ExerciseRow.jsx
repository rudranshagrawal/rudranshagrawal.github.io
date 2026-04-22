import { useState } from "react";
import YouTubeEmbed from "./YouTubeEmbed";
import { lastBestSet } from "../../lib/fitness-format";
import { bump } from "../../lib/haptics";

/**
 * Collapsed exercise in the Workout tab list. Taps to expand: YouTube + sets
 * logger + notes. Tapping "focus" takes the user into full-screen Focus Mode
 * (owned by parent).
 */
export default function ExerciseRow({
  exercise,
  todayISO,
  sets,
  onSetsChange,
  notes,
  onNotesChange,
  onOpenFocus,
}) {
  const [open, setOpen] = useState(false);
  const last = lastBestSet(exercise.name, todayISO);

  return (
    <div className="border border-line bg-bg-panel">
      <button
        onClick={() => {
          bump();
          setOpen((v) => !v);
        }}
        className="w-full min-h-[64px] flex items-center justify-between gap-3 px-4 py-3 text-left active:bg-bg-elev transition"
      >
        <div className="min-w-0 flex-1">
          <div className="text-fg text-base truncate">{exercise.name}</div>
          <div className="text-[11px] text-fg-muted mt-0.5">
            {exercise.scheme || "3×10–12"}
            {last && (
              <span className="ml-3 text-fg-faint">
                last: {last.weight ?? "?"}kg × {last.reps ?? "?"}
              </span>
            )}
            {sets?.length > 0 && (
              <span className="ml-3 text-term-green">✓ {sets.length} logged</span>
            )}
          </div>
        </div>
        <span className="text-fg-muted text-xs">{open ? "[ − ]" : "[ + ]"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-line">
          {exercise.youtubeId && (
            <div className="mt-3">
              <YouTubeEmbed videoId={exercise.youtubeId} title={exercise.name} />
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="text-[11px] text-fg-muted uppercase tracking-wider">sets</div>
            <button
              onClick={onOpenFocus}
              className="text-xs text-amber active:scale-95"
            >
              focus mode →
            </button>
          </div>

          <SetsEditor
            sets={sets}
            onChange={onSetsChange}
            suggestedWeight={last?.weight}
            suggestedReps={last?.reps}
          />

          <label className="text-[11px] text-fg-muted block mt-4 mb-1.5">
            <span className="text-amber">&gt;</span> notes
          </label>
          <textarea
            value={notes || ""}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
            placeholder="form cues, how it felt..."
            className="w-full bg-bg-elev border border-line text-fg text-sm font-mono p-2.5 outline-none focus:border-amber transition resize-none"
          />
        </div>
      )}
    </div>
  );
}

function SetsEditor({ sets = [], onChange, suggestedWeight, suggestedReps }) {
  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    const next = {
      weight: lastSet?.weight ?? suggestedWeight ?? 0,
      reps: lastSet?.reps ?? suggestedReps ?? 10,
      rpe: null,
    };
    onChange([...sets, next]);
    bump();
  };

  const updateSet = (i, partial) => {
    const copy = [...sets];
    copy[i] = { ...copy[i], ...partial };
    onChange(copy);
  };

  const removeSet = (i) => {
    onChange(sets.filter((_, idx) => idx !== i));
  };

  return (
    <div className="mt-2 space-y-2">
      {sets.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="text-xs text-fg-muted w-6">#{i + 1}</div>
          <NumField
            label="kg"
            value={s.weight}
            step={2.5}
            onChange={(v) => updateSet(i, { weight: v })}
          />
          <NumField
            label="reps"
            value={s.reps}
            step={1}
            onChange={(v) => updateSet(i, { reps: v })}
          />
          <button
            onClick={() => removeSet(i)}
            className="h-11 w-11 flex items-center justify-center text-fg-faint active:scale-90"
            aria-label="remove set"
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={addSet}
        className="w-full min-h-[48px] border border-dashed border-line-bright text-fg-dim text-sm active:scale-[0.98] transition hover:border-amber hover:text-amber"
      >
        + add set
      </button>
    </div>
  );
}

function NumField({ label, value, step, onChange }) {
  return (
    <div className="flex-1 flex items-stretch border border-line">
      <button
        onClick={() => onChange(Math.max(0, +(value - step).toFixed(2)))}
        className="w-10 text-fg-dim active:bg-bg-elev text-lg"
        aria-label={`decrease ${label}`}
      >
        −
      </button>
      <div className="flex-1 flex flex-col items-center justify-center py-1.5 bg-bg-elev">
        <div className="text-base text-fg tabular-nums leading-tight">{value ?? 0}</div>
        <div className="text-[9px] text-fg-muted">{label}</div>
      </div>
      <button
        onClick={() => onChange(+(Number(value || 0) + step).toFixed(2))}
        className="w-10 text-fg-dim active:bg-bg-elev text-lg"
        aria-label={`increase ${label}`}
      >
        +
      </button>
    </div>
  );
}
