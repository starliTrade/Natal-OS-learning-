export interface Lesson {
  en: string;
  fa: string;
  duration?: string;
  keyConcepts?: string[];
}

export interface Module {
  id: string;
  title: string;
  fa: string;
  lessons: Lesson[];
}

export interface Project {
  id: string;
  title: string;
  fa: string;
  description?: string;
}

export interface Phase {
  id: number | string;
  title: string;
  fa: string;
  dur: string;
  col: string; // color identifier e.g. "cyan", "indigo", "emerald", "amber", "rose", "sky", "teal", "purple"
  mods: Module[];
  projs: Project[];
}

export interface SM2CardData {
  ef: number;        // Ease factor (default: 2.5, min: 1.3)
  reps: number;      // Repetition count
  interval: number;  // Interval in days
  last: number;      // Timestamp of last review
  dueAt: number | null; // Timestamp when card is due
  lapses?: number;   // Number of failed recall attempts
  relearn?: boolean; // True if card failed and is in relearning queue
  isLeech?: boolean; // True if card repeatedly fails (>= 3 lapses)
}

export interface NoteEntry {
  text: string;
  updatedAt: number;
}

export interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  takenAt: number;
  answers: number[];
}

export interface DailyCycle {
  lessonIds: string[];
  budget: number;
  dueCountAtStart: number;
  reviewLoadAtStart: number;
  startedAt: number;
  unlockAt: number | null;
  transient?: boolean;
}

export interface DailyBudgetInfo {
  budget: number;          // Number of new lessons allowed today
  reviewLoad: number;      // Weighted cognitive load of reviews
  personalCeiling: number; // 2 for starter, 3 for sustained
  dueCount: number;        // Raw number of due review cards
  pacePreference?: "relaxed" | "standard" | "intensive";
}

export interface DueReviewItem {
  id: string;
  title: string;
  fa: string;
  phase: string;
  module: string;
  dueAt: number;
  overdueDays: number;
  relearn: boolean;
  isProject?: boolean;
  risky?: boolean;
  isLeech?: boolean;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface LessonGateStatus {
  canComplete: boolean;
  isUnlocked: boolean;          // Prerequisites satisfied
  isGateLocked: boolean;        // Reviews are due (SM-2 gate locked)
  isBudgetExceeded: boolean;    // Today's daily budget exhausted
  isTriFoldReady: boolean;      // Notes + Feynman + Difficulty ready
  needQuizPass: boolean;        // Diagnostic quiz pass requirement
  quizResult?: QuizResult;      // Stored score
  unmetReasons: string[];       // Human-readable list of what is holding it back
  prerequisiteTitle?: string;   // Title of prerequisite lesson if locked
  dueReviewsCount: number;      // Number of due reviews blocking new learning
  completedTodayCount: number;  // Lessons finished today
  dailyBudget: number;          // Max allowed for today
  needNote: boolean;
  needFeynman: boolean;
  needDifficulty: boolean;
}

export interface StudySession {
  date: string;
  duration: number;
  itemsCount: number;
  phase: number | string;
}

export interface NatalState {
  checked: string[];
  notes: Record<string, NoteEntry>;
  feynmanNotes: Record<string, NoteEntry>;
  aiMaterials: Record<string, { content: string; generatedAt: number }>;
  difficulty: Record<string, number>;
  checkDates: Record<string, string>;
  reviewData: Record<string, SM2CardData>;
  dailyPlan: Record<string, any> & { __active?: string };
  studySessions: StudySession[];
  quizResults: Record<string, QuizResult>;
  pacePreference: "relaxed" | "standard" | "intensive";
  activePhase: number;
  activeTab: "today" | "path" | "review" | "stats" | "you";
  pomodoroActive: boolean;
  pomodoroTimeLeft: number;
  pomodoroMode: "work" | "break";
  pomodoroTargetEnd?: number | null;
  pomodoroCompletedSessions?: number;
}
