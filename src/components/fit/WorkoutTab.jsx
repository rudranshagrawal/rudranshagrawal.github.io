import { useCallback, useEffect, useState } from "react";
import ExerciseRow from "./ExerciseRow";
import ExerciseFocus from "./ExerciseFocus";
import { dayOfWeek, todayISO, prettyDate, dayKeyForISO } from "../../lib/fitness-format";
import {
  getSessionLog,
  saveSessionLog,
  exerciseStatus,
  skipWorkoutDay,
  unSkipWorkoutDay,
  dayStatus,
} from "../../lib/storage";

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const STATUS_COPY = {
  done: { label: "Done", className: "fit-status-done-soft" },
  partial: { label: "In progress", className: "fit-status-done-soft" },
  skipped: { label: "Skipped", className: "fit-status-skipped" },
  pending: { label: "", className: "" },
  rest: { label: "Rest", className: "fit-status-rest" },
};

export default function WorkoutTab({ plan }) {
  const today = dayOfWeek();
  const iso = todayISO();
  const [expanded, setExpanded] = useState(today);
  const [viewDate] = useState(iso);
  const [log, setLog] = useState(
    () => getSessionLog(iso) || { exercises: [], sessionNotes: "" }
  );
  const [tick, setTick] = useState(0);
  const [focusState, setFocusState] = useState(null);

  useEffect(() => {
    setLog(getSessionLog(viewDate) || { exercises: [], sessionNotes: "" });
  }, [viewDate, tick]);

  const persist = useCallback(
    (next) => {
      setLog(next);
      saveSessionLog(viewDate, next);
    },
    [viewDate]
  );

  const findEx = (name) => log.exercises?.find((e) => e.name === name);
  const getSetsFor = (name) => findEx(name)?.sets || [];
  const getNotesFor = (name) => findEx(name)?.notes || "";

  const setSetsFor = (name, sets) => {
    const exercises = log.exercises ?? [];
    const idx = exercises.findIndex((e) => e.name === name);
    const next = [...exercises];
    if (idx >= 0) next[idx] = { ...next[idx], sets };
    else next.push({ name, sets, notes: "" });
    persist({ ...log, exercises: next });
  };

  const setNotesFor = (name, notes) => {
    const exercises = log.exercises ?? [];
    const idx = exercises.findIndex((e) => e.name === name);
    const next = [...exercises];
    if (idx >= 0) next[idx] = { ...next[idx], notes };
    else next.push({ name, sets: [], notes });
    persist({ ...log, exercises: next });
  };

  const refresh = () => setTick((n) => n + 1);

  const toggleSkipDay = (e) => {
    e.stopPropagation();
    const status = dayStatus({
      workouts: plan.workouts,
      dayKey: dayKeyForISO(iso),
      date: iso,
    });
    if (status === "skipped") {
      unSkipWorkoutDay(iso);
    } else {
      skipWorkoutDay(iso);
    }
    refresh();
  };

  return (
    <div className="max-w-lg mx-auto px-5 pt-4 pb-5 space-y-3">
      <div>
        <div className="fit-label">Workout plan</div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg mt-1">
          6-day split
        </h1>
        <p className="text-sm text-fg-muted mt-1">
          Tap any day to expand. Use ✓ or ✗ on each exercise for quick logging.
        </p>
      </div>

      {DAY_ORDER.map((dayKey) => {
        const day = plan.workouts[dayKey];
        if (!day) return null;
        const isToday = dayKey === today;
        const isOpen = expanded === dayKey;
        const status = isToday
          ? dayStatus({
              workouts: plan.workouts,
              dayKey,
              date: iso,
            })
          : day.rest
            ? "rest"
            : "pending";
        const copy = STATUS_COPY[status] || STATUS_COPY.pending;

        let doneCount = 0;
        let skippedCount = 0;
        if (isToday && !day.rest) {
          for (const ex of day.exercises || []) {
            const st = exerciseStatus(log, ex.name);
            if (st === "done") doneCount++;
            else if (st === "skipped") skippedCount++;
          }
        }

        return (
          <div
            key={dayKey}
            className={`fit-card overflow-hidden transition ${
              isOpen ? "ring-1 ring-amber" : ""
            }`}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : dayKey)}
              className="w-full min-h-[64px] flex items-center justify-between gap-3 px-5 py-4 text-left active:bg-bg-elev transition"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-semibold text-fg capitalize">
                    {dayKey}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-semibold tracking-wider text-amber uppercase">
                      Today
                    </span>
                  )}
                  {copy.label && (
                    <span
                      className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${copy.className}`}
                    >
                      {copy.label}
                    </span>
                  )}
                </div>
                <div className="text-xs text-fg-muted mt-0.5 truncate">
                  {day.title}
                </div>
                {isToday && !day.rest && (day.exercises?.length ?? 0) > 0 && (
                  <div className="mt-2 text-[11px] text-fg-muted">
                    {doneCount} done
                    {skippedCount > 0 && (
                      <>
                        {" · "}
                        <span className="text-[rgb(var(--fit-skipped))]">
                          {skippedCount} skipped
                        </span>
                      </>
                    )}
                    {" · "}
                    {(day.exercises?.length ?? 0) - doneCount - skippedCount}{" "}
                    pending
                  </div>
                )}
              </div>
              <Chevron open={isOpen} />
            </button>

            {isOpen && (
              <div className="border-t border-line-soft px-4 pb-4 pt-2 space-y-2">
                {day.rest ? (
                  <div className="text-center text-fg-dim text-sm py-8">
                    Rest day · recover well
                  </div>
                ) : (
                  <>
                    {day.cardio && (
                      <div className="text-sm text-fg-dim bg-bg-elev rounded-xl p-3.5 mb-2">
                        <span className="fit-label mr-2">Cardio</span>
                        {day.cardio}
                      </div>
                    )}
                    {day.exercises.map((ex, i) => (
                      <ExerciseRow
                        key={ex.name}
                        exercise={ex}
                        todayISO={viewDate}
                        sets={getSetsFor(ex.name)}
                        onSetsChange={(sets) => setSetsFor(ex.name, sets)}
                        notes={getNotesFor(ex.name)}
                        onNotesChange={(notes) => setNotesFor(ex.name, notes)}
                        onStatusChange={refresh}
                        onOpenFocus={() =>
                          setFocusState({ dayKey, startIndex: i })
                        }
                      />
                    ))}

                    <div className="pt-3">
                      <label className="fit-label block mb-2">
                        Session notes
                      </label>
                      <textarea
                        value={log.sessionNotes || ""}
                        onChange={(e) =>
                          persist({ ...log, sessionNotes: e.target.value })
                        }
                        rows={2}
                        placeholder="How the session went overall…"
                        className="fit-input resize-none"
                      />
                    </div>

                    {isToday && (
                      <div className="pt-2">
                        <button
                          onClick={toggleSkipDay}
                          className={`w-full min-h-[44px] rounded-full text-sm font-medium transition active:scale-[0.98] ${
                            status === "skipped"
                              ? "bg-[rgb(var(--fit-skipped))] text-white"
                              : "border border-line text-fg-muted hover:text-[rgb(var(--fit-skipped))]"
                          }`}
                        >
                          {status === "skipped"
                            ? "Un-skip this day"
                            : "Skip today's workout"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {focusState && (
        <ExerciseFocus
          exercises={plan.workouts[focusState.dayKey].exercises}
          startIndex={focusState.startIndex}
          todayISO={viewDate}
          getSetsFor={getSetsFor}
          setSetsFor={setSetsFor}
          getNotesFor={getNotesFor}
          setNotesFor={setNotesFor}
          onClose={() => {
            setFocusState(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function Chevron({ open }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-fg-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
