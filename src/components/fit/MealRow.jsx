import { useState } from "react";
import { appendMealLog } from "../../lib/storage";
import { success, bump } from "../../lib/haptics";

export default function MealRow({ meal, date, todayLogs, onLogged, onAskAI }) {
  const [open, setOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const entriesForThisMeal = todayLogs.filter((m) => m.mealId === meal.id);
  const logged = entriesForThisMeal.length > 0;

  return (
    <div className="fit-card overflow-hidden">
      <button
        onClick={() => {
          bump();
          setOpen((v) => !v);
        }}
        className="w-full min-h-[60px] flex items-center justify-between gap-3 px-5 py-3.5 text-left active:bg-bg-elev transition"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
              logged ? "bg-amber text-white" : "border-2 border-line"
            }`}
          >
            {logged && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5L20 7" />
              </svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-medium text-fg truncate">
              {meal.title.split(" — ")[0]}
            </div>
            <div className="text-xs text-fg-muted mt-0.5">{meal.window}</div>
          </div>
        </div>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="border-t border-line-soft px-5 pb-5 pt-4 space-y-4">
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

          {meal.instructions && (
            <div>
              <div className="fit-label mb-2">How to</div>
              <p className="text-sm text-fg-dim leading-relaxed">
                {meal.instructions}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setLogOpen(true)}
              className="fit-btn-primary flex-1"
            >
              {logged ? "Log again" : "Mark as eaten"}
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

          {entriesForThisMeal.length > 0 && (
            <div className="pt-3 border-t border-line-soft space-y-1.5">
              {entriesForThisMeal.map((entry, i) => (
                <div key={i} className="text-xs text-fg-muted">
                  <span className="text-term-green font-medium">✓</span>{" "}
                  Eaten at {entry.timeEaten}
                  {entry.minutesToCook > 0 && ` · took ${entry.minutesToCook} min`}
                  {entry.notes && (
                    <div className="text-fg-dim mt-0.5 italic pl-4">
                      {entry.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl sm:mx-4 max-h-[85vh] overflow-y-auto"
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
