import React from "react";
import { useNatal } from "../context/NatalStore";
import {
  calculateWeightedPace,
  getTodayDateString,
  addDaysToDate,
  isWeakCard,
  lessonIdToKey,
  projectIdToKey,
} from "../engine/sm2";

export const StatsTab: React.FC = () => {
  const {
    phases,
    checked,
    checkDates,
    reviewData,
    totalLessonsCount,
    completedLessonsCount,
  } = useNatal();

  const pace = calculateWeightedPace(checkDates);
  const remaining = Math.max(0, totalLessonsCount - completedLessonsCount);
  const etaDays = pace > 0 ? Math.ceil(remaining / pace) : 0;

  // Card retention health
  const totalCards = Object.keys(reviewData).length;
  const matureCards = Object.values(reviewData).filter((c) => c.interval >= 21).length;
  const weakCards = Object.values(reviewData).filter((c) => isWeakCard(c)).length;
  const retentionPct = totalCards > 0 ? Math.round(((totalCards - weakCards) / totalCards) * 100) : 100;

  // 7-day activity data
  const today = getTodayDateString();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = addDaysToDate(today, -(6 - i));
    const count = Object.values(checkDates).filter((val) => val === d).length;
    const parts = d.split("-");
    const dayLabel = new Date(d).toLocaleDateString("en-US", { weekday: "narrow" });
    return { date: d, label: dayLabel, count };
  });

  const maxDailyCount = Math.max(3, ...last7Days.map((d) => d.count));
  const completionPct = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  return (
    <div id="stats-tab" className="px-4 pt-4 pb-12 font-sans w-full max-w-[460px] mx-auto text-slate-100 selection:bg-[#00F5A0] selection:text-black">
      {/* Top Header */}
      <div className="mb-4">
        <div className="text-[10px] font-bold text-[#00F5A0] tracking-widest uppercase font-mono mb-0.5">
          ENGINEERING METRICS & VELOCITY
        </div>
        <div className="text-[26px] font-extrabold text-white tracking-tight leading-none font-fa" dir="rtl">
          شاخص‌ها و آمار یادگیری
        </div>
      </div>

      {/* Main Hero Progress Card */}
      <div className="linear-card p-4 mb-3.5 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
            Total Completion
          </span>
          <span className="text-2xl font-extrabold font-mono text-[#F59E0B]">
            {completionPct}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        {/* 4-Item Grid */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/[0.05] text-center">
          <div>
            <div className="text-[9px] font-mono text-white/30 uppercase">Done</div>
            <div className="text-sm font-bold font-mono text-white mt-0.5">{completedLessonsCount}</div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-white/30 uppercase">Left</div>
            <div className="text-sm font-bold font-mono text-white mt-0.5">{remaining}</div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-white/30 uppercase">Pace</div>
            <div className="text-sm font-bold font-mono text-[#F59E0B] mt-0.5">
              {pace > 0 ? pace.toFixed(1) : "0"}/d
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-white/30 uppercase">Est. ETA</div>
            <div className="text-sm font-bold font-mono text-[#06B6D4] mt-0.5">
              {etaDays > 0 ? `${etaDays}d` : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Velocity Chart */}
      <div className="linear-card p-4 mb-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
            7-Day Activity
          </span>
          <span className="text-[10px] font-mono text-white/30">
            {last7Days.reduce((acc, d) => acc + d.count, 0)} completed this week
          </span>
        </div>

        <div className="flex items-end justify-between gap-2 h-20 pt-4">
          {last7Days.map((d) => {
            const heightPct = Math.max(8, Math.round((d.count / maxDailyCount) * 100));
            const isToday = d.date === today;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="text-[9px] font-mono text-white/30">{d.count > 0 ? d.count : ""}</div>
                <div className="w-full bg-white/[0.06] rounded-md h-full max-h-[50px] flex items-end p-0.5">
                  <div
                    className={`w-full rounded transition-all duration-300 ${
                      isToday ? "bg-[#F59E0B]" : d.count > 0 ? "bg-white/40" : "bg-transparent"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <div className="text-[9px] font-mono text-white/30">{d.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spaced Repetition Health */}
      <div className="linear-card p-4 mb-3.5 space-y-3">
        <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
          Memory Retention (SM-2)
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl">
            <div className="text-[9px] font-mono text-white/30 uppercase">Tracked</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">{totalCards}</div>
          </div>
          <div className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl">
            <div className="text-[9px] font-mono text-white/30 uppercase">Mature (&gt;21d)</div>
            <div className="text-base font-bold font-mono text-[#22C55E] mt-0.5">{matureCards}</div>
          </div>
          <div className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl">
            <div className="text-[9px] font-mono text-white/30 uppercase">Retention</div>
            <div className="text-base font-bold font-mono text-[#8B5CF6] mt-0.5">{retentionPct}%</div>
          </div>
        </div>
      </div>

      {/* Phase Breakdown Progress */}
      <div className="linear-card p-4 space-y-3">
        <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">
          Phase Breakdown
        </div>

        <div className="space-y-2.5">
          {phases.map((ph) => {
            let total = 0;
            let done = 0;
            ph.mods.forEach((m) => {
              m.lessons.forEach((_, idx) => {
                total++;
                if (checked.includes(lessonIdToKey(ph.id, m.id, idx))) done++;
              });
            });
            ph.projs.forEach((_, idx) => {
              total++;
              if (checked.includes(projectIdToKey(ph.id, idx))) done++;
            });

            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div key={ph.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-mono text-white/30 text-[10px]">{ph.id}</span>
                    <span className="text-white font-medium truncate text-[11px]">{ph.title}</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/40 flex-shrink-0">
                    {done}/{total}
                  </span>
                </div>
                <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F59E0B] rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, background: pct === 100 ? "#22C55E" : undefined }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
