import React, { useState, useEffect } from "react";
import { useNatal } from "../context/NatalStore";
import { parseLessonId, getNextCutoffTimestamp } from "../engine/sm2";
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
    unlockPlanNow,
    toggleLesson,
    getLessonGateStatus,
  } = useNatal();

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Live countdown to next Cognitive Rollover (Next day morning cutoff)
  const [unlockCountdown, setUnlockCountdown] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const targetTime = activePlan?.unlockAt && activePlan.unlockAt > now
        ? activePlan.unlockAt
        : getNextCutoffTimestamp(new Date(now));
      
      const diff = Math.max(0, targetTime - now);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setUnlockCountdown({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activePlan?.unlockAt]);

  // Formatted dates
  const todayDateEn = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const todayDateFa = new Intl.DateTimeFormat("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  // Pomodoro computations
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
  const isPlanAllDone = planTotal > 0 && planCompleted >= planTotal;

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

  // Next actionable lesson for the Hero Spotlight
  const nextTargetLessonId = planLessonIds.find((id) => !checked.includes(id)) || planLessonIds[0];
  const heroLessonDetails = nextTargetLessonId ? getLessonDetails(nextTargetLessonId) : null;
  const heroGateStatus = nextTargetLessonId ? getLessonGateStatus(nextTargetLessonId) : null;
  const isHeroDone = nextTargetLessonId ? checked.includes(nextTargetLessonId) : false;

  return (
    <div id="today-tab" className="px-4 pt-4 pb-12 font-sans w-full max-w-[440px] mx-auto text-white selection:bg-[#F59E0B] selection:text-black">
      
      {/* 1. Header Bar */}
      <header className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlanAllDone ? "bg-[#10B981]" : "bg-[#F59E0B]"}`} />
            <span className="text-[10px] font-mono text-white/60">
              Natal OS • {isPlanAllDone ? "Consolidation Active" : "Cognitive Budget"}
            </span>
          </div>

          <div className="text-[11px] font-mono text-white/40">
            {todayDateEn}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[26px] font-extrabold text-white tracking-tight leading-tight font-fa" dir="rtl">
              برنامه امروز
            </h1>
            <p className="text-[12px] text-white/40 font-fa mt-0.5" dir="rtl">
              {todayDateFa}
            </p>
          </div>

          <div className="text-right">
            <span className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-mono ${
              isPlanAllDone 
                ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 font-bold"
                : "bg-white/[0.04] border-white/[0.06] text-white/70"
            }`}>
              {planCompleted}/{planTotal} {isPlanAllDone ? "تکمیل شد ✓" : "تکمیل‌شده"}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Review Gate Warning (If Spaced Repetition Due) */}
      {!isGateOpen && dueReviews.length > 0 && (
        <div
          id="due-reviews-warning"
          className="relative overflow-hidden bg-rose-950/20 border border-rose-500/25 rounded-xl p-3.5 mb-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                </svg>
              </div>
              <div className="text-right" dir="rtl">
                <div className="text-xs font-bold text-rose-300 font-fa flex items-center gap-1.5">
                  <span>دروازه مرور فعال است</span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-200 text-[10px] font-mono">
                    {dueReviews.length} کارت
                  </span>
                </div>
                <div className="text-[11px] text-white/50 font-fa mt-0.5">
                  مرور کارت‌های تکرار فاصله‌دار برای باز شدن گیت دروس جدید الزامی است.
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("review")}
              className="bg-rose-500 hover:bg-rose-400 text-black font-bold font-fa text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition-all flex-shrink-0 shadow-sm shadow-rose-500/20"
            >
              مرور سریع
            </button>
          </div>
        </div>
      )}

      {/* 3. Hero Feature Spotlight: Normal vs Daily Budget Completed Lock State */}
      {isPlanAllDone ? (
        <div className="linear-card p-4 mb-4 relative overflow-hidden bg-gradient-to-b from-[#10B981]/10 via-[#080808] to-[#080808] border border-[#10B981]/30 rounded-2xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-[#10B981]">
                  DAILY CONSOLIDATION LOCK
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/50 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
                {planCompleted}/{planTotal} Lessons Done
              </span>
            </div>

            <div className="text-right" dir="rtl">
              <h2 className="text-[16px] font-extrabold text-white font-fa leading-snug flex items-center gap-1.5">
                <span>سقف یادگیری امروز تکمیل شد</span>
                <span className="text-base">🌙</span>
              </h2>
              <p className="text-[11.5px] text-white/65 font-fa mt-1.5 leading-relaxed">
                تبریک! مغز شما حداکثر بودجه شناختی امروز را دریافت کرد. طبق علوم اعصاب، برای تثبیت سیناپسی (LTP) و ماندگاری در حافظه بلندمدت، نیاز به استراحت و چرخه خواب شبانه دارید.
              </p>
            </div>

            {/* Live Unlock Countdown Timer */}
            <div className="bg-[#050505] p-3 rounded-xl border border-white/[0.06] flex items-center justify-between gap-3">
              <div className="text-right" dir="rtl">
                <div className="text-[10.5px] font-bold text-white/60 font-fa">
                  زمان تا بازگشایی سقف روز بعد:
                </div>
                <div className="text-[9.5px] text-white/35 font-fa mt-0.5">
                  مرز شناختی روز جدید (۰۴:۰۰ صبح)
                </div>
              </div>
              <div className="flex items-center gap-1 font-mono text-base font-extrabold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-lg border border-[#10B981]/20">
                <span>{String(unlockCountdown.hours).padStart(2, "0")}</span>
                <span className="text-white/30">:</span>
                <span>{String(unlockCountdown.minutes).padStart(2, "0")}</span>
                <span className="text-white/30">:</span>
                <span className="text-xs text-white/70">{String(unlockCountdown.seconds).padStart(2, "0")}</span>
              </div>
            </div>

            {/* Post-Completion Actions */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.06]">
              <button
                onClick={() => setActiveTab("review")}
                className="flex-1 py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-fa text-xs font-bold transition-all cursor-pointer border border-white/[0.08] text-center"
              >
                🧠 جعبه مرور SM-2
              </button>

              <button
                onClick={unlockPlanNow}
                title="افزودن درس‌های بیشتر در حالت اضطراری"
                className="py-2 px-3 rounded-xl bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 text-[#F59E0B] font-fa text-xs font-bold transition-all cursor-pointer border border-[#F59E0B]/30 text-center"
              >
                ⚡ بازگشایی اضطراری
              </button>
            </div>
          </div>
        </div>
      ) : heroLessonDetails ? (
        <div className="linear-card p-4 mb-4 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
                  FOCUS TARGET
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-white/50">
                {heroLessonDetails.phase.split(":")[0] || "فاز جاری"}
              </span>
            </div>

            {/* Lesson Title */}
            <div className="mb-3 text-right" dir="rtl">
              <h2 className="text-[16px] font-extrabold text-white font-fa leading-snug group-hover:text-[#F59E0B] transition-colors">
                {heroLessonDetails.fa}
              </h2>
              <p className="text-[11px] font-mono text-white/40 mt-0.5 tracking-tight" dir="ltr">
                {heroLessonDetails.title}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (nextTargetLessonId) {
                      toggleLesson(nextTargetLessonId);
                    }
                  }}
                  title={isHeroDone ? "علامت‌گذاری به عنوان انجام‌نشده" : "تکمیل درس"}
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                    isHeroDone
                      ? "bg-[#F59E0B] text-black"
                      : "bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] text-white/40 hover:text-white"
                  }`}
                >
                  {isHeroDone ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-sm bg-[#F59E0B]" />
                  )}
                </button>
                <span className="text-[11px] font-fa text-white/40" dir="rtl">
                  {isHeroDone ? "تکمیل شد ✓" : "تخمین: ۲۵ دقیقه مطالعه"}
                </span>
              </div>

              <button
                onClick={() => setSelectedLessonId(nextTargetLessonId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-black font-extrabold text-[11px] font-fa cursor-pointer transition-all shadow-md shadow-[#F59E0B]/10"
              >
                <span>شروع مطالعه</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 4. Bento Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        
        {/* Bento 1: Cognitive Energy & Pace */}
        <div className="linear-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-fa font-bold text-white/40">
              ظرفیت روزانه
            </span>
            <div className="flex items-center gap-0.5 bg-[#050505] p-0.5 rounded border border-white/[0.06]">
              {(["relaxed", "standard", "intensive"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPacePreference(p)}
                  className={`px-1.5 py-0.5 text-[8.5px] font-fa rounded transition-all cursor-pointer ${
                    pacePreference === p
                      ? "bg-[#F59E0B] text-black font-bold"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {p === "relaxed" ? "آرام" : p === "standard" ? "معمولی" : "فشرده"}
                </button>
              ))}
            </div>
          </div>

          <div className="my-1">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-[24px] font-extrabold font-mono tracking-tight leading-none ${
                isPlanAllDone ? "text-[#10B981]" : "text-[#F59E0B]"
              }`}>
                {isPlanAllDone ? "۰" : budgetInfo.budget}
              </span>
              <span className="text-[11px] font-fa text-white/40">
                {isPlanAllDone ? "تکمیل سقف امروز" : "درس باقی‌مانده"}
              </span>
            </div>
            <div className="text-[9.5px] font-fa text-white/30 mt-0.5" dir="rtl">
              سقف شخصی: {budgetInfo.personalCeiling} درس در روز
            </div>
          </div>

          <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full transition-all duration-300 ${isPlanAllDone ? "bg-[#10B981]" : "bg-[#F59E0B]"}`}
              style={{
                width: `${Math.min(100, Math.round((planCompleted / Math.max(1, planTotal)) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Bento 2: Pomodoro Focus Engine */}
        <div className="linear-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-fa font-bold text-white/40">
              تمرکز عمیق
            </span>
            <div className="flex items-center gap-0.5 bg-[#050505] p-0.5 rounded border border-white/[0.06]">
              <button
                onClick={() => setPomodoroMode("work")}
                className={`px-1.5 py-0.5 text-[8.5px] font-fa rounded transition-all cursor-pointer ${
                  isWork ? "bg-[#F59E0B] text-black font-bold" : "text-white/40 hover:text-white"
                }`}
              >
                ۲۵دقیقه
              </button>
              <button
                onClick={() => setPomodoroMode("break")}
                className={`px-1.5 py-0.5 text-[8.5px] font-fa rounded transition-all cursor-pointer ${
                  !isWork ? "bg-[#10B981] text-black font-bold" : "text-white/40 hover:text-white"
                }`}
              >
                ۵دقیقه
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between my-0.5">
            <div className="relative flex-shrink-0">
              <svg width="32" height="32" className="-rotate-90">
                <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  fill="none"
                  stroke={isWork ? "#F59E0B" : "#10B981"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${pomodoroDash * 0.6} 75`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[7.5px] font-mono font-bold text-white">
                {minutes}m
              </div>
            </div>

            <div className="text-right">
              <div className="text-[15px] font-extrabold font-mono text-white tracking-tight">
                {timeFormatted}
              </div>
              <div className="text-[8.5px] font-fa text-white/40">
                {pomodoroActive ? (isWork ? "در حال تمرکز" : "استراحت") : "آماده"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <button
              onClick={togglePomodoro}
              className={`flex-1 py-1 rounded-md text-[9.5px] font-bold font-fa cursor-pointer transition-all ${
                pomodoroActive
                  ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30"
                  : "bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-black font-extrabold"
              }`}
            >
              {pomodoroActive ? "توقف" : "شروع"}
            </button>
            <button
              onClick={resetPomodoro}
              title="بازنشانی تایمر"
              className="w-5 h-5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
          </div>
        </div>

      </div>

      {/* 5. Daily Curriculum Checklist */}
      <section className="linear-card overflow-hidden mb-5">
        <div className="p-3 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isPlanAllDone ? "bg-[#10B981]" : "bg-[#F59E0B]"}`} />
            <span className="text-[12px] font-bold text-white font-fa" dir="rtl">
              {isPlanAllDone ? "فهرست دروس تکمیل‌شده امروز" : "فهرست دروس امروز"}
            </span>
          </div>

          {isPlanAllDone ? (
            <button
              onClick={unlockPlanNow}
              className="text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 font-fa cursor-pointer"
            >
              <span>+ بازگشایی اضطراری</span>
            </button>
          ) : (
            <span className="text-[10.5px] font-mono text-white/40">
              {planCompleted} of {planTotal}
            </span>
          )}
        </div>

        {/* Lessons List */}
        {planLessonIds.length > 0 ? (
          <div className="divide-y divide-white/[0.04]">
            {planLessonIds.map((lessonId) => {
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
                  className={`p-3 flex items-start gap-3 transition-all ${
                    !isGateOpen && !isDone ? "opacity-60 bg-white/[0.01]" : "hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Custom Checkbox */}
                  <button
                    onClick={() => {
                      if (isDone) {
                        toggleLesson(lessonId);
                      } else if (gateStatus.canComplete) {
                        toggleLesson(lessonId);
                      } else {
                        setSelectedLessonId(lessonId);
                      }
                    }}
                    title={
                      isDone
                        ? "علامت‌گذاری به عنوان انجام‌نشده"
                        : gateStatus.canComplete
                        ? "تکمیل و ورود به چرخه SM-2"
                        : gateStatus.unmetReasons[0] || "نیازمند مطالعه و حل پیش‌نیاز"
                    }
                    className={`w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center cursor-pointer transition-all ${
                      isDone
                        ? "bg-[#10B981] border-2 border-[#10B981]"
                        : gateStatus.canComplete
                        ? "border-[1.5px] border-[#F59E0B] bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20"
                        : !gateStatus.isUnlocked
                        ? "border border-white/10 bg-white/[0.02] text-white/30"
                        : "border-[1.5px] border-white/20 hover:border-[#F59E0B]/60 bg-transparent"
                    }`}
                  >
                    {isDone ? (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4.5l3 3L10 1" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : !gateStatus.isUnlocked ? (
                      <span className="text-[9px]">🔒</span>
                    ) : gateStatus.canComplete ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    ) : null}
                  </button>

                  {/* Lesson Information */}
                  <div
                    onClick={() => setSelectedLessonId(lessonId)}
                    className="flex-1 min-w-0 cursor-pointer text-right"
                    dir="rtl"
                  >
                    <div
                      className={`text-[13px] font-bold font-fa leading-snug mb-0.5 ${
                        isDone ? "text-white/40 line-through" : "text-white hover:text-[#F59E0B] transition-colors"
                      }`}
                    >
                      {details.fa}
                    </div>
                    <div className="text-[11px] text-white/40 font-mono leading-normal mb-1.5" dir="ltr">
                      {details.title}
                    </div>

                    {/* Meta Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {!isDone && !gateStatus.canComplete && (
                        <span className="linear-badge bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[9px] font-fa">
                          {!gateStatus.isUnlocked ? "قفل" : gateStatus.isGateLocked ? "مرور عقب‌افتاده" : "پیش‌نیاز"}
                        </span>
                      )}
                      {note?.text && (
                        <span className="linear-badge bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 font-fa text-[9px]">
                          جزوه تحلیلی
                        </span>
                      )}
                      {feynman?.text && (
                        <span className="linear-badge bg-purple-500/10 text-purple-300 border border-purple-500/20 font-fa text-[9px]">
                          سنتز فاینمن
                        </span>
                      )}
                      {diff > 0 && (
                        <span className="linear-badge bg-white/[0.04] text-[#F59E0B] border border-white/[0.08]">
                          {"★".repeat(diff)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Open Lesson Note Button */}
                  <button
                    onClick={() => setSelectedLessonId(lessonId)}
                    aria-label="مشاهده و مطالعه جزوه استاندارد"
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
          <div className="p-6 text-center text-xs text-white/40 font-fa" dir="rtl">
            برنامه امروز آماده شد! روی تب «مسیر» بزنید تا سرفصل‌های جدید را کاوش کنید.
          </div>
        )}
      </section>

      {/* 6. Systems Insight Card */}
      <div className="linear-card p-3 border border-white/[0.05] bg-[#080808]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#F59E0B] text-xs">⚡</span>
          <span className="text-[11px] font-bold text-white/70 font-fa">
            اصل معماری سیستم و یادگیری
          </span>
        </div>
        <p className="text-[11px] text-white/40 font-fa leading-relaxed text-right" dir="rtl">
          «درک عمیق بدون مکانیسم واقعی غیرممکن است. همان‌طور که کش سیستم بدون شناخت سلسله‌مراتب حافظه سخت‌افزار بهینه نمی‌شود، یادگیری نیز بدون تثبیت در خواب عمیق و بازیابی فعال پایدار نخواهد ماند.»
        </p>
      </div>

      {/* 7. Lesson Modal Handler */}
      {selectedLessonId && (
        <LessonModal
          lessonId={selectedLessonId}
          onClose={() => setSelectedLessonId(null)}
          onSelectLesson={(id) => setSelectedLessonId(id)}
        />
      )}
    </div>
  );
};
