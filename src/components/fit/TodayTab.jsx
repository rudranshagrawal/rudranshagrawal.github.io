import { useState, useEffect } from "react";
import {
  dayOfWeek,
  todayISO,
  weekNumber,
  prettyDate,
} from "../../lib/fitness-format";
import { addWeight, getWeightLog, getMealLog } from "../../lib/storage";
import { success } from "../../lib/haptics";

export default function TodayTab({ plan, setActiveTab }) {
  const today = dayOfWeek();
  const iso = todayISO();
  const day = plan.workouts[today];
  const week = weekNumber(plan.meta?.planStart, iso);

  const [weight, setWeight] = useState("");
  const [weightSaved, setWeightSaved] = useState(false);
  const [todayWeight, setTodayWeight] = useState(() =>
    getWeightLog().find((w) => w.date === iso)
  );
  const [todayMeals, setTodayMeals] = useState(() => getMealLog(iso));

  useEffect(() => {
    setTodayMeals(getMealLog(iso));
  }, [iso]);

  const saveWeight = (e) => {
    e.preventDefault();
    const kg = parseFloat(weight);
    if (!kg || kg < 30 || kg > 300) return;
    addWeight(iso, kg);
    setTodayWeight({ date: iso, kg });
    setWeight("");
    setWeightSaved(true);
    success();
    setTimeout(() => setWeightSaved(false), 2000);
  };

  const mealsDone = todayMeals.length;
  const mealsTotal = plan.meals?.length ?? 0;

  return (
    <div className="max-w-lg mx-auto px-5 py-5 space-y-4">
      {/* Date header */}
      <div>
        <div className="fit-label">{prettyDate(iso)}</div>
        {week != null && week > 0 && (
          <div className="mt-1 text-sm text-fg-dim">
            Week <span className="text-amber font-semibold">{week}</span> of{" "}
            {plan.meta?.planWeeks ?? 26}
          </div>
        )}
      </div>

      {/* Weight card */}
      <div className="fit-card p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="fit-label">Weigh in</div>
            <div className="fit-stat-num mt-1">
              {todayWeight ? `${todayWeight.kg} kg` : "—"}
            </div>
          </div>
          {todayWeight && (
            <span className="text-xs text-term-green flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5L20 7" />
              </svg>
              logged
            </span>
          )}
        </div>
        <form onSubmit={saveWeight} className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder={
              todayWeight?.kg
                ? `Update (${todayWeight.kg})`
                : plan.meta?.startWeightKg
                  ? `${plan.meta.startWeightKg} kg`
                  : "kg"
            }
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="fit-input flex-1"
          />
          <button
            type="submit"
            disabled={!weight}
            className="fit-btn-primary disabled:opacity-40"
          >
            {weightSaved ? "Saved" : "Log"}
          </button>
        </form>
      </div>

      {/* Today's workout card */}
      <button
        onClick={() => setActiveTab("workout")}
        className="fit-card p-5 text-left w-full active:scale-[0.99] transition"
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="fit-label">Today&apos;s workout</div>
            <div className="mt-1 text-lg font-semibold text-fg capitalize">
              {today}
            </div>
            <div className="text-sm text-fg-dim mt-0.5 truncate">
              {day?.title}
            </div>
            {day?.rest ? (
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                Rest day
              </div>
            ) : (
              <div className="mt-2 text-xs text-fg-muted">
                {day?.exercises?.length ?? 0} exercises
              </div>
            )}
          </div>
          <ChevronRight />
        </div>
      </button>

      {/* Meals card */}
      <button
        onClick={() => setActiveTab("diet")}
        className="fit-card p-5 text-left w-full active:scale-[0.99] transition"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="fit-label">Meals</div>
            <div className="mt-1 text-lg font-semibold text-fg">
              <span className="text-amber">{mealsDone}</span>
              <span className="text-fg-muted"> / {mealsTotal}</span>
            </div>
          </div>
          <ChevronRight />
        </div>

        <div className="space-y-0">
          {plan.meals?.map((meal, i) => {
            const logged = todayMeals.some((m) => m.mealId === meal.id);
            const isLast = i === plan.meals.length - 1;
            return (
              <div
                key={meal.id}
                className={`flex items-center gap-3 py-2.5 ${!isLast ? "border-b border-line-soft" : ""}`}
              >
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                    logged
                      ? "bg-amber text-white"
                      : "border border-line"
                  }`}
                >
                  {logged && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-fg truncate">{meal.title.split(" — ")[0]}</div>
                  <div className="text-[11px] text-fg-muted">{meal.window}</div>
                </div>
              </div>
            );
          })}
        </div>
      </button>

      {/* Macros summary */}
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
      <div className="text-base font-semibold tabular-nums text-fg">{value}</div>
      <div className="text-[10px] text-fg-muted uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
}
