import React, { useState } from "react";
import { useNatal } from "../context/NatalStore";
import { parseLessonId } from "../engine/sm2";
import { LessonModal } from "./LessonModal";

export const TodayTab: React.FC = () => {
  const {
    phases,
    checked,
    activePlan,
    budgetInfo,
    dueReviews,
    isGateOpen,
    setActiveTab,
    pacePreference,
    setPacePreference,
    pomodoroActive,
    pomodoroTimeLeft,
    pomodoroMode,
    togglePomodoro,
    resetPomodoro,
    setPomodoroMode,
    notes,
    feynmanNotes,
    difficulty,
    ensurePlan,
    unlockPlanNow,
    toggleLesson,
    getLessonGateStatus,
  } = useNatal();

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Formatted dates
  const todayDateEn = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const todayDateFa = new Intl.DateTimeFormat("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  // Pomodoro
  const minutes = Math.floor(pomodoroTimeLeft / 60);
  const seconds = pomodoroTimeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isWork = pomodoroMode === "work";
  const pomodoroTotal = isWork ? 1500 : 300;
  const pomodoroDash = (pomodoroTimeLeft / pomodoroTotal) * 125.6;

  // Plan progress
  const planLessonIds = activePlan?.lessonIds || [];
  const planCompleted = planLessonIds.filter((id) => checked.includes(id)).length;
  const planTotal = planLessonIds.length;
  const isPlanAllDone = planTotal > 0 && planCompleted === planTotal;

  // Total course progress
  const totalLessonsCount = phases.reduce(
    (acc, ph) => acc + ph.mods.reduce((mAcc, m) => mAcc + m.lessons.length, 0),
    0
  );
  const totalCheckedCount = checked.length;
  const totalProgressPercent = totalLessonsCount > 0 ? Math.round((totalCheckedCount / totalLessonsCount) * 100) : 0;

  // Helper to get lesson details
  const getLessonDetails = (lessonId: string) => {
    return parseLessonId(lessonId, phases);
  };

  return (
    <div id="today-tab" className="px-4 pt-5 pb-8 font-sans w-full max-w-[440px] mx-auto text-white">
      {/* Top Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold text-white/30 tracking-widest uppercase font-mono mb-1">
            {todayDateEn}
          </div>
          <div className="text-[11px] text-white/30 font-fa" dir="rtl">
            {todayDateFa}
          </div>
        </div>
        <div className="text-[28px] font-extrabold text-white tracking-tight leading-none">
          Today
        </div>
      </div>

      {/* Review Gate Warning if reviews are due */}
      {!isGateOpen && dueReviews.length > 0 && (
        <div
          id="due-reviews-warning"
          className="bg-[#EF4444]/[0.08] border border-[#EF4444]/25 rounded-2xl p-3.5 mb-4 flex items-center gap-3 transition-all"
        >
          <div className="w-9 h-9 rounded-xl flex-shrink-0 bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#EF4444] leading-tight">
              {dueReviews.length} review{dueReviews.length > 1 ? "s" : ""} due
            </div>
            <div className="text-[11px] text-white/40 leading-snug font-fa mt-0.5" dir="rtl">
              مرور کارت‌ها قبل از یادگیری درس‌های جدید الزامی است
            </div>
          </div>
          <button
            onClick={() => setActiveTab("review")}
            className="bg-[#EF4444]/20 hover:bg-[#EF4444]/30 border border-[#EF4444]/40 rounded-lg px-3 py-1.5 text-[#EF4444] text-[11px] font-bold cursor-pointer transition-colors flex-shrink-0 font-sans"
          >
            Review Now
          </button>
        </div>
      )}

      {/* 2-Column Metrics Grid: Overall Progress & Daily Budget */}
      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        {/* Card 1: Progress */}
        <div className="linear-card p-3.5 relative overflow-hidden flex flex-col justify-between">
          <div className="text-[9px] text-white/35 font-mono uppercase tracking-wider mb-1.5">
            Curriculum
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-extrabold font-mono text-[#F59E0B] tracking-tight leading-none">
              {totalProgressPercent}
            </span>
            <span className="text-sm text-[#F59E0B] font-mono">%</span>
          </div>
          <div className="text-[9px] text-white/30 font-mono mt-1">
            {totalCheckedCount}/{totalLessonsCount} items
          </div>
        </div>

        {/* Card 2: Cognitive Budget */}
        <div className={`linear-card p-3.5 flex flex-col justify-between ${budgetInfo.budget > 0 ? "border-[#F59E0B]/20" : ""}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] text-white/35 font-mono uppercase tracking-wider">
              Daily Budget
            </span>
            <div className="flex items-center gap-0.5 bg-white/[0.04] p-0.5 rounded-md border border-white/[0.06]">
              {(["relaxed", "standard", "intensive"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPacePreference(p)}
                  title={`Pace: ${p} (Ceiling: ${p === "relaxed" ? 2 : p === "standard" ? 3 : 5}/day)`}
                  className={`px-1.5 py-0.5 text-[8px] font-mono uppercase rounded transition-colors cursor-pointer ${
                    pacePreference === p
                      ? "bg-[#F59E0B] text-black font-bold"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {p[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-[28px] font-extrabold font-mono tracking-tight leading-none ${budgetInfo.budget > 0 ? "text-[#F59E0B]" : "text-white/30"}`}>
              {budgetInfo.budget}
            </span>
            <span className="text-[11px] text-white/25 font-mono">left</span>
          </div>
          <div className="text-[9px] text-white/30 font-mono mt-1">
            {budgetInfo.reviewLoad > 0 ? `${budgetInfo.reviewLoad} review load` : `${pacePreference} • cap ${budgetInfo.personalCeiling}`}
          </div>
        </div>
      </div>

      {/* Pomodoro Focus Station */}
      <div className="linear-card p-3.5 mb-3.5">
        <div className="flex items-center gap-3.5">
          {/* Circular Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg width="46" height="46" className="-rotate-90">
              <circle cx="23" cy="23" r="19" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle
                cx="23"
                cy="23"
                r="19"
                fill="none"
                stroke={isWork ? "#F59E0B" : "#10B981"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${pomodoroDash} 125.6`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {isWork ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                </svg>
              )}
            </div>
          </div>

          {/* Time & Mode text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <button
                onClick={() => setPomodoroMode("work")}
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  isWork
                    ? "bg-[#F59E0B]/20 text-[#F59E0B] font-bold border border-[#F59E0B]/40"
                    : "text-white/30 hover:text-white"
                }`}
              >
                Focus (25m)
              </button>
              <button
                onClick={() => setPomodoroMode("break")}
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  !isWork
                    ? "bg-[#10B981]/20 text-[#10B981] font-bold border border-[#10B981]/40"
                    : "text-white/30 hover:text-white"
                }`}
              >
                Break (5m)
              </button>
            </div>
            <div className="text-[20px] font-extrabold font-mono text-white tracking-tight leading-none">
              {timeFormatted}
            </div>
            <div className="text-[10px] text-white/35 mt-1 truncate">
              {pomodoroActive
                ? isWork
                  ? "Focus · Deep Systems Work"
                  : "Break · Cognitive Reset"
                : "Pomodoro Focus Ready"}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={togglePomodoro}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                pomodoroActive
                  ? "bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30"
                  : isWork
                  ? "bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-black font-semibold shadow-sm"
                  : "bg-[#10B981] hover:bg-[#10B981]/90 text-black font-semibold shadow-sm"
              }`}
            >
              {pomodoroActive ? "Pause" : "Start"}
            </button>
            <button
              onClick={resetPomodoro}
              title="Reset Timer"
              className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/40 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Gate Lessons Card */}
      <div className="linear-card overflow-hidden mb-5">
        {/* Card Header */}
        <div className="p-3.5 border-b border-white/[0.05] flex items-center justify-between">
          <div>
            <div className="text-[13px] font-bold text-white flex items-center gap-2">
              <span>Daily Target</span>
              <span className="text-[10px] font-fa text-white/30 font-normal" dir="rtl">
                (برنامه امروز)
              </span>
            </div>
            <div className="text-[10px] font-mono text-white/30 mt-0.5">
              {planCompleted}/{planTotal} completed
            </div>
          </div>

          {isPlanAllDone && (
            <button
              onClick={unlockPlanNow}
              className="text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 font-mono cursor-pointer"
            >
              <span>+ Unlock Next</span>
            </button>
          )}
        </div>

        {/* Lessons List */}
        {planLessonIds.length > 0 ? (
          <div className="divide-y divide-white/[0.04]">
            {planLessonIds.map((lessonId, idx) => {
              const details = getLessonDetails(lessonId);
              if (!details) return null;
              const isDone = checked.includes(lessonId);
              const gateStatus = getLessonGateStatus(lessonId);
              const note = notes[lessonId];
              const feynman = feynmanNotes[lessonId];
              const diff = difficulty[lessonId] || 0;

              return (
                <div
                  key={lessonId}
                  className={`p-3.5 flex items-start gap-3 transition-opacity ${
                    !isGateOpen && !isDone ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {/* Checkbox / Gate Indicator */}
                  <button
                    onClick={() => {
                      if (isDone) {
                        toggleLesson(lessonId);
                      } else if (gateStatus.canComplete) {
                        toggleLesson(lessonId);
                      } else {
                        // Open modal so user sees the gate reasons and can complete them
                        setSelectedLessonId(lessonId);
                      }
                    }}
                    title={
                      isDone
                        ? "Mark incomplete"
                        : gateStatus.canComplete
                        ? "Complete and enter into SM-2 cycle"
                        : gateStatus.unmetReasons[0] || "Requirements locked"
                    }
                    aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                    className={`w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center cursor-pointer transition-all ${
                      isDone
                        ? "bg-[#F59E0B] border-2 border-[#F59E0B]"
                        : gateStatus.canComplete
                        ? "border-[1.5px] border-[#F59E0B] bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20"
                        : !gateStatus.isUnlocked
                        ? "border border-white/10 bg-white/[0.02] text-white/30"
                        : "border-[1.5px] border-white/20 hover:border-[#F59E0B]/60 bg-transparent"
                    }`}
                  >
                    {isDone ? (
                      <svg width="10" height="8" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4.5l3 3L10 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : !gateStatus.isUnlocked ? (
                      <span className="text-[9px]">🔒</span>
                    ) : gateStatus.canComplete ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    ) : null}
                  </button>

                  {/* Text Details */}
                  <div
                    onClick={() => setSelectedLessonId(lessonId)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div
                      className={`text-[13px] font-medium leading-snug mb-0.5 ${
                        isDone ? "text-white/30 line-through" : "text-white hover:text-[#F59E0B] transition-colors"
                      }`}
                    >
                      {details.title}
                    </div>
                    <div className="text-[11px] text-white/35 font-fa leading-normal mb-1.5" dir="rtl">
                      {details.fa}
                    </div>

                    {/* Meta Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {!isDone && !gateStatus.canComplete && (
                        <span className="linear-badge bg-white/[0.04] text-white/40 border border-white/[0.06] text-[9px]">
                          {!gateStatus.isUnlocked ? "Locked 🔒" : gateStatus.isGateLocked ? "Reviews Due ⛔" : "Gated ⏳"}
                        </span>
                      )}
                      {note?.text && (
                        <span className="linear-badge bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/25">
                          Note
                        </span>
                      )}
                      {feynman?.text && (
                        <span className="linear-badge bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/25">
                          Feynman
                        </span>
                      )}
                      {diff > 0 && (
                        <span className="linear-badge bg-white/[0.04] text-[#F59E0B] border border-white/[0.06]">
                          {"★".repeat(diff)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Note / Detail Edit Button */}
                  <button
                    onClick={() => setSelectedLessonId(lessonId)}
                    aria-label="Edit note and study"
                    className="w-7 h-7 rounded-lg flex-shrink-0 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-white/30 font-fa" dir="rtl">
            برنامه امروز آماده شد! روی کلید «مسیر» (Path) بزنید تا درس‌های جدید را کاوش کنید.
          </div>
        )}
      </div>

      {/* Selected Lesson Modal */}
      {selectedLessonId && (
        <LessonModal lessonId={selectedLessonId} onClose={() => setSelectedLessonId(null)} />
      )}
    </div>
  );
};
