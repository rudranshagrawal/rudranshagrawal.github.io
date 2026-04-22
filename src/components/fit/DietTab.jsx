import { useState, useCallback } from "react";
import MealRow from "./MealRow";
import { todayISO } from "../../lib/fitness-format";
import { getMealLog } from "../../lib/storage";

export default function DietTab({ plan, setActiveTab }) {
  const iso = todayISO();
  const [logs, setLogs] = useState(() => getMealLog(iso));
  const [groceryOpen, setGroceryOpen] = useState(false);

  const refresh = useCallback(() => {
    setLogs(getMealLog(iso));
  }, [iso]);

  const askAI = useCallback(
    (meal) => {
      try {
        sessionStorage.setItem(
          "fit-coach-primed",
          JSON.stringify({
            kind: "meal-context",
            mealId: meal.id,
            mealTitle: meal.title,
            window: meal.window,
            ingredients: meal.ingredients,
            macros: plan.meta?.macros,
            ts: Date.now(),
          })
        );
      } catch {}
      setActiveTab("coach");
    },
    [plan.meta?.macros, setActiveTab]
  );

  return (
    <div className="max-w-lg mx-auto px-5 py-5 space-y-4">
      {/* Macros hero */}
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

      {/* Meals */}
      <div className="space-y-3">
        {plan.meals?.map((meal) => (
          <MealRow
            key={meal.id}
            meal={meal}
            date={iso}
            todayLogs={logs}
            onLogged={refresh}
            onAskAI={askAI}
          />
        ))}
      </div>

      {/* Grocery list */}
      {plan.groceries?.length > 0 && (
        <div className="fit-card overflow-hidden">
          <button
            onClick={() => setGroceryOpen((v) => !v)}
            className="w-full min-h-[56px] flex items-center justify-between px-5 py-3 active:bg-bg-elev transition text-left"
          >
            <div>
              <div className="fit-label">Grocery list</div>
              <div className="text-sm text-fg mt-0.5">
                {plan.groceries.length} items
              </div>
            </div>
            <Chevron open={groceryOpen} />
          </button>
          {groceryOpen && (
            <div className="border-t border-line-soft p-5">
              <div className="flex flex-wrap gap-1.5">
                {plan.groceries.map((g) => (
                  <span
                    key={g}
                    className="text-xs text-fg-dim px-3 py-1.5 rounded-full bg-bg-elev"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
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
