import { useState } from "react";
import { addCheckin, getPrefs } from "../../lib/storage";
import { openWhatsApp } from "../../lib/whatsapp";
import {
  todayISO,
  weekNumber,
  buildCheckinMessage,
  recentSummary,
} from "../../lib/fitness-format";
import { success } from "../../lib/haptics";

const EMPTY = {
  currentWeight: "",
  dietConsistency: "",
  workoutsRegular: "",
  energyLevels: "",
  physicalChanges: "",
  mentalState: "",
  attachPics: true,
  extraNotes: "",
};

export default function CheckinForm({ plan, draft, onDrafted }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState(draft || "");
  const wk = weekNumber(plan.meta?.planStart);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const build = () => {
    const recent = recentSummary(7);
    const msg = buildCheckinMessage({
      checkin: { ...form, currentWeight: form.currentWeight, weekNumber: wk },
      weekNum: wk,
      weights: recent.weights,
      sessions: recent.sessions,
      notes: form.extraNotes,
    });
    setPreview(msg);
    onDrafted?.(msg);
    return msg;
  };

  const sendToCoach = () => {
    const msg = preview || build();
    const { coachWhatsApp } = getPrefs();
    if (!coachWhatsApp) {
      setStatus("Set your coach's WhatsApp number in Settings first");
      setTimeout(() => setStatus(""), 3500);
      return;
    }
    openWhatsApp(coachWhatsApp, msg);
    addCheckin({
      ...form,
      weekNumber: wk,
      submittedAt: new Date().toISOString(),
      currentWeight: form.currentWeight
        ? parseFloat(form.currentWeight)
        : null,
    });
    success();
    setStatus("Check-in saved and WhatsApp opened");
    setTimeout(() => setStatus(""), 3500);
  };

  return (
    <div className="fit-card p-5">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-fg">Weekly check-in</h3>
          <p className="text-xs text-fg-muted mt-0.5">
            Saturdays, then WhatsApp to coach
          </p>
        </div>
        {wk != null && wk > 0 && (
          <span className="text-xs font-semibold text-amber">Week {wk}</span>
        )}
      </div>

      <Field label="Current weight (kg)">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={form.currentWeight}
          onChange={(e) => set("currentWeight", e.target.value)}
          className="fit-input"
        />
      </Field>

      <Field label="Diet consistency">
        <textarea
          value={form.dietConsistency}
          onChange={(e) => set("dietConsistency", e.target.value)}
          rows={2}
          className="fit-input resize-none text-sm"
          placeholder="Followed ~90%, skipped dinner twice"
        />
      </Field>

      <Field label="Workouts regular?">
        <textarea
          value={form.workoutsRegular}
          onChange={(e) => set("workoutsRegular", e.target.value)}
          rows={2}
          className="fit-input resize-none text-sm"
          placeholder="6/6 sessions, hit all PRs except overhead"
        />
      </Field>

      <Field label="Energy levels">
        <textarea
          value={form.energyLevels}
          onChange={(e) => set("energyLevels", e.target.value)}
          rows={2}
          className="fit-input resize-none text-sm"
        />
      </Field>

      <Field label="Physical changes noticed">
        <textarea
          value={form.physicalChanges}
          onChange={(e) => set("physicalChanges", e.target.value)}
          rows={2}
          className="fit-input resize-none text-sm"
        />
      </Field>

      <Field label="Mental state">
        <textarea
          value={form.mentalState}
          onChange={(e) => set("mentalState", e.target.value)}
          rows={2}
          className="fit-input resize-none text-sm"
        />
      </Field>

      <Field label="Extra notes for coach">
        <textarea
          value={form.extraNotes}
          onChange={(e) => set("extraNotes", e.target.value)}
          rows={2}
          className="fit-input resize-none text-sm"
          placeholder="Questions, anything else…"
        />
      </Field>

      <label className="flex items-center gap-2.5 mt-4 mb-4 select-none cursor-pointer">
        <input
          type="checkbox"
          checked={form.attachPics}
          onChange={(e) => set("attachPics", e.target.checked)}
          className="h-5 w-5 rounded accent-amber"
        />
        <span className="text-sm text-fg-dim">
          Photos attached separately in WhatsApp
        </span>
      </label>

      {preview && (
        <div className="mt-4 bg-bg-elev rounded-xl p-4">
          <div className="fit-label mb-2">Preview</div>
          <pre className="text-xs text-fg-dim whitespace-pre-wrap leading-relaxed font-sans">
            {preview}
          </pre>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button onClick={build} className="fit-btn">
          Generate draft
        </button>
        <button onClick={sendToCoach} className="fit-btn-primary">
          Send on WhatsApp
        </button>
      </div>

      {status && (
        <div className="mt-3 text-sm text-term-green font-medium">
          {status}
        </div>
      )}

      <p className="mt-5 pt-4 border-t border-line-soft text-xs text-fg-faint leading-relaxed">
        Rule: send Saturdays 9am–11:59pm IST. Attach front and side photos in
        WhatsApp after the message opens.
      </p>
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
