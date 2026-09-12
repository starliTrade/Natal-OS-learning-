import React, { useState } from "react";
import { useNatal } from "../context/NatalStore";
import { Phase, QuizQuestion } from "../types";
import Markdown from "react-markdown";

interface LessonModalProps {
  lessonId: string;
  phases?: Phase[];
  onClose: () => void;
  onSelectLesson?: (lessonId: string) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lessonId: initialLessonId,
  phases: propPhases,
  onClose,
  onSelectLesson,
}) => {
  const [activeLessonId, setActiveLessonId] = useState(initialLessonId);

  // Sync if prop changes
  React.useEffect(() => {
    setActiveLessonId(initialLessonId);
  }, [initialLessonId]);

  const handleSwitchLesson = (newId: string) => {
    setActiveLessonId(newId);
    if (onSelectLesson) {
      onSelectLesson(newId);
    }
  };

  const {
    phases: storePhases,
    checked,
    toggleLesson,
    getLessonGateStatus,
    notes,
    saveNote,
    feynmanNotes,
    saveFeynman,
    difficulty,
    setDifficultyRating,
    aiMaterials,
    saveAiMaterial,
    saveQuizResult,
    quizResults,
    setActiveTab: setStoreActiveTab,
    unlockPlanNow,
  } = useNatal();

  const lessonId = activeLessonId;
  const phases = propPhases || storePhases;

  // Find lesson details
  const [phaseId, modId, , lessonIdxStr] = lessonId.split("-");
  const lessonIdx = parseInt(lessonIdxStr, 10);
  const phase = phases.find((p) => String(p.id) === phaseId);
  const mod = phase?.mods.find((m) => m.id === modId);
  const lesson = mod?.lessons[lessonIdx];

  const [activeTab, setActiveTab] = useState<"ai-lecture" | "notes" | "feynman" | "quiz" | "mentor">("ai-lecture");
  const [selectedLectureLayer, setSelectedLectureLayer] = useState<
    "all" | "layer-1" | "layer-2" | "layer-3" | "layer-4" | "layer-5" | "layer-6" | "layer-7" | "layer-8"
  >("all");
  const [lectureFontSize, setLectureFontSize] = useState<"sm" | "base" | "lg">("base");
  const [isGeneratingLecture, setIsGeneratingLecture] = useState(false);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const LECTURE_LAYERS = [
    { id: "all", num: 0, title: "تمام ۸ لایه", en: "Full 8 Layers", icon: "📚", color: "#F59E0B", desc: "مطالعه پیوسته و ساختاریافته تمام ۸ لایه جزوه" },
    { id: "layer-1", num: 1, title: "۱. تصویرسازی شهودی از صفر", en: "Intuitive Metaphor", icon: "🧩", color: "#10B981", desc: "تمثیل ملموس از دنیای واقعی بدون نیاز به هیچ پیش‌زمینه قبلی" },
    { id: "layer-2", num: 2, title: "۲. بحران آغازین و چرایی", en: "The Missing Link", icon: "💥", color: "#F59E0B", desc: "نبود مفهوم، ریشه پیدایش و واژه‌نامه پایه با تعاریف ساده" },
    { id: "layer-3", num: 3, title: "۳. شکست راه‌حل ساده‌لوحانه", en: "Naive vs Reality", icon: "⚠️", color: "#FB923C", desc: "توهم تسلط و چرا روش‌های سطحی و ساده‌لوحانه در عمل شکست می‌خورند" },
    { id: "layer-4", num: 4, title: "۴. کالبدشکافی مکانیسم و دیاگرام", en: "Architecture & Flow", icon: "⚙️", color: "#3B82F6", desc: "دیاگرام اسکی، ساختار درونی و ۴ گام اجرای مکانیسم" },
    { id: "layer-5", num: 5, title: "۵. تحلیل علمی و جدول مقایسه", en: "Scientific Bounds & Metrics", icon: "📐", color: "#8B5CF6", desc: "منحنی ابینگهاوس، فرمالیسم علمی و جدول مقایسه‌ای دقیق" },
    { id: "layer-6", num: 6, title: "۶. پیاده‌سازی و پروتکل عملیاتی", en: "Mastery Protocol / Code", icon: "💡", color: "#06B6D4", desc: "پروتکل روزانه تثبیت یا کد استاندارد با کامنت‌های خط‌به‌خط" },
    { id: "layer-7", num: 7, title: "۷. ۳ تله و اشتباه مرگبار", en: "Fatal Traps & Pitfalls", icon: "🚨", color: "#EF4444", desc: "۳ دام کشنده در یادگیری/پروداکشن، دلایل ریشه‌ای و راهکارهای قطعی" },
    { id: "layer-8", num: 8, title: "۸. سنتز فاینمن و لایتنر", en: "Feynman & Flashcards", icon: "🧠", color: "#EC4899", desc: "خلاصه ۳ خطی ساده به علاوه ۳ پرسش کلیدی جعبه لایتنر SM-2" },
  ];

  // Markdown sanitizer & formatter to fix unescaped tables, single-line table rows, and Persian typography
  const sanitizeAndFormatLectureMarkdown = (raw: string): string => {
    if (!raw) return "";

    let formatted = raw;

    // 1. Fix single-line merged markdown tables (e.g. "| col1 | col2 | | :--- | :--- | | row1 | row2 |")
    // Replace "| |" with "|\n|"
    formatted = formatted.replace(/\|\s*\|\s*/g, "|\n|");

    // Ensure table separator rows are properly isolated with newlines
    formatted = formatted.replace(/(\|[^\n]+\|)\s*(\|(?:\s*:?---+:?\s*\|)+)/g, "$1\n$2");
    formatted = formatted.replace(/(\|(?:\s*:?---+:?\s*\|)+)\s*(\|)/g, "$1\n$2");

    // 2. Fix Persian typography & half-spaces for common cognitive & tech terms
    formatted = formatted
      .replace(/شکلپذیری/g, "شکل‌پذیری")
      .replace(/کوتاهمدت/g, "کوتاه‌مدت")
      .replace(/بلندمدت/g, "بلندمدت")
      .replace(/طولانیمدت/g, "طولانی‌مدت")
      .replace(/تختهسیاه/g, "تخته‌سیاه")
      .replace(/تختهسیاهی/g, "تخته‌سیاهی")
      .replace(/گامبهگام/g, "گام‌به‌گام")
      .replace(/سادهلوحانه/g, "ساده‌لوحانه")
      .replace(/دستورالعملها/g, "دستورالعمل‌ها")
      .replace(/یافتهها/g, "یافته‌ها")
      .replace(/یادداشتها/g, "یادداشت‌ها")
      .replace(/جعبههای/g, "جعبه‌های")
      .replace(/قفسههای/g, "قفسه‌های")
      .replace(/کتابهای/g, "کتاب‌های")
      .replace(/برگههای/g, "برگه‌های")
      .replace(/تکههای/g, "تکه‌های")
      .replace(/دادهها/g, "داده‌ها")
      .replace(/نورونها/g, "نورون‌ها")
      .replace(/سیناپسها/g, "سیناپس‌ها")
      .replace(/پروتئینها/g, "پروتئین‌ها")
      .replace(/سلولهای/g, "سلول‌های")
      .replace(/ارتباطات/g, "ارتباطات")
      .replace(/میکند/g, "می‌کند")
      .replace(/میشود/g, "می‌شود")
      .replace(/میافتد/g, "می‌افتد")
      .replace(/میآیند/g, "می‌آیند")
      .replace(/میبرد/g, "می‌برد")
      .replace(/میبندد/g, "می‌بندد")
      .replace(/میگذارد/g, "می‌گذارد")
      .replace(/میریزند/g, "می‌ریزند")
      .replace(/میگیرد/g, "می‌گیرد")
      .replace(/نمیشود/g, "نمی‌شود")
      .replace(/نمیکند/g, "نمی‌کند")
      .replace(/میدهد/g, "می‌دهد")
      .replace(/میزنند/g, "می‌زنند")
      .replace(/میتوان/g, "می‌توان")
      .replace(/میشناسد/g, "می‌شناسد")
      .replace(/میخورند/g, "می‌خورند")
      .replace(/میخورد/g, "می‌خورد");

    return formatted;
  };

  // Helper to extract specific cognitive sections for focused zero-to-hero mastery
  const getFilteredLecture = (markdown: string, layerId: string): string => {
    if (!markdown) return "";
    const cleanMarkdown = sanitizeAndFormatLectureMarkdown(markdown);
    if (layerId === "all") return cleanMarkdown;

    const sections = cleanMarkdown.split(/(?=^#{2,3}\s+)/m);
    const headerTitle = sections[0].startsWith("# ") || sections[0].startsWith("📖 ") ? sections[0] : "";

    let match: string | undefined;
    if (layerId === "layer-1") {
      match = sections.find((s) => s.includes("لایه ۱") || s.includes("لایه 1") || s.includes("بخش ۱") || s.includes("تصویرسازی") || s.includes("شهود") || s.includes("تمثیل") || s.includes("Metaphor"));
    } else if (layerId === "layer-2") {
      match = sections.find((s) => s.includes("لایه ۲") || s.includes("لایه 2") || s.includes("بخش ۲") || s.includes("بحران") || s.includes("چرایی") || s.includes("واژه‌نامه") || s.includes("Missing Link"));
    } else if (layerId === "layer-3") {
      match = sections.find((s) => s.includes("لایه ۳") || s.includes("لایه 3") || s.includes("بخش ۳") || s.includes("ساده‌لوحانه") || s.includes("تسلط") || s.includes("شکست") || s.includes("Naive"));
    } else if (layerId === "layer-4") {
      match = sections.find((s) => s.includes("لایه ۴") || s.includes("لایه 4") || s.includes("بخش ۴") || s.includes("کالبدشکافی") || s.includes("دیاگرام") || s.includes("Under the Hood") || s.includes("سخت‌افزار") || s.includes("مسیر حافظه"));
    } else if (layerId === "layer-5") {
      match = sections.find((s) => s.includes("لایه ۵") || s.includes("لایه 5") || s.includes("بخش ۵") || s.includes("تحلیل") || s.includes("علمی") || s.includes("ابینگهاوس") || s.includes("ریاضی") || s.includes("کران") || s.includes("تاخیر") || s.includes("Latency") || s.includes("Big-O") || s.includes("Retention"));
    } else if (layerId === "layer-6") {
      match = sections.find((s) => s.includes("لایه ۶") || s.includes("لایه 6") || s.includes("بخش ۶") || s.includes("پروتکل") || s.includes("پیاده‌سازی") || s.includes("کد استاندارد") || s.includes("کد مرجع") || s.includes("دستورالعمل") || s.includes("Protocol") || s.includes("Implementation"));
    } else if (layerId === "layer-7") {
      match = sections.find((s) => s.includes("لایه ۷") || s.includes("لایه 7") || s.includes("بخش ۷") || s.includes("تله") || s.includes("اشتباه") || s.includes("دام") || s.includes("Pitfalls") || s.includes("Traps"));
    } else if (layerId === "layer-8") {
      match = sections.find((s) => s.includes("لایه ۸") || s.includes("لایه 8") || s.includes("بخش ۸") || s.includes("فاینمن") || s.includes("Feynman") || s.includes("کارت حافظه") || s.includes("لایتنر") || s.includes("SM-2") || s.includes("سنتز"));
    }

    if (!match) return cleanMarkdown;
    return headerTitle && !match.includes("📖 ") ? `${headerTitle}\n\n${match}` : match;
  };

  // Feynman helper state
  const [feynmanAnalogy, setFeynmanAnalogy] = useState<string | null>(null);
  const [feynmanQuestions, setFeynmanQuestions] = useState<string[]>([]);
  const [isLoadingFeynman, setIsLoadingFeynman] = useState(false);
  const [feynmanEval, setFeynmanEval] = useState<{
    score: number;
    ratingText: string;
    strengths: string;
    improvementTip: string;
    jargonDetected?: string[];
  } | null>(null);
  const [isEvaluatingFeynman, setIsEvaluatingFeynman] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const existingQuizResult = quizResults?.[lessonId];
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>(() => {
    if (existingQuizResult?.answers && Array.isArray(existingQuizResult.answers)) {
      const initial: Record<number, number> = {};
      existingQuizResult.answers.forEach((ans, idx) => {
        if (ans >= 0) initial[idx] = ans;
      });
      return initial;
    }
    return {};
  });
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(() => Boolean(existingQuizResult?.passed || existingQuizResult?.takenAt));

  // Sync quiz state if lesson changes
  React.useEffect(() => {
    const res = quizResults?.[lessonId];
    if (res?.answers && Array.isArray(res.answers)) {
      const initial: Record<number, number> = {};
      res.answers.forEach((ans, idx) => {
        if (ans >= 0) initial[idx] = ans;
      });
      setSelectedAnswers(initial);
      setIsQuizSubmitted(true);
    } else {
      setSelectedAnswers({});
      setIsQuizSubmitted(false);
    }
  }, [lessonId]);

  // AI Mentor & Architecture Chat state
  const [tutorQuestion, setTutorQuestion] = useState("");
  const [tutorHistory, setTutorHistory] = useState<Array<{ q: string; a: string; time: number }>>([]);
  const [isAskingTutor, setIsAskingTutor] = useState(false);

  const isCompleted = checked.includes(lessonId);
  const noteText = notes[lessonId]?.text || "";
  const feynmanText = feynmanNotes[lessonId]?.text || "";
  const diffRating = difficulty[lessonId] || 0;
  const cachedAiLecture = aiMaterials[lessonId]?.content || "";

  const gateStatus = getLessonGateStatus(lessonId);
  const hasNote = !gateStatus.needNote;
  const hasFeynman = !gateStatus.needFeynman;
  const hasDiff = !gateStatus.needDifficulty;
  const isEligibleToComplete = gateStatus.canComplete;

  const handleGenerateLecture = async () => {
    if (!lesson) return;
    setIsGeneratingLecture(true);
    try {
      const res = await fetch("/api/generate-lesson-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          titleEn: lesson.en,
          titleFa: lesson.fa,
          phaseTitle: phase?.title,
          moduleTitle: mod?.title,
        }),
      });
      const data = await res.json();
      if (data.content) {
        saveAiMaterial(lessonId, data.content);
      }
    } catch (e) {
      console.error("Failed to generate lecture:", e);
    } finally {
      setIsGeneratingLecture(false);
    }
  };

  const handleFetchFeynman = async () => {
    if (!lesson) return;
    setIsLoadingFeynman(true);
    try {
      const res = await fetch("/api/generate-feynman-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: lesson.en,
          titleFa: lesson.fa,
          phaseTitle: phase?.title,
          moduleTitle: mod?.title,
        }),
      });
      const data = await res.json();
      setFeynmanAnalogy(data.analogy || "");
      setFeynmanQuestions(data.keyQuestions || []);
    } catch (e) {
      console.error("Failed to generate Feynman guide:", e);
    } finally {
      setIsLoadingFeynman(false);
    }
  };

  const handleFetchQuiz = async () => {
    if (!lesson) return;
    setIsLoadingQuiz(true);
    setSelectedAnswers({});
    setIsQuizSubmitted(false);
    setValidationError(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quiz",
          lessonTitle: lesson.en,
          lessonFa: lesson.fa,
          phase: phase?.title,
          module: mod?.title,
          lectureText: cachedAiLecture || (lesson.keyConcepts ? `${lesson.fa} (${lesson.en}). مفاهیم کلیدی: ${lesson.keyConcepts.join(", ")}` : ""),
        }),
      });
      const data = await res.json();
      setQuizQuestions(data.questions || []);
    } catch (e) {
      console.error("Failed to generate quiz:", e);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleEvaluateFeynman = async () => {
    if (!feynmanText.trim() || feynmanText.trim().length < 15) {
      setValidationError("ابتدا حداقل ۱۵ کاراکتر توضیح در کادر فاینمن بنویسید.");
      return;
    }
    setIsEvaluatingFeynman(true);
    setValidationError(null);
    try {
      const res = await fetch("/api/evaluate-feynman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: lesson.en,
          titleFa: lesson.fa,
          phaseTitle: phase?.title,
          moduleTitle: mod?.title,
          feynmanText,
        }),
      });
      const data = await res.json();
      setFeynmanEval(data);
    } catch (e) {
      console.error("Failed to evaluate Feynman:", e);
    } finally {
      setIsEvaluatingFeynman(false);
    }
  };

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    if (quizQuestions.length === 0) return;
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < quizQuestions.length) {
      setValidationError("لطفاً پیش از ثبت و ممیزی، به تمام ۳ سوال آزمون پاسخ دهید.");
      return;
    }
    setValidationError(null);

    const score = quizQuestions.reduce((acc, q, idx) => {
      return acc + (selectedAnswers[idx] === q.correct ? 1 : 0);
    }, 0);
    const answersArray = quizQuestions.map((_, idx) => selectedAnswers[idx] ?? -1);

    saveQuizResult(lessonId, score, quizQuestions.length, answersArray);
    setIsQuizSubmitted(true);
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setIsQuizSubmitted(false);
    setValidationError(null);
  };

  const handleCopyLecture = () => {
    if (cachedAiLecture) {
      const clean = sanitizeAndFormatLectureMarkdown(cachedAiLecture);
      navigator.clipboard.writeText(clean);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAskTutor = async (customQ?: string) => {
    const query = customQ || tutorQuestion;
    if (!query.trim() || !lesson) return;
    setIsAskingTutor(true);
    try {
      const res = await fetch("/api/ask-ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle: lesson.en,
          lessonFa: lesson.fa,
          phaseTitle: phase?.title,
          moduleTitle: mod?.title,
          question: query,
          context: cachedAiLecture ? cachedAiLecture.slice(0, 800) : "",
        }),
      });
      const data = await res.json();
      setTutorHistory((prev) => [
        ...prev,
        { q: query, a: data.answer || "پاسخی دریافت نشد.", time: Date.now() },
      ]);
      if (!customQ) setTutorQuestion("");
    } catch (e) {
      console.error("Failed to ask tutor:", e);
    } finally {
      setIsAskingTutor(false);
    }
  };

  if (!lesson || !phase || !mod) return null;

  return (
    <div
      id="lesson-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="lesson-modal-container"
        className="bg-[#0c0c0c] border border-white/[0.08] w-full max-w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl h-[92vh] sm:h-[86vh] flex flex-col overflow-hidden text-white shadow-[0_25px_70px_rgba(0,0,0,0.95)] transition-all"
      >
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

        {/* Modal Header */}
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-white/[0.05] flex items-start justify-between bg-[#080808] flex-shrink-0 gap-2">
          <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-1 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[9.5px] sm:text-[10px] font-mono uppercase text-white/40 tracking-wider">
                Phase {phase.id} • {mod.id}
              </span>
              {isCompleted ? (
                <span className="text-[9.5px] sm:text-[10px] font-mono text-[#10B981] font-bold flex items-center gap-1 bg-[#10B981]/10 px-1.5 py-0.5 rounded">
                  ✓ Done (SM-2 Active)
                </span>
              ) : gateStatus.canComplete ? (
                <span className="text-[9.5px] sm:text-[10px] font-mono text-[#F59E0B] font-bold flex items-center gap-1 bg-[#F59E0B]/10 px-1.5 py-0.5 rounded">
                  Ready to Complete
                </span>
              ) : (
                <span className="text-[9.5px] sm:text-[10px] font-mono text-white/40 flex items-center gap-1 bg-white/[0.04] px-1.5 py-0.5 rounded">
                  🔒 Gated
                </span>
              )}
            </div>
            <h2 className="text-[13px] sm:text-[15px] font-bold text-white leading-tight truncate">
              {lesson.en}
            </h2>
            <p className="text-[10.5px] sm:text-[11px] text-white/45 font-fa truncate" dir="rtl">
              {lesson.fa}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer flex-shrink-0 text-xs"
          >
            ✕
          </button>
        </div>

        {/* Modal Body & Tab Navigation or Gated Screen */}
        {!isCompleted && !gateStatus.isUnlocked ? (
          /* 1. Prerequisite Lock View */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-2xl shadow-lg shadow-[#F59E0B]/10 animate-pulse">
              🔒
            </div>

            <div className="space-y-1.5 max-w-md">
              <span className="text-[10px] font-mono uppercase text-[#F59E0B] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                PREREQUISITE LOCKED
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white font-fa pt-1">
                این سرفصل قفل است و دسترسی به آن هنوز بازگشایی نشده است
              </h3>
              <p className="text-[11px] sm:text-xs text-white/50 font-fa leading-relaxed text-center" dir="rtl">
                طبق اصول یادگیری مهندسی Natal، هر مبحث بر پایه درک عمیق مباحث قبلی بنا شده است. برای جلوگیری از یادگیری سطحی و توهم تسلط، دسترسی به جزوه و تمرینات این درس پس از گذراندن و ثبت پیش‌نیازها فعال خواهد شد.
              </p>
            </div>

            {gateStatus.prerequisiteTitle && (
              <div className="w-full max-w-md bg-[#080808] border border-white/[0.08] rounded-xl p-3.5 text-right space-y-2.5" dir="rtl">
                <div className="flex items-center justify-between text-[10.5px] font-mono text-white/40">
                  <span>پیش‌نیاز الزامی برای بازگشایی:</span>
                  <span className="text-[#F59E0B] font-bold">مرحله قبل</span>
                </div>
                <div className="text-xs font-bold text-white font-fa bg-white/[0.03] p-2.5 rounded-lg border border-white/[0.04]">
                  {gateStatus.prerequisiteTitle}
                </div>
                {gateStatus.prerequisiteId && (
                  <button
                    onClick={() => handleSwitchLesson(gateStatus.prerequisiteId!)}
                    className="w-full py-2.5 px-3 rounded-lg bg-[#F59E0B] hover:bg-[#F59E0B]/90 active:bg-[#F59E0B]/80 text-black font-bold text-xs font-fa cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#F59E0B]/15"
                  >
                    <span>🚀 انتقال به درس پیش‌نیاز و شروع مطالعه</span>
                  </button>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="text-xs text-white/40 hover:text-white font-fa pt-2 transition-colors cursor-pointer"
            >
              بازگشت به نقشه راه
            </button>
          </div>
        ) : !isCompleted && gateStatus.isGateLocked ? (
          /* 2. Review Gate Lock View */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-2xl">
              ⛔
            </div>

            <div className="space-y-1.5 max-w-md">
              <span className="text-[10px] font-mono uppercase text-[#EF4444] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20">
                SM-2 REVIEW GATE ACTIVE
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white font-fa pt-1">
                دروازه مرور هوشمند SM-2 فعال است
              </h3>
              <p className="text-[11px] sm:text-xs text-white/50 font-fa leading-relaxed text-center" dir="rtl">
                شما <strong className="text-rose-400 font-mono">{gateStatus.dueReviewsCount}</strong> کارت موعدرسیده در صف تکرار فاصله‌دار دارید. برای پایدارسازی اتصالات سیناپسی و جلوگیری از فراموشی، مرور کارت‌ها قبل از یادگیری درس‌های جدید الزامی است.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  onClose();
                  setStoreActiveTab("review");
                }}
                className="py-2.5 px-4 rounded-xl bg-[#EF4444] hover:bg-[#EF4444]/90 text-black font-bold text-xs font-fa cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-[#EF4444]/15"
              >
                <span>🧠 ورود به جعبه مرور SM-2</span>
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 text-xs font-fa cursor-pointer transition-all"
              >
                بستن
              </button>
            </div>
          </div>
        ) : !isCompleted && gateStatus.isBudgetExceeded ? (
          /* 3. Daily Budget Exceeded Lock View */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-2xl">
              ⚡
            </div>

            <div className="space-y-1.5 max-w-md">
              <span className="text-[10px] font-mono uppercase text-[#8B5CF6] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                DAILY CEILING REACHED
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white font-fa pt-1">
                سقف ظرفیت شناختی امروز پر شده است
              </h3>
              <p className="text-[11px] sm:text-xs text-white/50 font-fa leading-relaxed text-center" dir="rtl">
                شما امروز <strong className="text-purple-400 font-mono">{gateStatus.completedTodayCount}</strong> درس از سقف مجاز <strong className="text-purple-400 font-mono">{gateStatus.dailyBudget}</strong> درس را تکمیل کرده‌اید. جهت تثبیت در خواب عمیق، ادامه یادگیری توصیه نمی‌شود.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={unlockPlanNow}
                className="py-2.5 px-3.5 rounded-xl bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-black font-bold text-xs font-fa cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-[#8B5CF6]/15"
              >
                <span>+ بازگشایی اضطراری سقف امروز</span>
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 text-xs font-fa cursor-pointer transition-all"
              >
                بستن و استراحت
              </button>
            </div>
          </div>
        ) : (
          /* Normal Unlocked Lesson Tabs */
          <>
            {/* Tab Navigation - Mobile-First Segmented Bar */}
            <div className="flex items-center px-1.5 sm:px-2 border-b border-white/[0.05] bg-[#070707] text-xs font-medium overflow-x-auto gap-0.5 sm:gap-1 scrollbar-none flex-shrink-0">
              {[
                { id: "ai-lecture", icon: "📖", label: "جزوه", en: "Lecture" },
                { id: "notes", icon: "📝", label: "یادداشت", en: "Notes", badge: hasNote },
                { id: "feynman", icon: "🧠", label: "فاینمن", en: "Feynman", badge: hasFeynman },
                { id: "quiz", icon: "🎯", label: "آزمون", en: "Quiz", badge: !gateStatus.needQuizPass },
                { id: "mentor", icon: "💬", label: "مربی", en: "Mentor", badgeCount: tutorHistory.length },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      if (tab.id === "quiz" && quizQuestions.length === 0) handleFetchQuiz();
                    }}
                    className={`flex-1 min-w-[56px] sm:min-w-[62px] flex flex-col items-center justify-center py-2 px-1 border-b-2 text-xs transition-all cursor-pointer relative ${
                      isActive
                        ? "border-[#F59E0B] text-[#F59E0B] font-bold bg-[#F59E0B]/[0.03]"
                        : "border-transparent text-white/40 hover:text-white/75"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{tab.icon}</span>
                      <span className="text-[10.5px] sm:text-[11px] font-fa">{tab.label}</span>
                      {tab.badge && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />}
                      {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                        <span className="px-1 text-[8px] font-mono rounded bg-[#06B6D4]/20 text-[#06B6D4]">
                          {tab.badgeCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[8.5px] sm:text-[9px] font-mono text-white/20 tracking-tighter hidden xs:inline">{tab.en}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content Body with independent smooth scroll */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-3.5 text-xs w-full max-w-full">
          {/* TAB 1: AI LECTURE */}
          {activeTab === "ai-lecture" && (
            <div className="space-y-3 w-full max-w-full">
              {/* Header & Generation Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-[#080808] p-2.5 rounded-xl border border-white/[0.04]">
                <div className="text-[10.5px] sm:text-[11px] text-white/80 font-fa flex items-center gap-1.5" dir="rtl">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse flex-shrink-0" />
                  <span className="font-bold text-[#F59E0B]">جزوه ۸ لایه آموزشی:</span>
                  <span className="text-white/60">از صفر مطلق تا پروداکشن</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end flex-wrap">
                  {/* Font Size Adjuster */}
                  <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/[0.05]">
                    <button
                      onClick={() => setLectureFontSize("sm")}
                      className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                        lectureFontSize === "sm" ? "bg-white/20 text-white font-bold" : "text-white/40 hover:text-white/70"
                      }`}
                      title="فونت کوچک"
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setLectureFontSize("base")}
                      className={`px-1.5 py-0.5 text-[9.5px] font-mono rounded ${
                        lectureFontSize === "base" ? "bg-white/20 text-white font-bold" : "text-white/40 hover:text-white/70"
                      }`}
                      title="فونت استاندارد"
                    >
                      A
                    </button>
                    <button
                      onClick={() => setLectureFontSize("lg")}
                      className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                        lectureFontSize === "lg" ? "bg-white/20 text-white font-bold" : "text-white/40 hover:text-white/70"
                      }`}
                      title="فونت بزرگ"
                    >
                      A+
                    </button>
                  </div>

                  {cachedAiLecture && (
                    <button
                      onClick={handleCopyLecture}
                      className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.12] text-white/80 hover:text-white text-[10px] font-mono transition-colors cursor-pointer border border-white/[0.04]"
                    >
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  )}
                  <button
                    onClick={handleGenerateLecture}
                    disabled={isGeneratingLecture}
                    className="px-3 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#F59E0B]/90 active:bg-[#F59E0B]/80 text-black font-bold text-[10px] font-mono transition-colors disabled:opacity-40 cursor-pointer shadow-sm"
                  >
                    {isGeneratingLecture ? "Synthesizing..." : cachedAiLecture ? "تولید مجدد 🔄" : "تولید جزوه ۸ لایه 🚀"}
                  </button>
                </div>
              </div>

              {/* 8-Layer Interactive Layer Navigation */}
              {cachedAiLecture && !isGeneratingLecture && (
                <div className="space-y-2 w-full max-w-full">
                  {/* Layer Selector Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x w-full touch-pan-x">
                    {LECTURE_LAYERS.map((layer) => {
                      const isSelected = selectedLectureLayer === layer.id;
                      return (
                        <button
                          key={layer.id}
                          onClick={() => setSelectedLectureLayer(layer.id as any)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-fa whitespace-nowrap transition-all cursor-pointer border snap-start flex-shrink-0 flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-[#F59E0B]/15 border-[#F59E0B]/60 text-[#F59E0B] font-bold shadow-sm"
                              : "bg-[#080808] border-white/[0.04] text-white/50 hover:text-white/80 hover:border-white/[0.08]"
                          }`}
                        >
                          <span>{layer.icon}</span>
                          <span>{layer.title}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Layer Header & Stepper Navigator */}
                  {selectedLectureLayer !== "all" ? (
                    (() => {
                      const currentIdx = LECTURE_LAYERS.findIndex((l) => l.id === selectedLectureLayer);
                      const currentLayer = LECTURE_LAYERS[currentIdx];
                      const prevLayer = currentIdx > 1 ? LECTURE_LAYERS[currentIdx - 1] : null;
                      const nextLayer = currentIdx < LECTURE_LAYERS.length - 1 ? LECTURE_LAYERS[currentIdx + 1] : null;
                      const progressPct = Math.round((currentIdx / (LECTURE_LAYERS.length - 1)) * 100);

                      return (
                        <div className="bg-[#080808] border border-white/[0.05] rounded-xl p-2.5 sm:p-3 space-y-2" dir="rtl">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{currentLayer.icon}</span>
                              <div>
                                <div className="text-[11px] sm:text-xs font-bold text-white flex items-center gap-2">
                                  <span>{currentLayer.title}</span>
                                  <span className="text-[9px] font-mono font-normal text-white/40">({currentLayer.en})</span>
                                </div>
                                <div className="text-[9.5px] sm:text-[10px] text-white/50">{currentLayer.desc}</div>
                              </div>
                            </div>
                            <div className="text-left flex-shrink-0 font-mono text-[9.5px] text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/20">
                              لایه {currentLayer.num} از ۸ ({progressPct}%)
                            </div>
                          </div>

                          {/* Progress Line */}
                          <div className="w-full bg-white/[0.04] h-1 rounded-full overflow-hidden">
                            <div
                              className="bg-[#F59E0B] h-full transition-all duration-300 rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>

                          {/* Prev / Next Stepper Controls */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.03]">
                            {prevLayer ? (
                              <button
                                onClick={() => setSelectedLectureLayer(prevLayer.id as any)}
                                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-[10px] font-fa flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>➔</span>
                                <span>لایه قبلی: {prevLayer.title}</span>
                              </button>
                            ) : (
                              <div />
                            )}

                            {nextLayer ? (
                              <button
                                onClick={() => setSelectedLectureLayer(nextLayer.id as any)}
                                className="px-3 py-1 rounded-lg bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 border border-[#F59E0B]/40 text-[#F59E0B] font-bold text-[10px] font-fa flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>گام بعدی: {nextLayer.title}</span>
                                <span>⬅</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setActiveTab("notes")}
                                className="px-3 py-1 rounded-lg bg-[#10B981]/20 hover:bg-[#10B981]/30 border border-[#10B981]/40 text-[#10B981] font-bold text-[10px] font-fa flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>✓ پایان جزوه؛ رفتن به بخش یادداشت</span>
                                <span>⬅</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-[9.5px] sm:text-[10px] text-white/50 font-fa px-2.5 py-1.5 rounded-lg bg-[#080808] border border-white/[0.03] flex items-center justify-between gap-2" dir="rtl">
                      <span>📖 در حال مطالعه نمای پیوسته تمام ۸ لایه جزوه (از شهود تا پروداکشن)</span>
                      <span className="font-mono text-[9px] text-[#F59E0B] font-bold flex-shrink-0">
                        ~{Math.max(2, Math.round(cachedAiLecture.length / 500))} min
                      </span>
                    </div>
                  )}
                </div>
              )}

              {isGeneratingLecture ? (
                <div className="py-12 text-center space-y-3 bg-[#080808] rounded-2xl border border-white/[0.05] p-5">
                  <div className="w-7 h-7 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="text-white/60 font-mono text-xs">Architecting 8-Layer Zero to Hero Stack...</div>
                  <div className="text-[10px] text-white/35 font-fa" dir="rtl">
                    در حال تدوین تمثیل صفر، بحران آغازین، دیاگرام کش سخت‌افزاری، جدول تاخیر نانوثانیه و کد استاندارد صنعتی...
                  </div>
                </div>
              ) : cachedAiLecture ? (
                <div
                  className={`lecture-prose text-white/85 leading-relaxed bg-[#080808] p-3 sm:p-4 rounded-2xl border border-white/[0.04] overflow-x-hidden shadow-inner w-full max-w-full ${
                    lectureFontSize === "sm" ? "text-[11.5px]" : lectureFontSize === "lg" ? "text-[14px]" : "text-[12.5px]"
                  }`}
                  dir="rtl"
                >
                  <Markdown>{getFilteredLecture(cachedAiLecture, selectedLectureLayer)}</Markdown>
                </div>
              ) : (
                <div className="py-10 text-center space-y-3 bg-[#080808] rounded-2xl border border-dashed border-white/[0.07] p-5">
                  <div className="text-xs text-white/60 font-fa" dir="rtl">
                    هنوز جزوه تحلیلی ۸ لایه (از صفر مطلق تا پروداکشن) برای این درس تدوین نشده است.
                  </div>
                  <button
                    onClick={handleGenerateLecture}
                    className="px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#F59E0B]/90 active:bg-[#F59E0B]/80 text-black font-bold text-xs cursor-pointer shadow-md transition-transform active:scale-98"
                  >
                    تدوین جزوه ۸ لایه آموزشی (Zero to Production) 🚀
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PERSONAL NOTES */}
          {activeTab === "notes" && (
            <div className="space-y-3 w-full max-w-full">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10.5px] sm:text-[11px] text-white/60 font-fa leading-normal truncate" dir="rtl">
                  خلاصه معماری و الگوهای کلیدی به زبان خودتان:
                </div>
                <div className="text-[9.5px] sm:text-[10px] font-mono flex-shrink-0">
                  {hasNote ? (
                    <span className="text-[#10B981] font-bold bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">✓ آماده ({noteText.trim().length} حرف)</span>
                  ) : (
                    <span className="text-white/40 bg-white/[0.03] px-2 py-0.5 rounded">حداقل ۱۵ کاراکتر ({noteText.trim().length}/15)</span>
                  )}
                </div>
              </div>

              {/* Quick helper tags */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
                <span className="text-[9.5px] font-mono text-white/30 flex-shrink-0">Quick Insert:</span>
                {[
                  { tag: "\n\n### 🎯 ناوردا (Invariant):\n- ", label: "ناوردا" },
                  { tag: "\n\n### ⚙️ تراز و سربار حافظه:\n- ", label: "حافظه و کش" },
                  { tag: "\n\n### ⚠️ دام‌های پروداکشن:\n- ", label: "دام‌ها" },
                  { tag: "\n\n### 💡 مدل ذهنی کلیدی:\n- ", label: "مدل ذهنی" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => saveNote(lessonId, noteText + item.tag)}
                    className="px-2 py-1 rounded-md bg-white/[0.03] hover:bg-white/[0.07] active:bg-white/[0.1] text-white/60 hover:text-white text-[9.5px] font-fa whitespace-nowrap border border-white/[0.04] transition-colors cursor-pointer flex-shrink-0"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={8}
                value={noteText}
                onChange={(e) => saveNote(lessonId, e.target.value)}
                placeholder="یادداشت‌های فنی، ناورداها، و چرایی انتخاب این الگوریتم در مقیاس صنعتی را اینجا بنویسید..."
                className="w-full bg-[#080808] border border-white/[0.06] rounded-xl p-3 sm:p-3.5 text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#F59E0B]/60 resize-none font-sans leading-relaxed min-h-[160px] sm:min-h-[200px]"
                dir="auto"
              />

              <div className="p-2 sm:p-2.5 rounded-xl bg-[#080808] border border-white/[0.03] flex items-center justify-between text-[10px] sm:text-[11px] text-white/40 font-fa" dir="rtl">
                <span>💡 یادداشت‌ها به‌صورت خودکار در حافظه دستگاه شما ذخیره می‌شوند.</span>
                <span className="font-mono text-[9.5px] text-white/30">{noteText.length} chars</span>
              </div>
            </div>
          )}

          {/* TAB 3: FEYNMAN TECHNIQUE */}
          {activeTab === "feynman" && (
            <div className="space-y-3 w-full max-w-full">
              {/* Mental Analogy Box */}
              <div className="p-3 sm:p-3.5 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm flex-shrink-0">🧠</span>
                    <span className="text-xs font-bold text-[#8B5CF6] truncate">
                      دستیار مدل ذهنی و تمثیل فاینمن
                    </span>
                  </div>
                  <button
                    onClick={handleFetchFeynman}
                    disabled={isLoadingFeynman}
                    className="text-[10px] font-mono px-2.5 py-1.5 rounded-lg bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 active:bg-[#8B5CF6]/40 text-[#8B5CF6] transition-colors cursor-pointer border border-[#8B5CF6]/30 flex items-center gap-1 font-bold flex-shrink-0"
                  >
                    {isLoadingFeynman ? "Loading..." : "Get Analogy 💡"}
                  </button>
                </div>

                {feynmanAnalogy && (
                  <div className="text-[10.5px] sm:text-[11px] text-white/85 font-fa leading-relaxed bg-[#080808] p-2.5 sm:p-3 rounded-xl border border-white/[0.05]" dir="rtl">
                    <strong className="text-[#8B5CF6] block mb-1">تمثیل شهودی جهان واقعی:</strong>
                    {feynmanAnalogy}
                  </div>
                )}

                {feynmanQuestions.length > 0 && (
                  <div className="text-[10.5px] sm:text-[11px] text-white/70 font-fa space-y-1 bg-[#080808]/50 p-2.5 rounded-xl border border-white/[0.03]" dir="rtl">
                    <span className="text-white/40 block font-mono text-[9px] uppercase">پرسش‌های لنگر بازیابی فعال:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {feynmanQuestions.map((q, idx) => (
                        <li key={idx} className="leading-snug">{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Input section with responsive header */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-[10.5px] sm:text-[11px] text-white/60 font-fa leading-snug" dir="rtl">
                    این درس را با زبان ساده و بدون اصطلاحات قلمبه‌سلمبه، طوری که برای یک مبتدی قابل فهم باشد توضیح دهید:
                  </label>
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    {hasFeynman && (
                      <span className="text-[#10B981] font-mono text-[10px] font-bold">✓ Ready</span>
                    )}
                    <button
                      onClick={handleEvaluateFeynman}
                      disabled={isEvaluatingFeynman || feynmanText.trim().length < 15}
                      className="text-[10px] font-mono px-3 py-1.5 rounded-xl bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 active:bg-[#8B5CF6]/40 text-[#8B5CF6] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 border border-[#8B5CF6]/30 font-bold"
                    >
                      {isEvaluatingFeynman ? "Evaluating..." : "AI Feynman Check ⚡"}
                    </button>
                  </div>
                </div>

                <textarea
                  rows={5}
                  value={feynmanText}
                  onChange={(e) => saveFeynman(lessonId, e.target.value)}
                  placeholder="توضیح دهید... (مثال: مانند این است که چند کارمند در یک اتاق بخواهند همزمان بدون ایجاد هرج‌ومرج، یک برگه مشترک را ویرایش کنند...)"
                  className="w-full bg-[#080808] border border-white/[0.06] rounded-xl p-3 sm:p-3.5 text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#8B5CF6]/60 resize-none font-sans leading-relaxed min-h-[130px] sm:min-h-[150px]"
                  dir="auto"
                />

                <div className="flex items-center justify-between text-[9.5px] sm:text-[10px] font-mono text-white/35 px-1">
                  <span>{feynmanText.length} characters</span>
                  <span>{feynmanText.trim().length >= 15 ? "✓ Min length satisfied" : "Need min 15 chars"}</span>
                </div>
              </div>

              {/* AI Feynman Evaluation Feedback */}
              {feynmanEval && (
                <div className="p-3 sm:p-3.5 bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 rounded-2xl space-y-2 text-xs font-fa animate-in fade-in" dir="rtl">
                  <div className="flex items-center justify-between font-mono text-[10.5px] sm:text-[11px]" dir="ltr">
                    <span className="font-bold text-[#8B5CF6]">Feynman Clarity Score</span>
                    <span className="px-2 py-0.5 rounded bg-[#8B5CF6]/25 text-[#8B5CF6] font-bold border border-[#8B5CF6]/30">
                      {feynmanEval.score} / 100 • {feynmanEval.ratingText}
                    </span>
                  </div>
                  {feynmanEval.strengths && (
                    <div className="text-white/85 leading-relaxed bg-[#080808] p-2.5 rounded-xl border border-white/[0.03]">
                      <strong className="text-[#10B981] block text-[10.5px] sm:text-[11px] mb-0.5">نقطه قوت مدل ذهنی:</strong>
                      {feynmanEval.strengths}
                    </div>
                  )}
                  {feynmanEval.improvementTip && (
                    <div className="text-white/75 leading-relaxed bg-[#080808] p-2.5 rounded-xl border border-white/[0.03]">
                      <strong className="text-[#F59E0B] block text-[10.5px] sm:text-[11px] mb-0.5">پیشنهاد ارتقای شهود:</strong>
                      {feynmanEval.improvementTip}
                    </div>
                  )}
                  {feynmanEval.jargonDetected && feynmanEval.jargonDetected.length > 0 && (
                    <div className="text-white/70 text-[10.5px] sm:text-[11px] bg-red-950/20 p-2 rounded-lg border border-red-900/30">
                      <span className="text-red-400 font-bold">اصطلاحات پیچیده شناسایی‌شده: </span>
                      {feynmanEval.jargonDetected.join("، ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: QUIZ */}
          {activeTab === "quiz" && (
            <div className="space-y-3.5">
              {/* Quiz Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#080808] p-3 rounded-xl border border-white/[0.05]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-white/70 font-fa" dir="rtl">
                    آزمون تشخیصی ۳ سوالی (شرط قبولی: حداقل ۲ از ۳):
                  </span>
                  {existingQuizResult && (
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                        existingQuizResult.passed
                          ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                          : "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"
                      }`}
                    >
                      {existingQuizResult.passed ? "✓ قبول شده" : "✗ نیاز به تکرار"}: {existingQuizResult.score}/{existingQuizResult.total}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {quizQuestions.length > 0 && isQuizSubmitted && (
                    <button
                      onClick={handleRetakeQuiz}
                      className="text-[10.5px] font-fa px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/80 transition-colors cursor-pointer border border-white/[0.06]"
                    >
                      🔄 پاسخ‌دهی مجدد
                    </button>
                  )}
                  <button
                    onClick={handleFetchQuiz}
                    disabled={isLoadingQuiz}
                    className="text-[10.5px] font-fa px-3 py-1.5 rounded-lg bg-[#06B6D4]/10 hover:bg-[#06B6D4]/20 text-[#06B6D4] transition-colors cursor-pointer border border-[#06B6D4]/25 disabled:opacity-40"
                  >
                    {isLoadingQuiz ? "در حال استخراج سوالات..." : quizQuestions.length > 0 ? "⚡ سوالات جدید از جزوه" : "بارگذاری آزمون تشخیصی 🚀"}
                  </button>
                </div>
              </div>

              {isLoadingQuiz ? (
                <div className="py-12 text-center space-y-3 bg-[#080808] rounded-xl border border-white/[0.04]">
                  <div className="inline-block w-6 h-6 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-white/60 font-fa text-xs" dir="rtl">
                    در حال تحلیل عمیق متن جزوه و استخراج ۳ سوال تشخیصی دقیق...
                  </div>
                </div>
              ) : quizQuestions.length > 0 ? (
                <div className="space-y-4">
                  {quizQuestions.map((q, qIdx) => {
                    const isSelected = selectedAnswers[qIdx] !== undefined;
                    const selectedOptIdx = selectedAnswers[qIdx];
                    const isCorrect = isQuizSubmitted && selectedOptIdx === q.correct;
                    const isWrong = isQuizSubmitted && isSelected && selectedOptIdx !== q.correct;

                    return (
                      <div
                        key={qIdx}
                        className={`p-4 rounded-xl border transition-all space-y-3 ${
                          isQuizSubmitted
                            ? isCorrect
                              ? "bg-[#10B981]/[0.03] border-[#10B981]/30"
                              : "bg-[#EF4444]/[0.03] border-[#EF4444]/30"
                            : "bg-[#080808] border-white/[0.06]"
                        }`}
                      >
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-semibold text-xs sm:text-[13px] text-white leading-relaxed font-fa" dir="rtl">
                            <span className="inline-block font-mono text-[#06B6D4] ml-1.5 font-bold">
                              سوال {qIdx + 1}:
                            </span>
                            {q.q}
                          </div>
                          {isQuizSubmitted && (
                            <span
                              className={`shrink-0 text-[10px] font-fa font-bold px-2 py-0.5 rounded-md ${
                                isCorrect
                                  ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40"
                                  : "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40"
                              }`}
                            >
                              {isCorrect ? "✓ صحیح" : "✗ نادرست"}
                            </span>
                          )}
                        </div>

                        {/* Options List */}
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isThisOptionSelected = selectedOptIdx === optIdx;
                            const isThisOptionCorrect = optIdx === q.correct;

                            let optionStyles = "bg-white/[0.02] border-white/[0.06] text-white/80 hover:bg-white/[0.05]";
                            let bulletStyles = "border-white/30 text-transparent";

                            if (!isQuizSubmitted) {
                              if (isThisOptionSelected) {
                                optionStyles = "bg-[#06B6D4]/15 border-[#06B6D4]/60 text-white font-medium shadow-sm shadow-[#06B6D4]/10";
                                bulletStyles = "border-[#06B6D4] bg-[#06B6D4] text-white";
                              }
                            } else {
                              // Submitted State
                              if (isThisOptionCorrect) {
                                optionStyles = "bg-[#10B981]/20 border-[#10B981]/60 text-[#10B981] font-semibold";
                                bulletStyles = "border-[#10B981] bg-[#10B981] text-black font-bold";
                              } else if (isThisOptionSelected && !isThisOptionCorrect) {
                                optionStyles = "bg-[#EF4444]/20 border-[#EF4444]/60 text-[#EF4444] font-medium";
                                bulletStyles = "border-[#EF4444] bg-[#EF4444] text-white font-bold";
                              } else {
                                optionStyles = "opacity-40 border-white/[0.03] text-white/40";
                                bulletStyles = "border-white/10 text-transparent";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                                disabled={isQuizSubmitted}
                                className={`w-full flex items-center justify-between gap-3 text-right p-3 rounded-xl border transition-all text-xs sm:text-[12.5px] leading-relaxed cursor-pointer font-fa ${optionStyles} ${
                                  isQuizSubmitted ? "cursor-default" : ""
                                }`}
                                dir="rtl"
                              >
                                <div className="flex items-center gap-2.5 flex-1">
                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[9px] transition-all ${bulletStyles}`}
                                  >
                                    {!isQuizSubmitted && isThisOptionSelected ? "●" : isQuizSubmitted && isThisOptionCorrect ? "✓" : isQuizSubmitted && isThisOptionSelected ? "✗" : ""}
                                  </div>
                                  <span className="flex-1">{opt}</span>
                                </div>
                                {isQuizSubmitted && isThisOptionCorrect && (
                                  <span className="text-[10px] text-[#10B981] font-bold shrink-0 font-fa">
                                    پاسخ صحیح
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Post-Audit Grounded Explanation */}
                        {isQuizSubmitted && (
                          <div className="mt-2.5 p-3 bg-[#050505] rounded-xl text-xs text-white/80 border border-white/[0.06] leading-relaxed font-fa space-y-1" dir="rtl">
                            <div className="flex items-center gap-1.5 text-[#F59E0B] font-bold text-[11px]">
                              <span>💡 تحلیل و استناد مفهومی جزوه:</span>
                            </div>
                            <p className="text-white/75 text-[11.5px]">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Submission & Grading Action Box */}
                  <div className="bg-[#080808] p-4 rounded-xl border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 font-fa" dir="rtl">
                      <div className="text-xs text-white/70">
                        {isQuizSubmitted ? (
                          existingQuizResult?.passed ? (
                            <span className="text-[#10B981] font-bold">
                              ✅ تبریک! آزمون تشخیصی با موفقیت پاس شد ({existingQuizResult.score} از {existingQuizResult.total}). شرط آزمون برای تکمیل این درس ثبت شد.
                            </span>
                          ) : (
                            <span className="text-[#EF4444] font-bold">
                              ⚠️ نتیجه آزمون: {existingQuizResult?.score || 0} از ۳. برای تایید تسلط، حداقل ۲ پاسخ صحیح نیاز است.
                            </span>
                          )
                        ) : (
                          <span>
                            وضعیت پاسخ‌دهی:{" "}
                            <strong className="text-[#06B6D4] font-mono">
                              {Object.keys(selectedAnswers).length}
                            </strong>{" "}
                            از ۳ سوال تکمیل شده است.
                          </span>
                        )}
                      </div>
                    </div>

                    {!isQuizSubmitted ? (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                        className="text-xs font-fa font-bold px-5 py-2.5 rounded-xl bg-[#06B6D4] text-black hover:bg-[#06B6D4]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-[#06B6D4]/15 shrink-0"
                      >
                        🎯 ثبت و ممیزی آزمون (Submit & Audit)
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleRetakeQuiz}
                          className="text-xs font-fa px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white font-medium transition-colors cursor-pointer border border-white/[0.06]"
                        >
                          تلاش مجدد
                        </button>
                        <button
                          onClick={handleFetchQuiz}
                          disabled={isLoadingQuiz}
                          className="text-xs font-fa px-4 py-2 rounded-xl bg-[#06B6D4]/15 hover:bg-[#06B6D4]/25 text-[#06B6D4] font-bold transition-colors cursor-pointer border border-[#06B6D4]/30"
                        >
                          سوالات جدید از جزوه ⚡
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center space-y-3 bg-[#080808] rounded-2xl border border-white/[0.04] p-6">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/25 flex items-center justify-center text-xl">
                    📝
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white font-fa">
                      آزمون تشخیصی تسلط مفهومی
                    </div>
                    <p className="text-white/50 font-fa text-xs max-w-md mx-auto leading-relaxed" dir="rtl">
                      سوالات این آزمون دقیقاً و منحصراً بر اساس متن همین جزوه طراحی می‌شوند تا تسلط واقعی شما ارزیابی شده و گیت شناختی درس تایید شود.
                    </p>
                  </div>
                  <button
                    onClick={handleFetchQuiz}
                    disabled={isLoadingQuiz}
                    className="text-xs font-fa px-5 py-2.5 rounded-xl bg-[#06B6D4] text-black font-bold hover:bg-[#06B6D4]/90 transition-all cursor-pointer shadow-md shadow-[#06B6D4]/15"
                  >
                    شروع آزمون تشخیصی ۳ سوالی 🚀
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AI MENTOR */}
          {activeTab === "mentor" && (
            <div className="space-y-3">
              <div className="p-3 bg-[#06B6D4]/10 border border-[#06B6D4]/20 rounded-xl space-y-1">
                <div className="text-xs font-bold text-[#06B6D4]">
                  Principal AI Systems Architect
                </div>
                <p className="text-[10.5px] sm:text-[11px] text-white/55 font-fa leading-normal" dir="rtl">
                  هر پرسشی درباره معماری لایه‌های پایین، تخصیص حافظه، کرنل، یا ابزارهای مدرن سیستم دارید بپرسید:
                </p>
              </div>

              {/* Quick Prompts */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "How does this map to hardware memory layout?",
                  "Common performance bottlenecks and pitfalls?",
                  "Show an optimal system code snippet in C/Rust.",
                ].map((quickQ, qIdx) => (
                  <button
                    key={qIdx}
                    disabled={isAskingTutor}
                    onClick={() => handleAskTutor(quickQ)}
                    className="text-[9.5px] sm:text-[10px] font-mono bg-white/[0.03] hover:bg-white/[0.06] text-white/70 px-2 py-1 rounded-lg border border-white/[0.06] transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    ⚡ {quickQ}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={tutorQuestion}
                  onChange={(e) => setTutorQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAskTutor();
                    }
                  }}
                  placeholder="Ask a technical systems question..."
                  className="flex-1 bg-[#080808] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#06B6D4]/60 font-sans"
                />
                <button
                  onClick={() => handleAskTutor()}
                  disabled={isAskingTutor || !tutorQuestion.trim()}
                  className="px-3 sm:px-3.5 py-2 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-black font-bold rounded-xl text-xs transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {isAskingTutor ? "..." : "Ask"}
                </button>
              </div>

              {/* Conversation History */}
              {tutorHistory.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  {tutorHistory.map((item, idx) => (
                    <div key={idx} className="bg-[#080808] p-3 rounded-xl border border-white/[0.04] space-y-1.5">
                      <div className="text-xs font-semibold text-[#06B6D4]">
                        Q: {item.q}
                      </div>
                      <div className="lecture-prose text-xs text-white/80 leading-relaxed bg-[#050505] p-2.5 rounded-lg border border-white/[0.04]">
                        <Markdown>{item.a}</Markdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Difficulty Rating Stars */}
          <div className="pt-2.5 sm:pt-3 border-t border-white/[0.05] flex items-center justify-between gap-2">
            <div className="text-[9.5px] sm:text-[10px] text-white/40 font-mono uppercase tracking-wider">
              Perceived Difficulty:
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficultyRating(lessonId, lvl)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    diffRating >= lvl
                      ? "bg-[#F59E0B] text-black shadow-sm"
                      : "bg-white/[0.03] hover:bg-white/[0.06] text-white/40 border border-white/[0.04]"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Validation Error Toast if user tries to complete while gated */}
        {validationError && (
          <div className="px-3.5 py-2 bg-[#EF4444]/15 border-t border-[#EF4444]/30 text-[10.5px] sm:text-[11px] text-[#EF4444] flex items-center justify-between font-fa flex-shrink-0" dir="rtl">
            <div className="flex items-center gap-1.5 truncate">
              <span>⚠️</span>
              <span className="truncate">{validationError}</span>
            </div>
            <button
              onClick={() => setValidationError(null)}
              className="text-white/40 hover:text-white text-xs px-1 cursor-pointer font-mono flex-shrink-0"
            >
              ✕
            </button>
          </div>
        )}

            {/* Modal Footer */}
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-white/[0.05] bg-[#080808] flex items-center justify-between gap-2 flex-shrink-0">
              {/* Cognitive Mastery Gate Indicators */}
              <div className="flex items-center gap-1.5 text-[8.5px] sm:text-[9.5px] font-mono">
                <span className={hasNote ? "text-[#10B981] font-bold" : "text-white/25"}>
                  {hasNote ? "✓" : "○"} Note
                </span>
                <span className={hasFeynman ? "text-[#10B981] font-bold" : "text-white/25"}>
                  {hasFeynman ? "✓" : "○"} Feynman
                </span>
                <span className={!gateStatus.needQuizPass ? "text-[#10B981] font-bold" : "text-white/25"}>
                  {!gateStatus.needQuizPass ? "✓" : "○"} Quiz
                </span>
                <span className={hasDiff ? "text-[#10B981] font-bold" : "text-white/25"}>
                  {hasDiff ? "✓" : "○"} Stars
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (isCompleted) {
                      toggleLesson(lessonId);
                      onClose();
                      return;
                    }

                    if (!gateStatus.canComplete) {
                      const reason = gateStatus.unmetReasons[0] || "شرایط تکمیل این درس هنوز فراهم نشده است.";
                      setValidationError(reason);
                      return;
                    }

                    const res = toggleLesson(lessonId);
                    if (res.success) {
                      onClose();
                    } else {
                      setValidationError(res.reason || "خطا در ثبت درس.");
                    }
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isCompleted
                      ? "bg-white/[0.05] hover:bg-white/[0.08] text-white/70 border border-white/[0.05]"
                      : gateStatus.canComplete
                      ? "bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-black shadow-md shadow-[#F59E0B]/10 active:scale-98"
                      : "bg-white/[0.03] text-white/35 border border-white/[0.04] hover:bg-white/[0.05]"
                  }`}
                >
                  {isCompleted ? (
                    <span>Mark Incomplete</span>
                  ) : gateStatus.canComplete ? (
                    <>
                      <span>✓</span>
                      <span>Complete Lesson</span>
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      <span>Complete Lesson</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
