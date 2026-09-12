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
    unlockPlanNow,
    toggleLesson,
    getLessonGateStatus,
  } = useNatal();

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

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
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            <span className="text-[10px] font-mono text-white/60">
              Natal Engine
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
            <span className="inline-block px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-white/70">
              {planCompleted}/{planTotal} تکمیل‌شده
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
                  مرور کارت‌های تکرار فاصله‌دار برای تثبیت حافظه الزامی است.
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("review")}
              className="bg-rose-500 hover:bg-rose-400 text-black font-bold font-fa text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition-all flex-shrink-0"
            >
              مرور سریع
            </button>
          </div>
        </div>
      )}

      {/* 3. Hero Feature Spotlight */}
      {heroLessonDetails && (
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-black font-extrabold text-[11px] font-fa cursor-pointer transition-all"
              >
                <span>شروع مطالعه</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

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
              <span className="text-[24px] font-extrabold font-mono text-[#F59E0B] tracking-tight leading-none">
                {budgetInfo.budget}
              </span>
              <span className="text-[11px] font-fa text-white/40">درس باقی‌مانده</span>
            </div>

            <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(10, ((budgetInfo.personalCeiling - budgetInfo.budget) / budgetInfo.personalCeiling) * 100))}%`,
                }}
              />
            </div>
          </div>

          <div className="text-[9.5px] text-white/30 font-fa mt-1 text-right" dir="rtl">
            سقف: {budgetInfo.personalCeiling} درس در روز
          </div>
        </div>

        {/* Bento 2: Progress */}
        <div className="linear-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-fa font-bold text-white/40">
              پیشرفت کل
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          </div>

          <div className="my-1">
            <div className="flex items-baseline gap-1">
              <span className="text-[24px] font-extrabold font-mono text-white tracking-tight leading-none">
                {totalProgressPercent}
              </span>
              <span className="text-xs text-white/40 font-mono">%</span>
            </div>

            <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                style={{ width: `${totalProgressPercent}%` }}
              />
            </div>
          </div>

          <div className="text-[9.5px] text-white/30 font-mono mt-1 flex justify-between items-center">
            <span className="font-fa text-white/40">تکمیل</span>
            <span>{totalCheckedCount} / {totalLessonsCount}</span>
          </div>
        </div>

        {/* Bento 3: Spaced Repetition Gate */}
        <div
          onClick={() => setActiveTab("review")}
          className="linear-card p-3 flex flex-col justify-between cursor-pointer group hover:border-white/20 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-fa font-bold text-white/40">
              مرور هوشمند SM-2
            </span>
            <span className="text-[10px] text-white/40 group-hover:text-white transition-colors">↗</span>
          </div>

          <div className="flex items-center gap-2 my-1">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              dueReviews.length > 0 ? "bg-rose-500/10 text-rose-400 border border-rose-500/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-extrabold font-fa text-white leading-tight">
                {dueReviews.length > 0 ? `${dueReviews.length} کارت آماده` : "به‌روز"}
              </div>
              <div className="text-[9px] text-white/40 font-fa mt-0.5">
                {dueReviews.length > 0 ? "نیازمند مرور" : "حافظه پایدار"}
              </div>
            </div>
          </div>

          <div className="text-[9.5px] font-fa text-[#F59E0B] group-hover:underline text-right mt-1" dir="rtl">
            ورود به مرور ←
          </div>
        </div>

        {/* Bento 4: Pomodoro Focus Timer */}
        <div className="linear-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-fa font-bold text-white/40">
              تمرکز عمیق
            </span>
            <button
              onClick={() => setPomodoroMode(isWork ? "break" : "work")}
              className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/50"
            >
              {isWork ? "Focus" : "Break"}
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 my-1">
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
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="text-[12px] font-bold text-white font-fa" dir="rtl">
              فهرست دروس امروز
            </span>
          </div>

          {isPlanAllDone && (
            <button
              onClick={unlockPlanNow}
              className="text-[10px] font-bold text-black bg-[#F59E0B] hover:bg-[#F59E0B]/90 px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 font-fa cursor-pointer"
            >
              <span>+ درس‌های بیشتر</span>
            </button>
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
                        ? "bg-[#F59E0B] border-2 border-[#F59E0B]"
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
                        isDone ? "text-white/30 line-through" : "text-white hover:text-[#F59E0B] transition-colors"
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
