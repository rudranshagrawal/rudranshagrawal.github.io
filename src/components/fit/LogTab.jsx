import { useMemo, useState } from "react";
import WeightChart from "./WeightChart";
import {
  getWeightLog,
  allSessions,
  allMeals,
  getCheckinHistory,
} from "../../lib/storage";
import { prettyDate } from "../../lib/fitness-format";

const VIEWS = [
  { id: "weight", label: "weight" },
  { id: "sessions", label: "sessions" },
  { id: "meals", label: "meals" },
  { id: "checkins", label: "check-ins" },
];

export default function LogTab({ plan }) {
  const [view, setView] = useState("weight");

  const weights = useMemo(() => getWeightLog(), []);
  const sessions = useMemo(() => allSessions(), []);
  const meals = useMemo(() => allMeals(), []);
  const checkins = useMemo(() => getCheckinHistory(), []);

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <div className="text-[11px] text-fg-muted uppercase tracking-wider">history</div>
        <h1 className="text-xl text-fg mt-1">
          <span className="text-amber">$</span> log
        </h1>
      </div>

      {/* View chips */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`chip whitespace-nowrap ${view === v.id ? "chip-active" : ""}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "weight" && (
        <div className="card">
          <WeightChart data={weights} />
        </div>
      )}

      {view === "sessions" && (
        <div className="space-y-3">
          {sessions.length === 0 && (
            <EmptyState text="no sessions logged yet. log your first workout on the workout tab." />
          )}
          {sessions.map(({ date, log }) => (
            <div key={date} className="card">
              <div className="flex items-baseline justify-between">
                <div className="text-sm text-fg">{prettyDate(date)}</div>
                <div className="text-[10px] text-fg-muted">
                  {log?.exercises?.length ?? 0} exercises
                </div>
              </div>
              {log?.exercises?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {log.exercises.map((ex, i) => (
                    <div key={i} className="text-xs text-fg-dim">
                      <span className="text-amber">$</span> {ex.name}
                      {ex.sets?.length > 0 && (
                        <span className="text-fg-muted">
                          {" "}· {ex.sets.map((s) => `${s.weight}×${s.reps}`).join(", ")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {log?.sessionNotes && (
                <div className="mt-2 text-[11px] text-fg-muted italic border-t border-line pt-2">
                  {log.sessionNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {view === "meals" && (
        <div className="space-y-3">
          {meals.length === 0 && (
            <EmptyState text="no meals logged yet." />
          )}
          {meals.map(({ date, entries }) => (
            <div key={date} className="card">
              <div className="text-sm text-fg mb-2">{prettyDate(date)}</div>
              <div className="space-y-1.5">
                {entries.map((m, i) => (
                  <div key={i} className="text-xs text-fg-dim">
                    <span className="text-amber">·</span> {m.mealTitle} @ {m.timeEaten}
                    {m.minutesToCook > 0 && (
                      <span className="text-fg-muted"> · {m.minutesToCook} min</span>
                    )}
                    {m.notes && (
                      <div className="text-[11px] text-fg-muted pl-3 italic">{m.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "checkins" && (
        <div className="space-y-3">
          {checkins.length === 0 && (
            <EmptyState text="no weekly check-ins yet. submit one from the coach tab on saturdays." />
          )}
          {checkins.map((c, i) => (
            <div key={i} className="card">
              <div className="flex items-baseline justify-between">
                <div className="text-sm text-fg">week {c.weekNumber ?? "?"}</div>
                <div className="text-[10px] text-fg-muted">
                  {c.submittedAt ? prettyDate(c.submittedAt.slice(0, 10)) : ""}
                </div>
              </div>
              {c.currentWeight && (
                <div className="text-xs text-fg-dim mt-1">weight: {c.currentWeight} kg</div>
              )}
              {c.dietConsistency && (
                <div className="text-xs text-fg-dim mt-1">diet: {c.dietConsistency}</div>
              )}
              {c.mentalState && (
                <div className="text-xs text-fg-dim mt-1">mental: {c.mentalState}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-10 text-fg-muted text-sm border border-dashed border-line">
      {text}
    </div>
  );
}
