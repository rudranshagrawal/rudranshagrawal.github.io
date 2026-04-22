import { useState, useEffect, useMemo } from "react";
import {
  dayOfWeek,
  todayISO,
  weekNumber,
  prettyDate,
  greeting,
  activityStreak,
  currentWeekDays,
  statusForDate,
  dayKeyForISO,
} from "../../lib/fitness-format";
import {
  addWeight,
  getWeightLog,
  getMealLog,
  getMealStatus,
  quickMarkMeal,
  clearMealEntry,
  getSessionLog,
  exerciseStatus,
} from "../../lib/storage";
import { success, tap } from "../../lib/haptics";

const STATE_STYLES = {
  done: { dot: "bg-[rgb(var(--fit-done))]", ring: "ring-[rgb(var(--fit-done))]", label: "Done", pill: "fit-status-done-soft" },
  partial: { dot: "bg-[rgb(var(--fit-done))]", ring: "ring-amber", label: "In progress", pill: "fit-status-done-soft" },
  skipped: { dot: "bg-[rgb(var(--fit-skipped))]", ring: "ring-[rgb(var(--fit-skipped))]", label: "Skipped", pill: "fit-status-skipped" },
  missed: { dot: "bg-[rgb(var(--fit-missed))]", ring: "ring-[rgb(var(--fit-missed))]", label: "Missed", pill: "fit-status-missed" },
  rest: { dot: "bg-[rgb(var(--fit-rest))]", ring: "ring-[rgb(var(--fit-rest))]", label: "Rest", pill: "fit-status-rest" },
  pending: { dot: "border border-line-bright bg-transparent", ring: "ring-line", label: "Pending", pill: "" },
  future: { dot: "bg-transparent border border-line-soft", ring: "", label: "", pill: "" },
};

