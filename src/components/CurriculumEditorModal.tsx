import React, { useState } from "react";
import { useNatal } from "../context/NatalStore";
import { DEFAULT_CURRICULUM } from "../data/defaultCurriculum";
import { Phase } from "../types";

interface CurriculumEditorModalProps {
  onClose: () => void;
}

export const CurriculumEditorModal: React.FC<CurriculumEditorModalProps> = ({ onClose }) => {
  const { phases, setPhases } = useNatal();
  const [editedPhases, setEditedPhases] = useState<Phase[]>(() => JSON.parse(JSON.stringify(phases)));
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  const currentPhase = editedPhases[activePhaseIndex] || editedPhases[0];

  const handleSave = () => {
    setPhases(editedPhases);
    onClose();
  };

  const handleResetToDefault = () => {
    if (confirm("Reset curriculum to standard 8-phase AI Systems & Infrastructure roadmaps?")) {
      setEditedPhases(JSON.parse(JSON.stringify(DEFAULT_CURRICULUM)));
    }
  };

  const handleAddPhase = () => {
    const newId = editedPhases.length;
    const newPhase: Phase = {
      id: newId,
      title: `Phase ${newId}: New Phase`,
      fa: `فاز ${newId}: عنوان فاز جدید`,
      dur: "4 Weeks",
      col: "cyan",
      mods: [
        {
          id: `${newId}.1`,
          title: "Introduction",
          fa: "مقدمه و مبانی",
          lessons: [{ en: "Core Concept", fa: "مفهوم پایه و کاربرد" }],
        },
      ],
      projs: [],
    };
    setEditedPhases([...editedPhases, newPhase]);
    setActivePhaseIndex(editedPhases.length);
  };

  const handleDeletePhase = (idx: number) => {
    if (editedPhases.length <= 1) return;
    if (confirm("Delete this entire phase and its lessons?")) {
      const filtered = editedPhases.filter((_, i) => i !== idx);
      setEditedPhases(filtered);
      setActivePhaseIndex(Math.max(0, activePhaseIndex - 1));
    }
  };

  const handleAddModule = () => {
    if (!currentPhase) return;
    const modCount = currentPhase.mods.length + 1;
    const newMod = {
      id: `${currentPhase.id}.${modCount}`,
      title: `Module ${modCount}`,
      fa: `ماژول ${modCount}: مبحث جدید`,
      lessons: [{ en: "New Topic", fa: "درس جدید" }],
    };
    const updated = [...editedPhases];
    updated[activePhaseIndex].mods.push(newMod);
    setEditedPhases(updated);
  };

  const handleAddLesson = (modIdx: number) => {
    const updated = [...editedPhases];
    updated[activePhaseIndex].mods[modIdx].lessons.push({
      en: "New Lesson Title (English)",
      fa: "عنوان درس جدید (فارسی)",
    });
    setEditedPhases(updated);
  };

  const handleDeleteLesson = (modIdx: number, lessonIdx: number) => {
    const updated = [...editedPhases];
    updated[activePhaseIndex].mods[modIdx].lessons = updated[activePhaseIndex].mods[modIdx].lessons.filter(
      (_, i) => i !== lessonIdx
    );
    setEditedPhases(updated);
  };

  return (
    <div
      id="curriculum-editor-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 text-white font-sans animate-in fade-in duration-200"
    >
      <div className="bg-[#111111] border border-white/[0.08] w-full max-w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl h-[94vh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

        {/* Header */}
        <div className="px-3.5 sm:px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-black/40 flex-shrink-0">
          <div>
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
              Curriculum Architect
            </div>
            <h2 className="text-sm font-bold text-white leading-tight">
              Customize Syllabus & Topics
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetToDefault}
              className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[10px] font-mono text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#F59E0B]/90 active:bg-[#F59E0B]/80 text-black font-bold text-xs font-mono transition-colors cursor-pointer shadow-sm"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Horizontal Phase Selector */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06] bg-black/20 overflow-x-auto scrollbar-none">
          {editedPhases.map((phase, idx) => (
            <button
              key={phase.id}
              onClick={() => setActivePhaseIndex(idx)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-colors cursor-pointer ${
                activePhaseIndex === idx
                  ? "bg-[#F59E0B] text-black font-bold shadow-sm"
                  : "bg-white/[0.03] hover:bg-white/[0.06] text-white/50 border border-white/[0.05]"
              }`}
            >
              P{phase.id}: {phase.title.split(":")[0]}
            </button>
          ))}
          <button
            onClick={handleAddPhase}
            className="px-2.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-[#F59E0B] border border-white/[0.06] transition-colors cursor-pointer whitespace-nowrap"
          >
            + Phase
          </button>
        </div>

        {/* Active Phase Editor Body */}
        {currentPhase && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Phase Meta Fields */}
            <div className="linear-card p-3.5 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                    Phase Title (EN)
                  </label>
                  <input
                    type="text"
                    value={currentPhase.title}
                    onChange={(e) => {
                      const updated = [...editedPhases];
                      updated[activePhaseIndex].title = e.target.value;
                      setEditedPhases(updated);
                    }}
                    className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-fa text-white/40 mb-1" dir="rtl">
                    عنوان فارسی فاز
                  </label>
                  <input
                    type="text"
                    value={currentPhase.fa}
                    onChange={(e) => {
                      const updated = [...editedPhases];
                      updated[activePhaseIndex].fa = e.target.value;
                      setEditedPhases(updated);
                    }}
                    className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white font-fa text-xs focus:outline-none focus:border-[#F59E0B]"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-white/40">Duration:</span>
                  <input
                    type="text"
                    value={currentPhase.dur}
                    onChange={(e) => {
                      const updated = [...editedPhases];
                      updated[activePhaseIndex].dur = e.target.value;
                      setEditedPhases(updated);
                    }}
                    className="bg-black/50 border border-white/[0.08] rounded px-2 py-0.5 text-white font-mono text-xs w-24 focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>
                <button
                  onClick={() => handleDeletePhase(activePhaseIndex)}
                  className="px-2 py-1 rounded bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444] text-[10px] font-mono cursor-pointer"
                >
                  Delete Phase
                </button>
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white">Modules & Lessons</div>
                <button
                  onClick={handleAddModule}
                  className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[10px] font-mono text-[#F59E0B] border border-white/[0.06] cursor-pointer"
                >
                  + Add Module
                </button>
              </div>

              {currentPhase.mods.map((mod, mIdx) => (
                <div key={mod.id || mIdx} className="linear-card p-3 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) => {
                        const updated = [...editedPhases];
                        updated[activePhaseIndex].mods[mIdx].title = e.target.value;
                        setEditedPhases(updated);
                      }}
                      placeholder="Module Title (EN)"
                      className="bg-black/50 border border-white/[0.08] rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#F59E0B]"
                    />
                    <input
                      type="text"
                      value={mod.fa}
                      onChange={(e) => {
                        const updated = [...editedPhases];
                        updated[activePhaseIndex].mods[mIdx].fa = e.target.value;
                        setEditedPhases(updated);
                      }}
                      placeholder="عنوان ماژول (FA)"
                      className="bg-black/50 border border-white/[0.08] rounded px-2 py-1 text-white font-fa text-xs focus:outline-none focus:border-[#F59E0B]"
                      dir="rtl"
                    />
                  </div>

                  {/* Lessons */}
                  <div className="space-y-1.5 pl-2 border-l border-white/[0.08]">
                    {mod.lessons.map((lesson, lIdx) => (
                      <div key={lIdx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={lesson.en}
                          onChange={(e) => {
                            const updated = [...editedPhases];
                            updated[activePhaseIndex].mods[mIdx].lessons[lIdx].en = e.target.value;
                            setEditedPhases(updated);
                          }}
                          placeholder="Lesson (EN)"
                          className="flex-1 bg-black/40 border border-white/[0.06] rounded px-2 py-1 text-white font-mono text-[11px] focus:outline-none focus:border-[#F59E0B]"
                        />
                        <input
                          type="text"
                          value={lesson.fa}
                          onChange={(e) => {
                            const updated = [...editedPhases];
                            updated[activePhaseIndex].mods[mIdx].lessons[lIdx].fa = e.target.value;
                            setEditedPhases(updated);
                          }}
                          placeholder="درس (FA)"
                          className="flex-1 bg-black/40 border border-white/[0.06] rounded px-2 py-1 text-white font-fa text-[11px] focus:outline-none focus:border-[#F59E0B]"
                          dir="rtl"
                        />
                        <button
                          onClick={() => handleDeleteLesson(mIdx, lIdx)}
                          className="p-1 text-white/30 hover:text-[#EF4444] transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleAddLesson(mIdx)}
                      className="text-[10px] font-mono text-white/50 hover:text-white/80 cursor-pointer"
                    >
                      + Add Lesson
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
