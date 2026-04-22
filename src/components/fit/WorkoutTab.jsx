import { useCallback, useEffect, useState } from "react";
import ExerciseRow from "./ExerciseRow";
import ExerciseFocus from "./ExerciseFocus";
import { dayOfWeek, todayISO } from "../../lib/fitness-format";
import { getSessionLog, saveSessionLog } from "../../lib/storage";

const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function WorkoutTab({ plan }) {
  const today = dayOfWeek();
  const todayIso = todayISO();
  const [expanded, setExpanded] = useState(today);
  const [viewDate, setViewDate] = useState(todayIso); // which date's logs we're viewing/editing
  const [log, setLog] = useState(() => getSessionLog(todayIso) || { exercises: [], sessionNotes: "" });
  const [focusState, setFocusState] = useState(null); // { dayKey, startIndex } | null

  useEffect(() => {
    const existing = getSessionLog(viewDate) || { exercises: [], sessionNotes: "" };
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
    let next;
    if (idx >= 0) {
      next = [...exercises];
      next[idx] = { ...next[idx], sets };
    } else {
      next = [...exercises, { name, sets, notes: "" }];
    }
    persist({ ...log, exercises: next });
  };

  const setNotesFor = (name, notes) => {
    const exercises = log.exercises ?? [];
    const idx = exercises.findIndex((e) => e.name === name);
    let next;
    if (idx >= 0) {
      next = [...exercises];
      next[idx] = { ...next[idx], notes };
    } else {
      next = [...exercises, { name, sets: [], notes }];
    }
    persist({ ...log, exercises: next });
  };

  const focusExercises =
    focusState && plan.workouts[focusState.dayKey]?.exercises?.filter((e) => e.youtubeId !== undefined);

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <div className="text-[11px] text-fg-muted uppercase tracking-wider">workout plan</div>
        <h1 className="text-xl text-fg mt-1">
          <span className="text-amber">$</span> 6-day split
        </h1>
      </div>

      <div className="space-y-3">
        {DAY_ORDER.map((dayKey) => {
          const day = plan.workouts[dayKey];
          if (!day) return null;
          const isToday = dayKey === today;
          const isOpen = expanded === dayKey;
          return (
            <div
              key={dayKey}
              className={`border ${isOpen ? "border-amber" : "border-line"} bg-bg-panel`}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : dayKey)}
                className="w-full min-h-[56px] flex items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-fg capitalize">{dayKey}</span>
                    {isToday && (
                      <span className="text-[10px] text-term-green border border-term-green/40 px-1.5 py-0.5">
                        today
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-fg-muted mt-0.5 truncate">{day.title}</div>
                </div>
                <span className="text-fg-muted text-xs">{isOpen ? "[ − ]" : "[ + ]"}</span>
              </button>

              {isOpen && (
                <div className="px-3 pb-4 border-t border-line pt-3 space-y-2">
                  {day.rest ? (
                    <div className="text-center text-fg-dim text-sm py-6">
                      rest day · recovery
                    </div>
                  ) : (
                    <>
                      {day.cardio && (
                        <div className="text-xs text-fg-dim bg-bg-elev border border-line p-3 mb-2">
                          <span className="text-amber">$</span> cardio: {day.cardio}
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
                    </>
                  )}

                  {!day.rest && (
                    <div className="pt-2">
                      <label className="text-[11px] text-fg-muted block mb-1.5">
                        <span className="text-amber">&gt;</span> session notes
                      </label>
                      <textarea
                        value={log.sessionNotes || ""}
                        onChange={(e) =>
                          persist({ ...log, sessionNotes: e.target.value })
                        }
                        rows={2}
                        placeholder="overall how the session went..."
                        className="w-full bg-bg-elev border border-line text-fg text-sm font-mono p-2.5 outline-none focus:border-amber transition resize-none"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {focusState && focusExercises && (
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