export default function TodayTab({ plan, setActiveTab }) {
  const today = dayOfWeek();
  const iso = todayISO();
  const day = plan.workouts[today];
  const week = weekNumber(plan.meta?.planStart, iso);
  const planWeeks = plan.meta?.planWeeks ?? 26;

  const [weight, setWeight] = useState("");
  const [savedBlink, setSavedBlink] = useState(false);
  const [todayWeight, setTodayWeight] = useState(() =>
    getWeightLog().find((w) => w.date === iso)
  );
  const [todayMeals, setTodayMeals] = useState(() => getMealLog(iso));
  const [mealsTick, setMealsTick] = useState(0);

  useEffect(() => {
    setTodayMeals(getMealLog(iso));
  }, [iso, mealsTick]);

  const streak = useMemo(() => activityStreak(), [mealsTick, todayWeight]);
  const weightLog = useMemo(() => getWeightLog(), [todayWeight]);

  const startWeight = plan.meta?.startWeightKg;
  const latestWeight = todayWeight?.kg ?? weightLog[weightLog.length - 1]?.kg;
  const deltaKg =
    latestWeight != null && startWeight != null
      ? +(latestWeight - startWeight).toFixed(1)
      : null;

  const saveWeight = (e) => {
    e.preventDefault();
    const kg = parseFloat(weight);
    if (!kg || kg < 30 || kg > 300) return;
    addWeight(iso, kg);
    setTodayWeight({ date: iso, kg });
    setWeight("");
    setSavedBlink(true);
    success();
    setTimeout(() => setSavedBlink(false), 1600);
  };

  const weekInfo = currentWeekDays();
  const dayStatuses = weekInfo.days.map((d) => ({
    iso: d,
    status: statusForDate({ plan, iso: d, today: iso }),
    dayKey: dayKeyForISO(d),
    isToday: d === iso,
  }));

  // Session progress for today's workout card
  const sessionLog = getSessionLog(iso);
  const exercises = day?.exercises ?? [];
  let doneCount = 0;
  let skippedCount = 0;
  for (const ex of exercises) {
    const st = exerciseStatus(sessionLog, ex.name);
    if (st === "done") doneCount++;
    else if (st === "skipped") skippedCount++;
  }
  const todayWorkoutStatus = statusForDate({ plan, iso, today: iso });

  // Meals today status
  const mealsEaten = todayMeals.filter((m) => m.status === "eaten").length;
  const mealsSkipped = todayMeals.filter((m) => m.status === "skipped").length;
  const mealsTotal = plan.meals?.length ?? 0;
  const mealsAddressed = mealsEaten + mealsSkipped;

  const toggleMeal = (meal, target) => {
    const current = getMealStatus(iso, meal.id);
    if (current === target) {
      // un-mark
      clearMealEntry(iso, meal.id);
    } else {
      quickMarkMeal(iso, meal.id, meal.title, target);
      tap();
      if (target === "eaten") success();
    }
    setMealsTick((x) => x + 1);
  };

  return (
    <div className="max-w-lg mx-auto px-5 pt-4 pb-5 space-y-4">
      {/* Greeting + streak */}
      <div>
        <div className="text-fg-muted text-sm">
          {greeting()}, <span className="text-fg font-medium">Rudransh</span>.
        </div>
        <div className="flex items-baseline gap-3 mt-1">
          <h1 className="text-[28px] leading-none font-semibold tracking-tight text-fg">
            {prettyDate(iso)}
          </h1>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm flex-wrap">
          {week != null && week > 0 && (
            <span className="inline-flex items-center gap-1.5 text-amber font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
              </svg>
              Week {week}
              <span className="text-fg-muted font-normal">of {planWeeks}</span>
            </span>
          )}
          {streak > 0 && (
            <>
              <span className="text-line-bright">·</span>
              <span className="inline-flex items-center gap-1.5 text-fg-dim">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[rgb(var(--fit-skipped))]">
                  <path d="M12 2c.5 3 2 5 4 7s3 4 3 7a7 7 0 0 1-14 0c0-2 1-4 3-5 0 2 1 3 2 3 0-3 1-7 2-12z" />
                </svg>
                <span className="font-semibold text-fg">{streak}</span>
                day streak
              </span>
            </>
          )}
        </div>
      </div>

      {/* Week strip */}
      <div className="fit-card px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="fit-label">This week</div>
          <div className="text-xs text-fg-muted">{weekInfo.mondayISO.slice(5)} →</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {dayStatuses.map(({ iso: d, status, dayKey, isToday }) => {
            const short = dayKey.slice(0, 1).toUpperCase();
            const s = STATE_STYLES[status] || STATE_STYLES.pending;
            const num = new Date(d + "T12:00:00").getDate();
            return (
              <div
                key={d}
                className={`flex flex-col items-center gap-1.5 rounded-xl py-2 ${
                  isToday ? "bg-bg-elev" : ""
                }`}
              >
                <span
                  className={`text-[10px] font-medium ${
                    isToday ? "text-amber" : "text-fg-muted"
                  }`}
                >
                  {short}
                </span>
                <span
                  className={`text-sm tabular-nums ${
                    isToday ? "text-fg font-semibold" : "text-fg-dim"
                  }`}
                >
                  {num}
                </span>
                <div
                  className={`h-2 w-2 rounded-full ${s.dot} ${
                    isToday && status !== "future"
                      ? "ring-2 ring-offset-1 ring-offset-bg " + s.ring
                      : ""
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-line-soft flex items-center gap-3 flex-wrap text-[10px] text-fg-muted">
          <LegendDot color="bg-[rgb(var(--fit-done))]" label="Done" />
          <LegendDot color="bg-[rgb(var(--fit-skipped))]" label="Skipped" />
          <LegendDot color="bg-[rgb(var(--fit-missed))]" label="Missed" />
          <LegendDot color="bg-[rgb(var(--fit-rest))]" label="Rest" />
        </div>
      </div>

      {/* Weight hero */}
      <div className="fit-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="fit-label">Weight</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[40px] leading-none font-semibold tracking-tight tabular-nums text-fg">
                {latestWeight ? latestWeight : "—"}
              </span>
              <span className="text-lg font-medium text-fg-muted">kg</span>
            </div>
            {deltaKg != null && (
              <div
                className={`mt-1 text-sm font-medium ${
                  deltaKg < 0
                    ? "text-[rgb(var(--fit-done))]"
                    : deltaKg > 0
                      ? "text-[rgb(var(--fit-missed))]"
                      : "text-fg-muted"
                }`}
              >
                {deltaKg >= 0 ? "↑" : "↓"} {Math.abs(deltaKg)} kg since start
              </div>
            )}
          </div>
          {weightLog.length > 1 && <MiniSparkline data={weightLog.slice(-14)} />}
        </div>

        <form onSubmit={saveWeight} className="mt-4 flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder={
              todayWeight?.kg
                ? `Already logged ${todayWeight.kg} today`
                : `Log today's weight (kg)`
            }
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="fit-input flex-1"
          />
          <button
            type="submit"
            disabled={!weight}
            className="fit-btn-primary disabled:opacity-40 min-w-[88px]"
          >
            {savedBlink ? "Saved" : todayWeight ? "Update" : "Log"}
          </button>
        </form>
      </div>

      {/* Today's workout */}
      <button
        onClick={() => setActiveTab("workout")}
        className="fit-card p-5 w-full text-left active:scale-[0.99] transition"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="fit-label">Today&apos;s workout</div>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <span className="text-xl font-semibold text-fg capitalize">
                {today}
              </span>
              <StatusPill status={todayWorkoutStatus} />
            </div>
            <div className="text-sm text-fg-dim mt-1.5">{day?.title}</div>

            {day?.rest ? (
              <div className="mt-3 text-sm text-fg-dim">
                Recovery is the work. Take it easy today.
              </div>
            ) : (
              <div className="mt-3">
                <ProgressBar
                  done={doneCount}
                  skipped={skippedCount}
                  total={exercises.length}
                />
                <div className="mt-1.5 text-xs text-fg-muted">
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
                  {exercises.length - doneCount - skippedCount} pending
                </div>
              </div>
            )}
          </div>
          <ChevronRight />
        </div>
      </button>

      {/* Meals — inline with quick actions */}
      <div className="fit-card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="fit-label">Meals</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-semibold tabular-nums text-fg">
                {mealsAddressed}
              </span>
              <span className="text-fg-muted">/ {mealsTotal}</span>
              {mealsSkipped > 0 && (
                <span className="text-xs text-[rgb(var(--fit-skipped))] font-medium ml-1">
                  ({mealsSkipped} skipped)
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setActiveTab("diet")}
            className="text-xs font-semibold text-amber active:scale-95"
          >
            Details →
          </button>
        </div>

        <div className="space-y-0">
          {plan.meals?.map((meal, i) => {
            const status = getMealStatus(iso, meal.id);
            const isLast = i === plan.meals.length - 1;
            return (
              <div
                key={meal.id}
                className={`flex items-center gap-3 py-3 ${!isLast ? "border-b border-line-soft" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-fg truncate">
                    {meal.title.split(" — ")[0]}
                  </div>
                  <div className="text-[11px] text-fg-muted">{meal.window}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <QuickBtn
                    active={status === "eaten"}
                    onClick={() => toggleMeal(meal, "eaten")}
                    variant="done"
                    label="Mark as eaten"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  </QuickBtn>
                  <QuickBtn
                    active={status === "skipped"}
                    onClick={() => toggleMeal(meal, "skipped")}
                    variant="skipped"
                    label="Skip meal"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </QuickBtn>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Macros */}
      {plan.meta?.macros && (
        <div className="fit-card p-5">
          <div className="fit-label mb-3">Daily targets</div>
          <div className="grid grid-cols-4 gap-3">
            <Macro label="kcal" value={plan.meta.macros.caloriesKcal} />
            <Macro label="protein" value={`${plan.meta.macros.proteinG}g`} />
            <Macro label="carbs" value={`${plan.meta.macros.carbsG}g`} />
            <Macro label="fat" value={`${plan.meta.macros.fatsG}g`} />
          </div>
        </div>
      )}
    </div>
  );
}

function MiniSparkline({ data }) {
  if (!data || data.length < 2) return null;
  const W = 80;
  const H = 36;
  const kgs = data.map((d) => d.kg);
  const min = Math.min(...kgs);
  const max = Math.max(...kgs);
  const range = max - min || 1;
  const step = W / (data.length - 1);
  const path = data
    .map((d, i) => {
      const x = i * step;
      const y = H - 2 - ((d.kg - min) / range) * (H - 4);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = data[data.length - 1];
  const lastY = H - 2 - ((last.kg - min) / range) * (H - 4);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-[80px] h-[36px] shrink-0">
      <path
        d={path}
        fill="none"
        stroke="rgb(var(--color-amber))"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={W} cy={lastY} r="2.5" fill="rgb(var(--color-amber))" />
    </svg>
  );
}

function ProgressBar({ done, skipped, total }) {
  if (!total) return null;
  const dp = Math.round((done / total) * 100);
  const sp = Math.round((skipped / total) * 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-bg-elev overflow-hidden flex">
      <div
        className="h-full bg-[rgb(var(--fit-done))]"
        style={{ width: `${dp}%` }}
      />
      <div
        className="h-full bg-[rgb(var(--fit-skipped))]"
        style={{ width: `${sp}%` }}
      />
    </div>
  );
}

function StatusPill({ status }) {
  const s = STATE_STYLES[status];
  if (!s || !s.pill || !s.label) return null;
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.pill}`}
    >
      {s.label}
    </span>
  );
}

function QuickBtn({ active, onClick, variant, label, children }) {
  const base =
    "h-10 w-10 rounded-full flex items-center justify-center transition active:scale-90 shrink-0";
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

function LegendDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      <span>{label}</span>
    </span>
  );
}

function ChevronRight() {
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
      className="text-fg-muted shrink-0 mt-1"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function Macro({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-lg font-semibold tabular-nums text-fg">{value}</div>
      <div className="text-[10px] text-fg-muted uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
}
