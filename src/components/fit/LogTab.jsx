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
  { id: "weight", label: "Weight" },
  { id: "sessions", label: "Sessions" },
  { id: "meals", label: "Meals" },
  { id: "checkins", label: "Check-ins" },
];

export default function LogTab({ plan }) {
  const [view, setView] = useState("weight");

  const weights = useMemo(() => getWeightLog(), []);
  const sessions = useMemo(() => allSessions(), []);
  const meals = useMemo(() => allMeals(), []);
  const checkins = useMemo(() => getCheckinHistory(), []);

  return (
    <div className="max-w-lg mx-auto px-5 py-5 space-y-4">
      {/* Segmented control */}
      <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`fit-chip whitespace-nowrap ${
              view === v.id ? "fit-chip-active" : ""
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "weight" && (
        <div className="fit-card p-5">
          <div className="fit-label mb-3">Weight trend</div>
          <WeightChart data={weights} goalKg={null} />
        </div>
      )}

      {view === "sessions" && (
        <div className="space-y-3">
          {sessions.length === 0 && (
            <Empty text="No sessions logged yet. Log your first workout from the Workout tab." />
          )}
          {sessions.map(({ date, log }) => (
            <div key={date} className="fit-card p-5">
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-sm font-semibold text-fg">
                  {prettyDate(date)}
                </div>
                <div className="text-[11px] text-fg-muted">
                  {log?.exercises?.length ?? 0} exercises
                </div>
              </div>
              {log?.exercises?.length > 0 && (
                <div className="space-y-1.5">
                  {log.exercises.map((ex, i) => (
                    <div key={i} className="text-sm text-fg-dim">
                      <span className="font-medium text-fg">{ex.name}</span>
                      {ex.sets?.length > 0 && (
                        <span className="text-fg-muted">
                          {" · "}
                          {ex.sets.map((s) => `${s.weight}×${s.reps}`).join(", ")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {log?.sessionNotes && (
                <div className="mt-3 pt-3 border-t border-line-soft text-xs text-fg-muted italic">
                  {log.sessionNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {view === "meals" && (
        <div className="space-y-3">
          {meals.length === 0 && <Empty text="No meals logged yet." />}
          {meals.map(({ date, entries }) => (
            <div key={date} className="fit-card p-5">
              <div className="text-sm font-semibold text-fg mb-2">
                {prettyDate(date)}
              </div>
              <div className="space-y-2">
                {entries.map((m, i) => (
                  <div key={i} className="text-sm">
                    <span className="text-fg">{m.mealTitle}</span>
                    <span className="text-fg-muted"> · {m.timeEaten}</span>
                    {m.minutesToCook > 0 && (
                      <span className="text-fg-muted">
                        {" "}· {m.minutesToCook}m
                      </span>
                    )}
                    {m.notes && (
                      <div className="text-xs text-fg-muted italic pl-1 mt-0.5">
                        {m.notes}
                      </div>
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
            <Empty text="No check-ins yet. Fill one out on the Coach tab on Saturdays." />
          )}
          {checkins.map((c, i) => (
            <div key={i} className="fit-card p-5">
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-sm font-semibold text-fg">
                  Week {c.weekNumber ?? "?"}
                </div>
                {c.submittedAt && (
                  <div className="text-[11px] text-fg-muted">
                    {prettyDate(c.submittedAt.slice(0, 10))}
                  </div>
                )}
              </div>
              {c.currentWeight && (
                <div className="text-sm text-fg-dim">
                  Weight: {c.currentWeight} kg
                </div>
              )}
              {c.dietConsistency && (
                <div className="text-sm text-fg-dim mt-1">
                  Diet: {c.dietConsistency}
                </div>
              )}
              {c.mentalState && (
                <div className="text-sm text-fg-dim mt-1">
                  Mental: {c.mentalState}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="fit-card p-8 text-center">
      <div className="text-sm text-fg-muted">{text}</div>
    </div>
  );
}
