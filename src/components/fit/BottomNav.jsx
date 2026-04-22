import { tap } from "../../lib/haptics";

const TABS = [
  { id: "today", label: "today", icon: TodayIcon },
  { id: "workout", label: "workout", icon: WorkoutIcon },
  { id: "diet", label: "diet", icon: DietIcon },
  { id: "coach", label: "coach", icon: CoachIcon },
  { id: "log", label: "log", icon: LogIcon },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-bg/95 backdrop-blur-md border-t border-line"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around">
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
              className={`flex-1 min-h-[64px] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition ${
                isActive ? "text-amber" : "text-fg-muted"
              }`}
              aria-label={t.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={22} />
              <span className="text-[10px] tracking-wide">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function TodayIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 3v4M16 3v4" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
    </svg>
  );
}

function WorkoutIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M6 6v12M18 6v12" />
      <path d="M3 9v6M21 9v6" />
      <path d="M6 12h12" />
    </svg>
  );
}

function DietIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 11a8 8 0 0 1 16 0v0a8 8 0 0 1-16 0z" />
      <path d="M4 11h16" />
      <path d="M12 11V3" />
      <path d="M9 3h6" />
    </svg>
  );
}

function CoachIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function LogIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 4 4 5-7" />
    </svg>
  );
}
