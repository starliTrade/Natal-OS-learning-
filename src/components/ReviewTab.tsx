import React, { useState, useEffect, useCallback } from "react";
import { useNatal } from "../context/NatalStore";

export const ReviewTab: React.FC = () => {
  const {
    dueReviews,
    submitReviewGrade,
    reviewData,
    notes,
    feynmanNotes,
    setActiveTab,
  } = useNatal();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [initialTotal] = useState(dueReviews.length);

  // Review card view states: "note" | "loading" | "question" | "answer" | "grading"
  const [cardStage, setCardStage] = useState<"note" | "loading" | "question" | "answer">("note");
  const [activeQuestion, setActiveQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ score: number; feedback: string; modelAnswer?: string } | null>(null);

  const currentItem = dueReviews[currentIndex];
  const cardData = currentItem ? reviewData[currentItem.id] : null;

  const userNote = currentItem ? notes[currentItem.id]?.text || "" : "";
  const feynman = currentItem ? feynmanNotes[currentItem.id]?.text || "" : "";

  // Reset stage when switching item
  useEffect(() => {
    if (!currentItem) return;
    setCardStage(userNote || feynman ? "note" : "loading");
    setActiveQuestion("");
    setUserAnswer("");
    setAiFeedback(null);

    if (!userNote && !feynman) {
      loadQuestion();
    }
  }, [currentItem?.id]);

  const loadQuestion = useCallback(async () => {
    if (!currentItem) return;
    setCardStage("loading");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "question",
          lessonTitle: currentItem.title,
          lessonFa: currentItem.fa,
          phase: currentItem.phase,
          module: currentItem.module,
          userNote,
          feynmanNote: feynman,
        }),
      });
      const data = await res.json();
      setActiveQuestion(data.question || `What are the core trade-offs and mechanics of ${currentItem.title}?`);
      setCardStage("question");
    } catch {
      setActiveQuestion(`Explain the underlying mechanics and architectural design of: ${currentItem.title}`);
      setCardStage("question");
    }
  }, [currentItem, userNote, feynman]);

  const handleGradeAnswer = async () => {
    if (!currentItem || !userAnswer.trim()) return;
    setIsGrading(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade",
          lessonTitle: currentItem.title,
          question: activeQuestion,
          userAnswer,
          userNote,
          feynmanNote: feynman,
        }),
      });
      const data = await res.json();
      setAiFeedback(data);
      setCardStage("answer");
    } catch {
      setCardStage("answer");
    } finally {
      setIsGrading(false);
    }
  };

  const handleRating = (grade: 1 | 2 | 3 | 4) => {
    if (!currentItem) return;
    submitReviewGrade(currentItem.id, grade);
    setReviewedCount((prev) => prev + 1);
    // Stay on index or clamp
    setCurrentIndex((prev) => Math.min(prev, Math.max(0, dueReviews.length - 2)));
  };

  // If no reviews due
  if (dueReviews.length === 0) {
    return (
      <div id="review-empty-state" className="px-6 py-20 text-center font-sans max-w-[440px] mx-auto text-white">
        <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/25 flex items-center justify-center mx-auto mb-5 text-[#22C55E]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div className="text-xl font-extrabold text-white tracking-tight mb-1.5">
          All caught up
        </div>
        <div className="text-xs text-white/40 leading-relaxed mb-6 font-fa" dir="rtl">
          تمام کارت‌های زمان‌بندی‌شده مرور شده‌اند. هیچ مروری معوق نیست.
        </div>
        {reviewedCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-full text-xs text-[#22C55E] font-mono">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{reviewedCount} cards completed today</span>
          </div>
        )}
        <div className="mt-8">
          <button
            onClick={() => setActiveTab("path")}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Explore Next Lessons →
          </button>
        </div>
      </div>
    );
  }

  const efFormatted = cardData ? cardData.ef.toFixed(1) : "2.5";
  const reps = cardData?.reps || 0;
  const overdueDays = currentItem.overdueDays || 0;
  const isLeech = Boolean(cardData?.isLeech || (cardData?.lapses || 0) >= 3);

  return (
    <div id="review-tab" className="px-4 pt-5 pb-8 font-sans w-full max-w-[440px] mx-auto text-white">
      {/* Top Header */}
      <div className="mb-4">
        <div className="text-[11px] font-semibold text-white/30 tracking-widest uppercase font-mono mb-1">
          Spaced Repetition
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[28px] font-extrabold text-white tracking-tight leading-none">
            Review
          </div>
          <div className="text-[10px] font-mono font-bold px-2.5 py-1 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/25 rounded-full">
            {dueReviews.length} due
          </div>
        </div>
      </div>

      {/* Progress Track */}
      {initialTotal > 0 && (
        <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#F59E0B] rounded-full transition-all duration-300"
            style={{ width: `${Math.round((reviewedCount / initialTotal) * 100)}%` }}
          />
        </div>
      )}

      {/* Card Shell */}
      {currentItem && (
        <div className="space-y-3.5">
          {/* Card Header & Metadata */}
          <div className="linear-card p-4">
            <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-white/30 mb-2">
              <span>
                Card {currentIndex + 1} of {dueReviews.length}
              </span>
              <div className="flex items-center gap-2">
                <span>EF: {efFormatted}</span>
                <span>•</span>
                <span>Reps: {reps}</span>
                {overdueDays > 0 && (
                  <span className="text-[#EF4444] font-bold">+{overdueDays}d overdue</span>
                )}
              </div>
            </div>

            <div className="text-[16px] font-bold text-white leading-snug">
              {currentItem.title}
            </div>
            <div className="text-[12px] text-white/40 font-fa leading-normal mt-1" dir="rtl">
              {currentItem.fa}
            </div>
            <div className="text-[9px] font-mono text-white/25 mt-2 uppercase">
              {currentItem.phase} • {currentItem.module}
            </div>

            {isLeech && (
              <div className="mt-3 p-2 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-lg flex items-center gap-2 text-[11px] text-[#EF4444] font-fa" dir="rtl">
                <span className="font-mono text-xs">⚠️</span>
                <span>کارت زالو (Leech Alert): این مفهوم {cardData?.lapses || 3} بار لغزش داشته است. بازخوانی تمثیل فاینمن و بازسازی کد توصیه می‌شود.</span>
              </div>
            )}
          </div>

          {/* STAGE 1: SHOW USER NOTES */}
          {cardStage === "note" && (
            <div className="linear-card p-4 space-y-3">
              {userNote && (
                <div>
                  <div className="text-[9px] font-mono text-[#F59E0B] uppercase tracking-wider mb-1.5">
                    Your Personal Note
                  </div>
                  <div className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap bg-black/40 p-3 rounded-lg border border-white/[0.04]">
                    {userNote}
                  </div>
                </div>
              )}

              {feynman && (
                <div>
                  <div className="text-[9px] font-mono text-[#8B5CF6] uppercase tracking-wider mb-1.5">
                    Feynman Mental Model
                  </div>
                  <div className="text-xs text-white/80 leading-relaxed font-fa whitespace-pre-wrap bg-black/40 p-3 rounded-lg border border-white/[0.04]" dir="rtl">
                    {feynman}
                  </div>
                </div>
              )}

              <button
                onClick={loadQuestion}
                className="w-full py-3 rounded-xl bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-black font-bold text-xs font-sans tracking-tight transition-all cursor-pointer shadow-md mt-2"
              >
                I've Reviewed — Test Active Recall
              </button>
            </div>
          )}

          {/* STAGE 2: LOADING QUESTION */}
          {cardStage === "loading" && (
            <div className="linear-card p-8 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-xs text-white/40 font-mono">
                Formulating active recall scenario...
              </div>
            </div>
          )}

          {/* STAGE 3: ACTIVE RECALL QUESTION */}
          {(cardStage === "question" || cardStage === "answer") && (
            <div className="linear-card p-4 space-y-3.5">
              <div className="text-[9px] font-mono text-[#06B6D4] uppercase tracking-wider">
                Active Retrieval Prompt
              </div>
              <div className="text-sm font-medium text-white leading-relaxed bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.06]">
                {activeQuestion}
              </div>

              {/* User Answer Field */}
              {cardStage === "question" && (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your explanation or thought process here..."
                    className="w-full bg-[#080808] border border-white/[0.08] rounded-xl p-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#06B6D4]/60 resize-none font-sans"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleGradeAnswer}
                      disabled={isGrading || !userAnswer.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-[#06B6D4] hover:bg-[#06B6D4]/90 disabled:opacity-40 text-black font-bold text-xs transition-colors cursor-pointer"
                    >
                      {isGrading ? "Analyzing response..." : "Evaluate with AI"}
                    </button>
                    <button
                      onClick={() => setCardStage("answer")}
                      className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.07] text-white/50 hover:text-white text-xs font-medium cursor-pointer"
                    >
                      Skip to Grade
                    </button>
                  </div>
                </div>
              )}

              {/* AI Feedback if graded */}
              {cardStage === "answer" && aiFeedback && (
                <div className="p-3 bg-black/50 border border-white/[0.06] rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#22C55E] uppercase font-bold">
                      Score: {aiFeedback.score}/10
                    </span>
                  </div>
                  <div className="text-white/80 leading-relaxed font-fa text-[11px]" dir="rtl">
                    {aiFeedback.feedback}
                  </div>
                </div>
              )}

              {/* STAGE 4: SM-2 RATING BUTTONS */}
              {cardStage === "answer" && (
                <div className="pt-2 border-t border-white/[0.05] space-y-2">
                  <div className="text-[10px] text-white/30 font-mono text-center mb-1">
                    Rate recall difficulty (SM-2):
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {/* Again */}
                    <button
                      onClick={() => handleRating(1)}
                      className="p-2 rounded-xl bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444] text-center cursor-pointer transition-colors"
                    >
                      <div className="text-xs font-bold font-sans">Again</div>
                      <div className="text-[9px] font-mono opacity-60">&lt; 1d</div>
                    </button>
                    {/* Hard */}
                    <button
                      onClick={() => handleRating(2)}
                      className="p-2 rounded-xl bg-[#fb923c]/10 hover:bg-[#fb923c]/20 border border-[#fb923c]/30 text-[#fb923c] text-center cursor-pointer transition-colors"
                    >
                      <div className="text-xs font-bold font-sans">Hard</div>
                      <div className="text-[9px] font-mono opacity-60">2d</div>
                    </button>
                    {/* Good */}
                    <button
                      onClick={() => handleRating(3)}
                      className="p-2 rounded-xl bg-[#22C55E]/10 hover:bg-[#22C55E]/20 border border-[#22C55E]/30 text-[#22C55E] text-center cursor-pointer transition-colors"
                    >
                      <div className="text-xs font-bold font-sans">Good</div>
                      <div className="text-[9px] font-mono opacity-60">4d</div>
                    </button>
                    {/* Easy */}
                    <button
                      onClick={() => handleRating(4)}
                      className="p-2 rounded-xl bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30 text-[#38bdf8] text-center cursor-pointer transition-colors"
                    >
                      <div className="text-xs font-bold font-sans">Easy</div>
                      <div className="text-[9px] font-mono opacity-60">7d</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
