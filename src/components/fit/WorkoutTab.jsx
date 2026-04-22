import { useCallback, useEffect, useState } from "react";
import ExerciseRow from "./ExerciseRow";
import ExerciseFocus from "./ExerciseFocus";
import { dayOfWeek, todayISO } from "../../lib/fitness-format";
import { getSessionLog, saveSessionLog } from "../../lib/storage";

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function WorkoutTab({ plan }) {
  const today = dayOfWeek();
  const iso = todayISO();
  const [expanded, setExpanded] = useState(today);
  const [viewDate] = useState(iso);
  const [log, setLog] = useState(
    () => getSessionLog(iso) || { exercises: [], sessionNotes: "" }
  );
  const [focusState, setFocusState] = useState(null);

  useEffect(() => {
    const existing =
      getSessionLog(viewDate) || { exercises: [], sessionNotes: "" };
    setLog(existing);
  }, [viewDate]);

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

  return (
    <div className="max-w-lg mx-auto px-5 py-5 space-y-3">
      {DAY_ORDER.map((dayKey) => {
        const day = plan.workouts[dayKey];
        if (!day) return null;
        const isToday = dayKey === today;
        const isOpen = expanded === dayKey;
        return (
          <div
            key={dayKey}
            className={`fit-card overflow-hidden transition ${
              isOpen ? "ring-1 ring-amber" : ""
            }`}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : dayKey)}
              className="w-full min-h-[60px] flex items-center justify-between gap-3 px-5 py-4 text-left active:bg-bg-elev transition"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-fg capitalize">
                    {dayKey}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-semibold tracking-wider text-amber uppercase">
                      Today
                    </span>
                  )}
                </div>
                <div className="text-xs text-fg-muted mt-0.5 truncate">
                  {day.title}
                </div>
              </div>
              <Chevron open={isOpen} />
            </button>

            {isOpen && (
              <div className="border-t border-line-soft px-4 pb-4 pt-2 space-y-2">
                {day.rest ? (
                  <div className="text-center text-fg-muted text-sm py-8">
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
          onClose={() => setFocusState(null)}
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
