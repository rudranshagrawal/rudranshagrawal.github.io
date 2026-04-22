import { useState, useEffect } from "react";
import { dayOfWeek, todayISO, weekNumber, prettyDate } from "../../lib/fitness-format";
import { addWeight, getWeightLog, getMealLog } from "../../lib/storage";
import { success } from "../../lib/haptics";

export default function TodayTab({ plan, setActiveTab }) {
  const today = dayOfWeek();
  const iso = todayISO();
  const day = plan.workouts[today];
  const week = weekNumber(plan.meta?.planStart, iso);

  const [weight, setWeight] = useState("");
  const [weightSaved, setWeightSaved] = useState(false);
  const [todayWeightLog, setTodayWeightLog] = useState(() =>
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
    setTodayWeightLog({ date: iso, kg });
    setWeight("");
    setWeightSaved(true);
    success();
    setTimeout(() => setWeightSaved(false), 2000);
  };

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="mb-5">
        <div className="text-[11px] text-fg-muted uppercase tracking-wider">
          {prettyDate(iso)}
          {week != null && week > 0 && (
            <span className="ml-2 text-amber">· week {week} of {plan.meta?.planWeeks ?? 26}</span>
          )}
        </div>
        <h1 className="text-2xl text-fg mt-1">
          <span className="text-amber">$</span> today
        </h1>
      </div>

      {/* Weight card */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] text-fg-muted uppercase tracking-wider">weigh in</div>
          {todayWeightLog && (
            <div className="text-[11px] text-term-green">
              ✓ {todayWeightLog.kg} kg logged
            </div>
          )}
        </div>
        <form onSubmit={saveWeight} className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder={todayWeightLog?.kg || plan.meta?.startWeightKg || "kg"}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="flex-1 bg-bg-elev border border-line text-fg text-base font-mono p-3 outline-none focus:border-amber"
          />
          <button
            type="submit"
            disabled={!weight}
            className="btn-primary disabled:opacity-40"
          >
            {weightSaved ? "saved ✓" : "log"}
          </button>
        </form>
      </div>

      {/* Workout card */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] text-fg-muted uppercase tracking-wider">today&apos;s workout</div>
          <button
            onClick={() => setActiveTab("workout")}
            className="text-xs text-amber"
          >
            open →
          </button>
        </div>
        <h2 className="text-lg text-fg mb-1 capitalize">{today}</h2>
        <div className="text-sm text-fg-dim">{day?.title}</div>
        {!day?.rest && day?.exercises?.length > 0 && (
          <div className="mt-3 text-[11px] text-fg-muted">
            {day.exercises.length} exercises
          </div>
        )}
        {day?.rest && (
          <div className="mt-3 text-sm text-term-green">rest day — recover well</div>
        )}
      </div>

      {/* Meals card */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] text-fg-muted uppercase tracking-wider">
            meals ({todayMeals.length}/{plan.meals?.length ?? 0} logged)
          </div>
          <button
            onClick={() => setActiveTab("diet")}
            className="text-xs text-amber"
          >
            open →
          </button>
        </div>

        <div className="space-y-2">
          {plan.meals?.map((meal) => {
            const logged = todayMeals.find((m) => m.mealId === meal.id);
            return (
              <div
                key={meal.id}
                className="flex items-center justify-between gap-3 py-1.5"
              >
                <div className="min-w-0">
                  <div className="text-sm text-fg truncate">{meal.title}</div>
                  <div className="text-[10px] text-fg-muted">{meal.window}</div>
                </div>
                <div className="text-xs shrink-0">
                  {logged ? (
                    <span className="text-term-green">✓</span>
                  ) : (
                    <span className="text-fg-faint">·</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Macros footer */}
      {plan.meta?.macros && (
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <Macro label="kcal" value={plan.meta.macros.caloriesKcal} />
          <Macro label="prot" value={`${plan.meta.macros.proteinG}g`} />
          <Macro label="carb" value={`${plan.meta.macros.carbsG}g`} />
          <Macro label="fat" value={`${plan.meta.macros.fatsG}g`} />
        </div>
      )}
    </div>
  );
}

function Macro({ label, value }) {
  return (
    <div className="border border-line bg-bg-panel p-2">
      <div className="text-sm text-fg tabular-nums">{value}</div>
      <div className="text-[9px] text-fg-muted uppercase mt-0.5">{label}</div>
    </div>
  );
}
