import React, { useState, useEffect } from "react";
import { useNatal } from "../context/NatalStore";
import { requestSystemNotificationPermission } from "../engine/audioNotification";

export const FloatingPomodoroBar: React.FC = () => {
  const {
    pomodoroActive,
    pomodoroTimeLeft,
    pomodoroMode,
    togglePomodoro,
    resetPomodoro,
    activeTab,
  } = useNatal();

  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, [pomodoroActive]);

  const handleRequestNotification = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const perm = await requestSystemNotificationPermission();
    setNotifPermission(perm);
  };

  const minutes = Math.floor(pomodoroTimeLeft / 60);
  const seconds = pomodoroTimeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isWork = pomodoroMode === "work";
  const totalDuration = isWork ? 25 * 60 : 5 * 60;
  const progressPct = Math.max(0, Math.min(100, ((totalDuration - pomodoroTimeLeft) / totalDuration) * 100));

  // Only show floating widget when on tabs OTHER than Today (since Today has the full timer card),
  // OR if pomodoro is running so user always has immediate access anywhere.
  if (activeTab === "today" && !pomodoroActive) {
    return null;
  }

  // If minimized to a small floating badge
  if (minimized) {
    return (
      <div className="fixed bottom-20 right-4 z-40 animate-fade-in">
        <button
          onClick={() => setMinimized(false)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xl backdrop-blur-md cursor-pointer transition-all ${
            pomodoroActive
              ? isWork
                ? "bg-[#0d0d0d]/90 border-[#F59E0B]/50 text-[#F59E0B] shadow-[#F59E0B]/10"
                : "bg-[#0d0d0d]/90 border-[#10B981]/50 text-[#10B981] shadow-[#10B981]/10"
              : "bg-[#0d0d0d]/90 border-white/10 text-white/60 hover:text-white"
          }`}
        >
          <span className="relative flex h-2 w-2">
            {pomodoroActive && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isWork ? "bg-[#F59E0B]" : "bg-[#10B981]"}`} />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isWork ? "bg-[#F59E0B]" : "bg-[#10B981]"}`} />
          </span>
          <span className="font-mono text-xs font-bold">{timeFormatted}</span>
          <span className="text-[10px] opacity-60 font-mono">⏱️</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="floating-pomodoro-bar"
      className="fixed bottom-[74px] left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-[416px] animate-slide-up"
    >
      <div className={`p-2.5 rounded-xl border backdrop-blur-xl bg-[#0a0a0a]/95 shadow-[0_10px_35px_rgba(0,0,0,0.85)] transition-all ${
        pomodoroActive
          ? isWork
            ? "border-[#F59E0B]/40 shadow-[#F59E0B]/5"
            : "border-[#10B981]/40 shadow-[#10B981]/5"
          : "border-white/[0.08]"
      }`}>
        {/* Progress Line */}
        <div className="w-full bg-white/[0.04] h-1 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isWork ? "bg-[#F59E0B]" : "bg-[#10B981]"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2.5">
          {/* Status & Mode */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              {pomodoroActive && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isWork ? "bg-[#F59E0B]" : "bg-[#10B981]"}`} />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isWork ? "bg-[#F59E0B]" : "bg-[#10B981]"}`} />
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${isWork ? "text-[#F59E0B]" : "text-[#10B981]"}`}>
                  {isWork ? "Deep Focus" : "Cognitive Break"}
                </span>
                {notifPermission === "granted" ? (
                  <span title="System notifications active" className="text-[9px] text-[#10B981] font-mono">
                    🔔 On
                  </span>
                ) : (
                  <button
                    onClick={handleRequestNotification}
                    title="Click to enable system notifications when timer completes"
                    className="text-[9px] font-mono text-white/40 hover:text-[#F59E0B] underline cursor-pointer"
                  >
                    🔔 Enable Alert
                  </button>
                )}
              </div>
              <div className="text-[9px] text-white/30 font-fa truncate" dir="rtl">
                {pomodoroActive ? (isWork ? "در حال اجرای سشن تمرکز ۲۵ دقیقه‌ای" : "در حال استراحت ۵ دقیقه‌ای") : "تایمر متوقف است"}
              </div>
            </div>
          </div>

          {/* Time & Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-mono text-sm font-extrabold text-white tracking-tight">
              {timeFormatted}
            </span>

            <button
              onClick={togglePomodoro}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                pomodoroActive
                  ? "bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] border border-[#EF4444]/30"
                  : isWork
                  ? "bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-black shadow-sm"
                  : "bg-[#10B981] hover:bg-[#10B981]/90 text-black shadow-sm"
              }`}
            >
              {pomodoroActive ? "Pause" : "Start"}
            </button>

            <button
              onClick={resetPomodoro}
              title="Reset Timer"
              className="w-6 h-6 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>

            <button
              onClick={() => setMinimized(true)}
              title="Minimize to floating pill"
              className="w-6 h-6 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white transition-colors cursor-pointer"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
