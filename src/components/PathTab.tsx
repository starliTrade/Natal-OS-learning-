import React, { useState } from "react";
import { useNatal } from "../context/NatalStore";
import { LessonModal } from "./LessonModal";
import { lessonIdToKey, projectIdToKey } from "../engine/sm2";

interface PathTabProps {
  onOpenCurriculumEditor: () => void;
}

const PHASE_COLORS: Record<string, string> = {
  cyan: "#22d3ee",
  indigo: "#818cf8",
  violet: "#a78bfa",
  emerald: "#34d399",
  amber: "#F59E0B",
  rose: "#fb7185",
  sky: "#38bdf8",
  teal: "#2dd4bf",
  orange: "#fb923c",
  lime: "#a3e635",
  fuchsia: "#e879f9",
  pink: "#f472b6",
  purple: "#c084fc",
  red: "#f87171",
  slate: "#94a3b8",
  yellow: "#facc15",
};

export const PathTab: React.FC<PathTabProps> = ({ onOpenCurriculumEditor }) => {
  const {
    phases,
    checked,
    notes,
    feynmanNotes,
    difficulty,
    toggleLesson,
    getLessonGateStatus,
  } = useNatal();

  const [activePhase, setActivePhase] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [expandedMods, setExpandedMods] = useState<Record<string, boolean>>({});

  const toggleMod = (modId: string) => {
    setExpandedMods((prev) => ({
      ...prev,
      [modId]: prev[modId] !== undefined ? !prev[modId] : false, // Default is expanded
    }));
  };

  const getPhaseProgress = (phaseId: string | number) => {
    const phase = phases.find((p) => p.id === phaseId);
    if (!phase) return { total: 0, completed: 0, pct: 0 };
    let total = 0;
    let completed = 0;

    phase.mods.forEach((m) => {
      m.lessons.forEach((_, idx) => {
        total++;
        if (checked.includes(lessonIdToKey(phase.id, m.id, idx))) completed++;
      });
    });

    phase.projs.forEach((_, idx) => {
      total++;
      if (checked.includes(projectIdToKey(phase.id, idx))) completed++;
    });

    return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const currentPhase = phases[activePhase] || phases[0];
  const phaseColor = PHASE_COLORS[currentPhase?.col] || "#F59E0B";
  const { total: phaseTotal, completed: phaseCompleted, pct: phasePct } = currentPhase
    ? getPhaseProgress(currentPhase.id)
    : { total: 0, completed: 0, pct: 0 };

  return (
    <div id="path-tab" className="px-4 pt-5 pb-8 font-sans w-full max-w-[440px] mx-auto text-white">
      {/* Top Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[11px] font-semibold text-white/30 tracking-widest uppercase font-mono mb-1">
            Curriculum
          </div>
          <div className="text-[28px] font-extrabold text-white tracking-tight leading-none">
            Path
          </div>
        </div>

        {/* Architect Curriculum Button */}
        <button
          onClick={onOpenCurriculumEditor}
          title="Architect Curriculum"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-[11px] font-mono rounded-lg border border-white/[0.08] transition-colors cursor-pointer mt-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <span>Curriculum</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <div className="absolute left-3 top-2.5 text-white/30 pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search lessons, kernels, distributed systems..."
          className="w-full bg-[#111111] border border-white/[0.07] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#F59E0B]/50 transition-colors font-sans"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-2.5 text-white/30 hover:text-white text-xs font-mono"
          >
            ✕
          </button>
        )}
      </div>

      {/* Horizontal Phase Selector Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {phases.map((ph, idx) => {
          const { pct } = getPhaseProgress(ph.id);
          const isActive = activePhase === idx;
          const col = PHASE_COLORS[ph.col] || "#F59E0B";

          return (
            <button
              key={ph.id}
              onClick={() => setActivePhase(idx)}
              style={{
                borderColor: isActive ? `${col}60` : "rgba(255,255,255,0.08)",
                background: isActive ? `${col}14` : "transparent",
                color: isActive ? col : "rgba(255,255,255,0.35)",
              }}
              className="flex-shrink-0 px-3 py-1.5 rounded-full border text-[11px] font-bold font-mono transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="opacity-50 text-[10px]">{ph.id}</span>
              <span className="font-sans font-semibold">
                {ph.title.includes(":") ? ph.title.split(":")[1].trim() : ph.title}
              </span>
              {pct === 100 && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Phase Card */}
      {currentPhase && (
        <div className="space-y-3.5">
          {/* Phase Hero Banner */}
          <div className="linear-card p-4 relative overflow-hidden">
            <div
              className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none opacity-10 blur-xl"
              style={{ background: phaseColor }}
            />
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full"
                    style={{ background: `${phaseColor}20`, color: phaseColor }}
                  >
                    Phase {currentPhase.id}
                  </span>
                  <span className="text-[10px] text-white/30 font-mono">
                    {phaseCompleted}/{phaseTotal} lessons
                  </span>
                </div>
                <div className="text-[15px] font-bold text-white leading-tight">
                  {currentPhase.title}
                </div>
                <div className="text-[11px] text-white/40 font-fa mt-1 leading-normal" dir="rtl">
                  {currentPhase.fa}
                </div>
              </div>

              <div className="text-right font-mono flex-shrink-0">
                <span className="text-xl font-extrabold" style={{ color: phaseColor }}>
                  {phasePct}
                </span>
                <span className="text-xs" style={{ color: phaseColor }}>
                  %
                </span>
              </div>
            </div>

            {/* Progress Track */}
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mt-3">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${phasePct}%`, background: phasePct === 100 ? "#22C55E" : phaseColor }}
              />
            </div>
          </div>

          {/* Modules Accordion */}
          <div className="space-y-3">
            {currentPhase.mods.map((mod) => {
              const isCollapsed = expandedMods[mod.id] === true; // default open
              const modLessons = mod.lessons;
              const modCompletedCount = modLessons.filter((_, lIdx) =>
                checked.includes(lessonIdToKey(currentPhase.id, mod.id, lIdx))
              ).length;
              const modPct = modLessons.length > 0 ? Math.round((modCompletedCount / modLessons.length) * 100) : 0;

              // Filter if searching
              const matchingLessons = searchQuery
                ? modLessons
                    .map((l, idx) => ({ l, idx }))
                    .filter(
                      ({ l }) =>
                        l.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        l.fa.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                : modLessons.map((l, idx) => ({ l, idx }));

              if (searchQuery && matchingLessons.length === 0) return null;

              return (
                <div key={mod.id} className="linear-card overflow-hidden">
                  {/* Module Header Toggle */}
                  <div
                    onClick={() => toggleMod(mod.id)}
                    className="p-3.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center justify-between gap-3 select-none"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold font-mono text-white/40">
                          {mod.id}
                        </span>
                        <div className="text-[13px] font-bold text-white truncate">
                          {mod.title}
                        </div>
                      </div>
                      <div className="text-[10px] text-white/35 font-fa truncate" dir="rtl">
                        {mod.fa}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <span className="text-[10px] font-mono text-white/40">
                        {modCompletedCount}/{modLessons.length}
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`text-white/40 transition-transform duration-200 ${
                          isCollapsed ? "-rotate-90" : "rotate-0"
                        }`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {/* Lessons List in Module */}
                  {!isCollapsed && (
                    <div className="divide-y divide-white/[0.04]">
                      {matchingLessons.map(({ l: lesson, idx: lIdx }) => {
                        const lessonId = lessonIdToKey(currentPhase.id, mod.id, lIdx);
                        const isDone = checked.includes(lessonId);
                        const gateStatus = getLessonGateStatus(lessonId);
                        const note = notes[lessonId];
                        const feynman = feynmanNotes[lessonId];
                        const diff = difficulty[lessonId] || 0;

                        return (
                          <div
                            key={lessonId}
                            className="p-3.5 flex items-start gap-3 hover:bg-white/[0.015] transition-colors group"
                          >
                            {/* Checkbox / Gate Indicator */}
                            <button
                              onClick={() => {
                                if (isDone) {
                                  toggleLesson(lessonId);
                                } else if (gateStatus.canComplete) {
                                  toggleLesson(lessonId);
                                } else {
                                  // Open modal to show requirements
                                  setSelectedLessonId(lessonId);
                                }
                              }}
                              title={
                                isDone
                                  ? "Mark incomplete"
                                  : gateStatus.canComplete
                                  ? "Click to complete and register into SM-2 spaced repetition"
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

                            {/* Details */}
                            <div
                              onClick={() => setSelectedLessonId(lessonId)}
                              className="flex-1 min-w-0 cursor-pointer"
                            >
                              <div
                                className={`text-[13px] font-medium leading-snug mb-0.5 ${
                                  isDone ? "text-white/30 line-through" : "text-white group-hover:text-[#F59E0B] transition-colors"
                                }`}
                              >
                                {lesson.en}
                              </div>
                              <div className="text-[11px] text-white/35 font-fa leading-normal mb-1.5" dir="rtl">
                                {lesson.fa}
                              </div>

                              {/* Badges & Gate Status */}
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

                            {/* Note & Study button */}
                            <button
                              onClick={() => setSelectedLessonId(lessonId)}
                              aria-label="Study and open note"
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
                  )}
                </div>
              );
            })}

            {/* Projects for this phase */}
            {currentPhase.projs && currentPhase.projs.length > 0 && (
              <div className="linear-card p-3.5 border-dashed border-white/[0.12]">
                <div className="text-[11px] font-bold text-white/40 uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                  <span>Capstone Engineering Project</span>
                </div>
                {currentPhase.projs.map((proj, pIdx) => {
                  const projKey = projectIdToKey(currentPhase.id, pIdx);
                  const isDone = checked.includes(projKey);
                  const gateStatus = getLessonGateStatus(projKey);
                  return (
                    <div key={proj.id} className="flex items-start gap-3 pt-1">
                      <button
                        onClick={() => {
                          if (isDone) {
                            toggleLesson(projKey);
                          } else if (gateStatus.canComplete) {
                            toggleLesson(projKey);
                          }
                        }}
                        title={
                          isDone
                            ? "Mark project incomplete"
                            : gateStatus.canComplete
                            ? "Click to complete Capstone Project"
                            : gateStatus.unmetReasons[0] || "Prerequisites locked"
                        }
                        className={`w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center cursor-pointer transition-all ${
                          isDone
                            ? "bg-[#10B981] border-2 border-[#10B981]"
                            : !gateStatus.isUnlocked
                            ? "border border-white/10 bg-white/[0.02] text-white/30"
                            : "border-[1.5px] border-white/20 hover:border-[#10B981]/60 bg-transparent"
                        }`}
                      >
                        {isDone ? (
                          <svg width="10" height="8" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4.5l3 3L10 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : !gateStatus.isUnlocked ? (
                          <span className="text-[9px]">🔒</span>
                        ) : null}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`text-[13px] font-bold ${isDone ? "text-white/40 line-through" : "text-white"}`}>{proj.title}</div>
                          {!isDone && !gateStatus.isUnlocked && (
                            <span className="linear-badge bg-white/[0.04] text-white/40 border border-white/[0.06] text-[9px]">
                              Locked 🔒
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-white/40 font-fa leading-normal mt-0.5" dir="rtl">
                          {proj.fa}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {selectedLessonId && (
        <LessonModal lessonId={selectedLessonId} onClose={() => setSelectedLessonId(null)} />
      )}
    </div>
  );
};
