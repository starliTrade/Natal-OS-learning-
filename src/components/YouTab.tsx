import React, { useState } from "react";
import { useNatal } from "../context/NatalStore";

interface YouTabProps {
  onOpenCurriculumEditor: () => void;
}

export const YouTab: React.FC<YouTabProps> = ({ onOpenCurriculumEditor }) => {
  const {
    completedLessonsCount,
    totalLessonsCount,
    reviewData,
    exportData,
    importData,
    resetAllData,
    resetToDefaultCurriculum,
    budgetInfo,
  } = useNatal();

  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetCurriculumConfirm, setShowResetCurriculumConfirm] = useState(false);

  const handleExport = () => {
    const json = exportData();
    navigator.clipboard.writeText(json);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleDownloadFile = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `natal-learning-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const success = importData(importText);
    if (success) {
      setShowImport(false);
      setImportText("");
    }
  };

  return (
    <div id="you-tab" className="px-4 pt-4 pb-12 font-sans w-full max-w-[460px] mx-auto text-slate-100 selection:bg-[#00F5A0] selection:text-black">
      {/* Top Header */}
      <div className="mb-4">
        <div className="text-[10px] font-bold text-[#00F5A0] tracking-widest uppercase font-mono mb-0.5">
          ENGINEER PROFILE & SETTINGS
        </div>
        <div className="text-[26px] font-extrabold text-white tracking-tight leading-none font-fa" dir="rtl">
          پروفایل و تنظیمات
        </div>
      </div>

      {/* Profile Card */}
      <div className="linear-card p-4 mb-3.5 space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] flex items-center justify-center font-bold text-base font-mono">
            N
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-white leading-tight">
              Systems & AI Infrastructure
            </div>
            <div className="text-[10px] text-white/40 font-mono mt-0.5">
              Natal OS · Professional Edition
            </div>
          </div>
        </div>

        {/* 3 Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.05] text-center">
          <div>
            <div className="text-[9px] font-mono text-white/30 uppercase">Completed</div>
            <div className="text-sm font-bold font-mono text-[#22C55E] mt-0.5">
              {completedLessonsCount}/{totalLessonsCount}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-white/30 uppercase">SM-2 Cards</div>
            <div className="text-sm font-bold font-mono text-[#06B6D4] mt-0.5">
              {Object.keys(reviewData).length}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-white/30 uppercase">Daily Goal</div>
            <div className="text-sm font-bold font-mono text-[#F59E0B] mt-0.5">
              {budgetInfo.personalCeiling}/day
            </div>
          </div>
        </div>
      </div>

      {/* Daily Cognitive Capacity & Pace */}
      <div className="linear-card p-4 mb-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-white">Daily Cognitive Pacing</div>
          <div className="text-[10px] font-mono text-[#F59E0B]">
            {budgetInfo.personalCeiling} lessons / day
          </div>
        </div>
        <div className="text-[11px] text-white/40 font-fa leading-normal" dir="rtl">
          سرعت یادگیری به صورت خودکار بر اساس بار مرور الگوریتم SM-2 و جلوگیری از خستگی شناختی تنظیم می‌شود.
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono">
          <div className="p-2 bg-white/[0.02] border border-white/[0.04] rounded-lg">
            <span className="text-white/40 block">New Lessons Budget</span>
            <span className="text-white font-bold text-xs">{budgetInfo.budget} allowed today</span>
          </div>
          <div className="p-2 bg-white/[0.02] border border-white/[0.04] rounded-lg">
            <span className="text-white/40 block">Review Load</span>
            <span className="text-white font-bold text-xs">{budgetInfo.reviewLoad.toFixed(1)} units</span>
          </div>
        </div>
      </div>

      {/* Curriculum Architect Trigger */}
      <div className="linear-card p-4 mb-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span>Curriculum Architect</span>
          </div>
          <button
            onClick={onOpenCurriculumEditor}
            className="px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-[10px] font-mono text-white transition-colors cursor-pointer"
          >
            Customize
          </button>
        </div>
        <div className="text-[11px] text-white/40 font-fa leading-normal" dir="rtl">
          ویرایش سرفصل‌ها، افزودن موضوعات سفارشی، یا بازآرایی فازها
        </div>
      </div>

      {/* PWA & Mobile App Experience */}
      <div className="linear-card p-4 mb-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00F5A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <span>Mobile App & PWA Status</span>
          </div>
          <span className="text-[10px] font-mono text-[#00F5A0] bg-[#00F5A0]/10 px-2 py-0.5 rounded-full border border-[#00F5A0]/20">
            Standalone Ready
          </span>
        </div>
        <div className="text-[11px] text-white/50 font-fa leading-normal" dir="rtl">
          برنامه از قابلیت <strong className="text-white font-mono">PWA</strong> پشتیبانی می‌کند. در صورت افزودن به صفحه اصلی (Add to Home Screen)، دقیقاً مانند یک اپلیکیشن بومی بدون نوار آدرس و تمام‌صفحه باز خواهد شد.
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="linear-card p-4 mb-3.5 space-y-3">
        <div className="text-xs font-bold text-white">Data Portability</div>
        <div className="text-[11px] text-white/40 font-fa leading-normal" dir="rtl">
          پشتیبان‌گیری کامل از یادداشت‌ها، وضعیت تیک‌ها و سوابق مرور SM-2
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExport}
            className="py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-white/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-mono"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>{copySuccess ? "Copied!" : "Copy JSON"}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-white/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-mono"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export File</span>
          </button>
        </div>

        <div>
          <button
            onClick={() => setShowImport(!showImport)}
            className="text-[11px] text-white/40 hover:text-white/70 underline underline-offset-2 transition-colors cursor-pointer"
          >
            {showImport ? "Hide Import" : "Import Backup JSON"}
          </button>
        </div>

        {showImport && (
          <div className="space-y-2 pt-2 border-t border-white/[0.04]">
            <textarea
              rows={3}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste exported backup JSON here..."
              className="w-full bg-[#080808] border border-white/[0.08] rounded-lg p-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-[#F59E0B]"
            />
            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="w-full py-2 rounded-lg bg-[#F59E0B] disabled:opacity-40 text-black font-bold text-xs transition-colors cursor-pointer font-sans"
            >
              Restore Data
            </button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="linear-card p-4 space-y-3 border-[#EF4444]/20">
        <div className="text-xs font-bold text-[#EF4444]">Danger Zone</div>

        {/* Reset to Default Curriculum */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-white/60">Reset Curriculum to Default</div>
          <button
            onClick={() => setShowResetCurriculumConfirm(true)}
            className="px-2.5 py-1 rounded-md bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] text-[10px] font-mono border border-[#EF4444]/30 cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Reset All Data */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
          <div className="text-[11px] text-white/60">Erase All Study History</div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-2.5 py-1 rounded-md bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] text-[10px] font-mono border border-[#EF4444]/30 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Reset Curriculum Confirmation Modal */}
      {showResetCurriculumConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="linear-card p-5 max-w-sm w-full space-y-3 bg-[#111111]">
            <div className="text-sm font-bold text-white">Reset Curriculum?</div>
            <div className="text-xs text-white/50 leading-relaxed font-fa" dir="rtl">
              سرفصل‌ها به حالت استاندارد مهندسی سیستم‌ها و زیرساخت هوش مصنوعی بازنشانی خواهند شد.
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  resetToDefaultCurriculum();
                  setShowResetCurriculumConfirm(false);
                }}
                className="flex-1 py-2 rounded-lg bg-[#EF4444] text-white font-bold text-xs cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetCurriculumConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-white/[0.05] text-white/70 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="linear-card p-5 max-w-sm w-full space-y-3 bg-[#111111]">
            <div className="text-sm font-bold text-[#EF4444]">Erase All Progress?</div>
            <div className="text-xs text-white/50 leading-relaxed font-fa" dir="rtl">
              تمام تیک‌ها، یادداشت‌ها و کارت‌های حافظه پاک خواهند شد. این عملیات غیرقابل بازگشت است.
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2 rounded-lg bg-[#EF4444] text-white font-bold text-xs cursor-pointer"
              >
                Permanently Delete
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-white/[0.05] text-white/70 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
