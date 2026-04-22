import { useState } from "react";
import {
  appendMealLog,
  getMealStatus,
  clearMealEntry,
  quickMarkMeal,
} from "../../lib/storage";
import { success, tap } from "../../lib/haptics";

export default function MealRow({ meal, date, todayLogs, onLogged, onAskAI }) {
  const [open, setOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  const status = getMealStatus(date, meal.id);
  const latest = todayLogs
    .filter((m) => m.mealId === meal.id)
    .slice(-1)[0];

  const quickToggle = (target) => {
    if (status === target) {
      clearMealEntry(date, meal.id);
    } else {
      quickMarkMeal(date, meal.id, meal.title, target);
      tap();
      if (target === "eaten") success();
    }
    onLogged?.();
  };

  return (
    <div className="fit-card overflow-hidden">
      <div className="flex items-stretch">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-1 min-h-[64px] flex items-center gap-3 px-5 py-3.5 text-left active:bg-bg-elev transition"
        >
          <StatusDot status={status} />
          <div className="min-w-0 flex-1">
            <div className="text-base font-medium text-fg truncate">
              {meal.title.split(" — ")[0]}
            </div>
            <div className="text-xs text-fg-muted mt-0.5">
              {meal.window}
              {latest?.timeEaten && status === "eaten" && (
                <span className="text-[rgb(var(--fit-done))]">
                  {" "}· ate @ {latest.timeEaten}
                  {latest.minutesToCook > 0 && ` · ${latest.minutesToCook}m`}
                </span>
              )}
              {status === "skipped" && (
                <span className="text-[rgb(var(--fit-skipped))]">
                  {" "}· skipped
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Quick actions — always visible */}
        <div className="flex items-center gap-1.5 pr-3">
          <QuickAction
            active={status === "eaten"}
            onClick={() => quickToggle("eaten")}
            variant="done"
            label="Mark as eaten"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5L20 7" />
            </svg>
          </QuickAction>
          <QuickAction
            active={status === "skipped"}
            onClick={() => quickToggle("skipped")}
            variant="skipped"
            label="Skip meal"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </QuickAction>
        </div>
      </div>

      {open && (
        <div className="border-t border-line-soft px-5 pb-5 pt-4 space-y-4">
          {/* Ingredients */}
          <div>
            <div className="fit-label mb-2">Ingredients</div>
            <ul className="space-y-1">
              {meal.ingredients?.map((ing, i) => (
                <li key={i} className="text-sm text-fg-dim relative pl-4">
                  <span className="absolute left-0 top-2 h-1 w-1 rounded-full bg-amber" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          {meal.instructions && (
            <div>
              <div className="fit-label mb-2">How to</div>
              <p className="text-sm text-fg-dim leading-relaxed">
                {meal.instructions}
              </p>
            </div>
          )}

          {/* Full log + AI */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setLogOpen(true)}
              className="fit-btn flex-1"
            >
              {status === "eaten" ? "Add details" : "Log with details"}
            </button>
            {onAskAI && (
              <button
                onClick={() => onAskAI(meal)}
                className="fit-btn"
                aria-label="ask ai about this meal"
              >
                Ask AI
              </button>
            )}
          </div>

          {/* History for this meal today */}
          {latest?.notes && (
            <div className="pt-3 border-t border-line-soft text-xs text-fg-dim italic">
              {latest.notes}
            </div>
          )}
        </div>
      )}

      {logOpen && (
        <LogMealModal
          meal={meal}
          date={date}
          existing={latest}
          onClose={() => setLogOpen(false)}
          onDone={(entry) => {
            // If there was a prior entry, remove it so we don't stack duplicates
            clearMealEntry(date, meal.id);
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

function StatusDot({ status }) {
  if (status === "eaten") {
    return (
      <div className="h-7 w-7 rounded-full bg-[rgb(var(--fit-done))] text-white flex items-center justify-center shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 5 5L20 7" />
        </svg>
      </div>
    );
  }
  if (status === "skipped") {
    return (
      <div className="h-7 w-7 rounded-full bg-[rgb(var(--fit-skipped))] text-white flex items-center justify-center shrink-0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </div>
    );
  }
  return (
    <div className="h-7 w-7 rounded-full border-2 border-line shrink-0" />
  );
}

function QuickAction({ active, onClick, variant, label, children }) {
  const base =
    "h-11 w-11 rounded-full flex items-center justify-center transition active:scale-90 shrink-0";
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

function LogMealModal({ meal, date, existing, onClose, onDone }) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const [timeEaten, setTimeEaten] = useState(
    existing?.timeEaten || `${hh}:${mm}`
  );
  const [minutesToCook, setMinutesToCook] = useState(
    existing?.minutesToCook ? String(existing.minutesToCook) : ""
  );
  const [notes, setNotes] = useState(existing?.notes || "");

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-bg rounded-t-3xl sm:rounded-3xl sm:mx-4 max-h-[85vh] overflow-y-auto"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          boxShadow: "0 -8px 24px rgba(31, 31, 31, 0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-line-bright" />
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-fg">
              Log {meal.title.split(" — ")[0].toLowerCase()}
            </h3>
            <button
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center text-fg-muted active:scale-95 rounded-full"
              aria-label="close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <Field label="Eaten at">
            <input
              type="time"
              value={timeEaten}
              onChange={(e) => setTimeEaten(e.target.value)}
              className="fit-input"
            />
          </Field>

          <Field label="Minutes to cook">
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 25"
              value={minutesToCook}
              onChange={(e) => setMinutesToCook(e.target.value)}
              className="fit-input"
            />
          </Field>

          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Swapped curd for yogurt, added spinach…"
              className="fit-input resize-none text-sm"
            />
          </Field>

          <button
            onClick={() =>
              onDone({
                mealId: meal.id,
                mealTitle: meal.title,
                status: "eaten",
                timeEaten,
                minutesToCook: minutesToCook ? parseInt(minutesToCook, 10) : 0,
                notes: notes.trim(),
                loggedAt: new Date().toISOString(),
              })
            }
            className="fit-btn-primary w-full mt-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="fit-label block mb-2">{label}</label>
      {children}
    </div>
  );
}
