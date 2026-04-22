import { useState } from "react";
import { addCheckin, getPrefs } from "../../lib/storage";
import { openWhatsApp } from "../../lib/whatsapp";
import { todayISO, weekNumber, buildCheckinMessage, recentSummary } from "../../lib/fitness-format";
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
      setStatus("set your coach's whatsapp number in settings first");
      setTimeout(() => setStatus(""), 3500);
      return;
    }
    openWhatsApp(coachWhatsApp, msg);
    addCheckin({
      ...form,
      weekNumber: wk,
      submittedAt: new Date().toISOString(),
      currentWeight: form.currentWeight ? parseFloat(form.currentWeight) : null,
    });
    success();
    setStatus("check-in saved + whatsapp opened");
    setTimeout(() => setStatus(""), 3500);
  };

  return (
    <div className="card">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-base text-fg">
          <span className="text-amber">$</span> weekly check-in
        </h3>
        {wk != null && wk > 0 && (
          <span className="text-[11px] text-amber">week {wk}</span>
        )}
      </div>

      <Field label="current weight (kg)">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={form.currentWeight}
          onChange={(e) => set("currentWeight", e.target.value)}
          className={inputCls()}
        />
      </Field>

      <Field label="diet consistency">
        <textarea
          value={form.dietConsistency}
          onChange={(e) => set("dietConsistency", e.target.value)}
          rows={2}
          className={inputCls()}
          placeholder="followed ~90%, skipped dinner twice"
        />
      </Field>

      <Field label="workouts regular?">
        <textarea
          value={form.workoutsRegular}
          onChange={(e) => set("workoutsRegular", e.target.value)}
          rows={2}
          className={inputCls()}
          placeholder="6/6 sessions, hit all PRs except overhead"
        />
      </Field>

      <Field label="energy levels">
        <textarea
          value={form.energyLevels}
          onChange={(e) => set("energyLevels", e.target.value)}
          rows={2}
          className={inputCls()}
        />
      </Field>

      <Field label="physical changes noticed">
        <textarea
          value={form.physicalChanges}
          onChange={(e) => set("physicalChanges", e.target.value)}
          rows={2}
          className={inputCls()}
        />
      </Field>

      <Field label="mental state">
        <textarea
          value={form.mentalState}
          onChange={(e) => set("mentalState", e.target.value)}
          rows={2}
          className={inputCls()}
        />
      </Field>

      <Field label="extra notes for coach">
        <textarea
          value={form.extraNotes}
          onChange={(e) => set("extraNotes", e.target.value)}
          rows={2}
          className={inputCls()}
          placeholder="questions, anything else..."
        />
      </Field>

      <label className="flex items-center gap-2 mt-3 mb-4 select-none">
        <input
          type="checkbox"
          checked={form.attachPics}
          onChange={(e) => set("attachPics", e.target.checked)}
          className="h-5 w-5 accent-amber"
        />
        <span className="text-sm text-fg-dim">photos attached separately</span>
      </label>

      {/* Preview */}
      {preview && (
        <div className="mt-4 border border-line bg-bg-elev p-3">
          <div className="text-[10px] text-fg-muted uppercase tracking-wider mb-2">
            preview
          </div>
          <pre className="text-xs text-fg-dim whitespace-pre-wrap font-mono">{preview}</pre>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={build} className="btn justify-center">
          generate draft
        </button>
        <button onClick={sendToCoach} className="btn-primary justify-center">
          send on whatsapp
        </button>
      </div>

      {status && (
        <div className="mt-3 text-[11px] text-term-green">{status}</div>
      )}

      <div className="mt-4 pt-4 border-t border-line text-[10px] text-fg-faint leading-relaxed">
        rule: send saturdays 9am–11:59pm IST. attach front + side photos in
        whatsapp after the message opens.
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="text-[11px] text-fg-muted block mb-1.5">
        <span className="text-amber">&gt;</span> {label}
      </label>
      {children}
    </div>
  );
}

function inputCls() {
  return "w-full bg-bg-elev border border-line text-fg text-sm font-mono p-2.5 outline-none focus:border-amber transition resize-none";
}
