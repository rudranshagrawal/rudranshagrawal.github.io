import { useState } from "react";
import YouTubeEmbed from "./YouTubeEmbed";
import { lastBestSet } from "../../lib/fitness-format";
import {
  quickMarkExercise,
  clearExerciseStatus,
  exerciseStatus,
  getSessionLog,
} from "../../lib/storage";
import { bump, success, tap } from "../../lib/haptics";

export default function ExerciseRow({
  exercise,
  todayISO,
  sets,
  onSetsChange,
  notes,
  onNotesChange,
  onOpenFocus,
  onStatusChange,
}) {
  const [open, setOpen] = useState(false);
  const last = lastBestSet(exercise.name, todayISO);

  const sessionLog = getSessionLog(todayISO);
  const status = exerciseStatus(sessionLog, exercise.name);

  const markDone = () => {
    if (status === "done") {
      clearExerciseStatus(todayISO, exercise.name);
      tap();
    } else {
      // If no sets yet, seed with last week's best (or placeholder)
      const seed =
        !sets || sets.length === 0
          ? {
              weight: last?.weight ?? 0,
              reps: last?.reps ?? 10,
              rpe: null,
            }
          : null;
      quickMarkExercise(todayISO, exercise.name, "done", seed);
      success();
    }
    onStatusChange?.();
  };

  const markSkipped = () => {
    if (status === "skipped") {
      clearExerciseStatus(todayISO, exercise.name);
    } else {
      quickMarkExercise(todayISO, exercise.name, "skipped");
    }
    tap();
    onStatusChange?.();
  };

  return (
    <div className="border border-line rounded-xl bg-white overflow-hidden">
      <div className="flex items-stretch">
        <button
          onClick={() => {
            bump();
            setOpen((v) => !v);
          }}
          className="flex-1 min-h-[64px] flex items-center gap-3 px-4 py-3 text-left active:bg-bg-elev transition"
        >
          <StatusDot status={status} />
          <div className="min-w-0 flex-1">
            <div className="text-base font-medium text-fg truncate">
              {exercise.name}
            </div>
            <div className="text-xs text-fg-muted mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{exercise.scheme || "3×10–12"}</span>
              {last && (
                <span className="text-fg-faint">
                  · last: {last.weight ?? "?"}kg × {last.reps ?? "?"}
                </span>
              )}
              {sets?.length > 0 && (
                <span className="text-[rgb(var(--fit-done))] font-medium">
                  · {sets.length} logged
                </span>
              )}
              {status === "skipped" && (
                <span className="text-[rgb(var(--fit-skipped))] font-medium">
                  · skipped
                </span>
              )}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1.5 pr-3">
          <QuickAction
            active={status === "done"}
            onClick={markDone}
            variant="done"
            label="Mark done"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5L20 7" />
            </svg>
          </QuickAction>
          <QuickAction
            active={status === "skipped"}
            onClick={markSkipped}
            variant="skipped"
            label="Skip exercise"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </QuickAction>
        </div>
      </div>

      {open && (
        <div className="border-t border-line-soft px-4 pb-4 pt-3 space-y-3">
          {exercise.youtubeId && (
            <YouTubeEmbed videoId={exercise.youtubeId} title={exercise.name} />
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="fit-label">Sets</div>
            <button
              onClick={onOpenFocus}
              className="text-xs font-semibold text-amber active:scale-95"
            >
              Focus mode →
            </button>
          </div>

          <SetsEditor
            sets={sets}
            onChange={onSetsChange}
            suggestedWeight={last?.weight}
            suggestedReps={last?.reps}
          />

          <div>
            <label className="fit-label block mb-2">Notes</label>
            <textarea
              value={notes || ""}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={2}
              placeholder="Form cues, how it felt…"
              className="fit-input resize-none text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }) {
  if (status === "done") {
    return (
      <div className="h-7 w-7 rounded-full bg-[rgb(var(--fit-done))] text-white flex items-center justify-center shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 5 5L20 7" />
        </svg>
      </div>
    );
  }
  if (status === "skipped") {
    return (
      <div className="h-7 w-7 rounded-full bg-[rgb(var(--fit-skipped))] text-white flex items-center justify-center shrink-0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </div>
    );
  }
  return (
    <div className="h-7 w-7 rounded-full border-2 border-line shrink-0" />
  );
}

function QuickAction({ active, onClick, variant, label, children }) {
  const base =
    "h-11 w-11 rounded-full flex items-center justify-center transition active:scale-90 shrink-0";
  const inactive = "border border-line text-fg-muted hover:text-fg";
  const doneActive = "bg-[rgb(var(--fit-done))] text-white";
  const skippedActive = "bg-[rgb(var(--fit-skipped))] text-white";
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`${base} ${active ? (variant === "done" ? doneActive : skippedActive) : inactive}`}
    >
      {children}
    </button>
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

  const removeSet = (i) => onChange(sets.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {sets.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="text-xs text-fg-muted w-6 tabular-nums">
            {i + 1}.
          </div>
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
            className="h-11 w-11 flex items-center justify-center text-fg-faint active:scale-90 rounded-full"
            aria-label="remove set"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={addSet}
        className="w-full min-h-[48px] border border-dashed border-line-bright rounded-xl text-fg-dim text-sm font-medium active:scale-[0.99] transition hover:border-amber hover:text-amber"
      >
        + Add set
      </button>
    </div>
  );
}

function NumField({ label, value, step, onChange }) {
  return (
    <div className="flex-1 flex items-stretch border border-line rounded-xl overflow-hidden bg-bg-elev">
      <button
        onClick={() =>
          onChange(Math.max(0, +(Number(value || 0) - step).toFixed(2)))
        }
        className="w-11 text-fg-dim active:bg-line-soft text-lg font-medium"
        aria-label={`decrease ${label}`}
      >
        −
      </button>
      <div className="flex-1 flex flex-col items-center justify-center py-1.5">
        <div className="text-base font-semibold text-fg tabular-nums leading-tight">
          {value ?? 0}
        </div>
        <div className="text-[9px] text-fg-muted uppercase tracking-wider">
          {label}
        </div>
      </div>
      <button
        onClick={() => onChange(+(Number(value || 0) + step).toFixed(2))}
        className="w-11 text-fg-dim active:bg-line-soft text-lg font-medium"
        aria-label={`increase ${label}`}
      >
        +
      </button>
    </div>
  );
}
