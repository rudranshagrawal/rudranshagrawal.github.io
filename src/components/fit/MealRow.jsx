import { useState } from "react";
import { appendMealLog } from "../../lib/storage";
import { success, bump } from "../../lib/haptics";

export default function MealRow({ meal, date, todayLogs, onLogged, onAskAI }) {
  const [open, setOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const logged = todayLogs.find((m) => m.mealId === meal.id);

  return (
    <div className="border border-line bg-bg-panel">
      <button
        onClick={() => {
          bump();
          setOpen((v) => !v);
        }}
        className="w-full min-h-[64px] flex items-center justify-between gap-3 px-4 py-3 text-left active:bg-bg-elev transition"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="text-fg text-base truncate">{meal.title}</div>
            {logged && (
              <span className="text-[10px] text-term-green shrink-0">✓</span>
            )}
          </div>
          <div className="text-[11px] text-fg-muted mt-0.5">{meal.window}</div>
        </div>
        <span className="text-fg-muted text-xs">{open ? "[ − ]" : "[ + ]"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-line">
          {/* Ingredients */}
          <div className="mt-3">
            <div className="text-[11px] text-fg-muted uppercase tracking-wider mb-2">
              ingredients
            </div>
            <ul className="space-y-1">
              {meal.ingredients?.map((ing, i) => (
                <li key={i} className="text-sm text-fg-dim relative pl-4">
                  <span className="absolute left-0 top-2 h-1 w-1 bg-amber" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          {meal.instructions && (
            <div className="mt-4">
              <div className="text-[11px] text-fg-muted uppercase tracking-wider mb-2">
                how to
              </div>
              <p className="text-sm text-fg-dim leading-relaxed">
                {meal.instructions}
              </p>
            </div>
          )}

          {/* Action row */}
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => setLogOpen(true)}
              className="btn-primary flex-1 justify-center"
            >
              {logged ? "log again" : "mark as eaten"}
            </button>
            {onAskAI && (
              <button
                onClick={() => onAskAI(meal)}
                className="btn px-4"
                aria-label="ask ai about this meal"
              >
                ask ai
              </button>
            )}
          </div>

          {/* Already logged today */}
          {todayLogs.filter((m) => m.mealId === meal.id).map((entry, i) => (
            <div key={i} className="mt-3 text-[11px] text-fg-muted border-t border-line pt-2">
              <span className="text-term-green">✓ logged</span> at {entry.timeEaten}
              {entry.minutesToCook > 0 && ` · took ${entry.minutesToCook} min`}
              {entry.notes && <div className="text-fg-dim mt-1">{entry.notes}</div>}
            </div>
          ))}
        </div>
      )}

      {logOpen && (
        <LogMealModal
          meal={meal}
          date={date}
          onClose={() => setLogOpen(false)}
          onDone={(entry) => {
            appendMealLog(date, entry);
            success();
            onLogged?.();
            setLogOpen(false);
          }}
        />
      )}
    </div>
  );
}

function LogMealModal({ meal, date, onClose, onDone }) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const [timeEaten, setTimeEaten] = useState(`${hh}:${mm}`);
  const [minutesToCook, setMinutesToCook] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-bg border-t border-amber sm:border sm:mx-4 max-h-[85vh] overflow-y-auto"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-line-bright" />
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base text-fg">
              <span className="text-amber">$</span> log {meal.title.toLowerCase()}
            </h3>
            <button
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center text-fg-muted active:scale-95"
              aria-label="close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <label className="text-[11px] text-fg-muted block mb-1.5">
              <span className="text-amber">&gt;</span> eaten at
            </label>
            <input
              type="time"
              value={timeEaten}
              onChange={(e) => setTimeEaten(e.target.value)}
              className="w-full bg-bg-elev border border-line text-fg text-base font-mono p-3 outline-none focus:border-amber"
            />
          </div>

          <div className="mb-4">
            <label className="text-[11px] text-fg-muted block mb-1.5">
              <span className="text-amber">&gt;</span> minutes to cook
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 25"
              value={minutesToCook}
              onChange={(e) => setMinutesToCook(e.target.value)}
              className="w-full bg-bg-elev border border-line text-fg text-base font-mono p-3 outline-none focus:border-amber"
            />
          </div>

          <div className="mb-5">
            <label className="text-[11px] text-fg-muted block mb-1.5">
              <span className="text-amber">&gt;</span> notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="swapped curd for yogurt, added spinach, tasty..."
              className="w-full bg-bg-elev border border-line text-fg text-sm font-mono p-3 outline-none focus:border-amber resize-none"
            />
          </div>

          <button
            onClick={() =>
              onDone({
                mealId: meal.id,
                mealTitle: meal.title,
                timeEaten,
                minutesToCook: minutesToCook ? parseInt(minutesToCook, 10) : 0,
                notes: notes.trim(),
                loggedAt: new Date().toISOString(),
              })
            }
            className="w-full btn-primary justify-center"
          >
            save
          </button>
        </div>
      </div>
    </div>
  );
}
