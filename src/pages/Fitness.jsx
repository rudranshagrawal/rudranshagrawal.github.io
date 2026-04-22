import { useEffect, useState, useCallback } from "react";
import AuthGate from "../components/fit/AuthGate";
import BottomNav from "../components/fit/BottomNav";
import TodayTab from "../components/fit/TodayTab";
import WorkoutTab from "../components/fit/WorkoutTab";
import DietTab from "../components/fit/DietTab";
import CoachTab from "../components/fit/CoachTab";
import LogTab from "../components/fit/LogTab";
import SettingsSheet from "../components/fit/SettingsSheet";

const TAB_TITLES = {
  today: "Today",
  workout: "Workout",
  diet: "Diet",
  coach: "Coach",
  log: "Log",
};

export default function Fitness() {
  const [plan, setPlan] = useState(null);
  const [activeTab, setActiveTab] = useState("today");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Noindex for this route only
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Fitness";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    return () => {
      document.title = prevTitle;
      document.head.removeChild(meta);
    };
  }, []);

  const handleLogout = useCallback(() => {
    setPlan(null);
    setSettingsOpen(false);
  }, []);

  if (!plan) {
    return (
      <div className="fit-theme min-h-screen">
        <AuthGate onUnlock={setPlan} />
      </div>
    );
  }

  const tabProps = { plan, setActiveTab };

  return (
    <div
      className="fit-theme min-h-screen"
      style={{ paddingBottom: "calc(76px + env(safe-area-inset-bottom))" }}
    >
      <TopBar
        title={TAB_TITLES[activeTab]}
        onSettings={() => setSettingsOpen(true)}
      />

      <main>
        {activeTab === "today" && <TodayTab {...tabProps} />}
        {activeTab === "workout" && <WorkoutTab {...tabProps} />}
        {activeTab === "diet" && <DietTab {...tabProps} />}
        {activeTab === "coach" && <CoachTab {...tabProps} />}
        {activeTab === "log" && <LogTab {...tabProps} />}
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />

      {settingsOpen && (
        <SettingsSheet
          onClose={() => setSettingsOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

function TopBar({ title, onSettings }) {
  return (
    <header
      className="sticky top-0 z-30 bg-bg/85 backdrop-blur-md border-b border-line-soft"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="px-5 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-fg">{title}</h1>
        <button
          onClick={onSettings}
          aria-label="settings"
          className="h-11 w-11 flex items-center justify-center text-fg-dim active:scale-95 transition rounded-full hover:bg-bg-elev"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
