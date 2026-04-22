import { useState, useCallback } from "react";
import MealRow from "./MealRow";
import { todayISO } from "../../lib/fitness-format";
import { getMealLog } from "../../lib/storage";

export default function DietTab({ plan, setActiveTab }) {
  const iso = todayISO();
  const [logs, setLogs] = useState(() => getMealLog(iso));

  const refresh = useCallback(() => {
    setLogs(getMealLog(iso));
  }, [iso]);

  const askAI = useCallback(
    (meal) => {
      try {
        const primed = {
          kind: "meal-context",
          mealId: meal.id,
          mealTitle: meal.title,
          window: meal.window,
          ingredients: meal.ingredients,
          macros: plan.meta?.macros,
          ts: Date.now(),
        };
        sessionStorage.setItem("fit-coach-primed", JSON.stringify(primed));
      } catch {}
      setActiveTab("coach");
    },
    [plan.meta?.macros, setActiveTab]
  );

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <div className="text-[11px] text-fg-muted uppercase tracking-wider">
          diet plan
        </div>
        <h1 className="text-xl text-fg mt-1">
          <span className="text-amber">$</span> meals + macros
        </h1>
      </div>

      {/* Macros summary */}
      {plan.meta?.macros && (
        <div className="grid grid-cols-4 gap-2 text-center mb-5">
          <Macro label="kcal" value={plan.meta.macros.caloriesKcal} />
          <Macro label="prot" value={`${plan.meta.macros.proteinG}g`} />
          <Macro label="carb" value={`${plan.meta.macros.carbsG}g`} />
          <Macro label="fat" value={`${plan.meta.macros.fatsG}g`} />
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
        <div className="mt-8 card">
          <div className="text-[11px] text-fg-muted uppercase tracking-wider mb-3">
            grocery list
          </div>
          <div className="flex flex-wrap gap-1.5">
            {plan.groceries.map((g) => (
              <span
                key={g}
                className="text-[11px] text-fg-dim px-2 py-1 border border-line bg-bg-elev"
              >
                {g}
              </span>
            ))}
          </div>
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
