import { tap } from "../../lib/haptics";

const TABS = [
  { id: "today", label: "Today", icon: TodayIcon },
  { id: "workout", label: "Workout", icon: WorkoutIcon },
  { id: "diet", label: "Diet", icon: DietIcon },
  { id: "coach", label: "Coach", icon: CoachIcon },
  { id: "log", label: "Log", icon: LogIcon },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-bg/90 backdrop-blur-md border-t border-line-soft"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {TABS.map((t) => {
          const isActive = active === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => {
                if (!isActive) {
                  tap();
                  onChange(t.id);
                }
              }}
              className={`flex-1 min-h-[60px] flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
                isActive ? "text-amber" : "text-fg-muted"
              }`}
              aria-label={t.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon filled={isActive} />
              <span className={`text-[11px] ${isActive ? "font-semibold" : "font-medium"}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function TodayIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={filled ? 2 : 1.6} strokeLinecap="round">
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10h16" />
      <path d="M8 4v4M16 4v4" />
    </svg>
  );
}

function WorkoutIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={filled ? 2 : 1.6} strokeLinecap="round">
      <path d="M6.5 6.5v11M17.5 6.5v11" />
      <path d="M3 10v4M21 10v4" />
      <path d="M6.5 12h11" />
    </svg>
  );
}

function DietIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={filled ? 2 : 1.6} strokeLinecap="round">
      <path d="M12 3c-1 3-3 4-3 7a3 3 0 0 0 6 0c0-3-2-4-3-7z" />
      <path d="M5 20c0-4 3-6 7-6s7 2 7 6" />
    </svg>
  );
}

function CoachIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={filled ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12a8 8 0 1 1-3.5-6.6L20 4v4h-4" />
      <circle cx="9" cy="12" r="0.5" fill="currentColor" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
      <circle cx="15" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}

function LogIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={filled ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20V4" />
      <path d="M3 20h18" />
      <path d="M6 16l4-5 4 3 5-8" />
    </svg>
  );
}
