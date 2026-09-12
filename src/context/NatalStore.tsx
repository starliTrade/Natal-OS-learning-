import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { DEFAULT_CURRICULUM } from "../data/defaultCurriculum";
import {
  Phase,
  NatalState,
  SM2CardData,
  NoteEntry,
  DueReviewItem,
  DailyBudgetInfo,
  DailyCycle,
  LessonGateStatus,
} from "../types";
import {
  COGNITIVE_CONSTANTS,
  executeSM2,
  getDueReviews,
  calculateBudget,
  getTodayDateString,
  getCognitiveDateString,
  getNextCutoffTimestamp,
  lessonIdToKey,
  projectIdToKey,
  parseLessonId,
  getCurriculumOrderedItems,
} from "../engine/sm2";
import {
  playAcousticChime,
  requestSystemNotificationPermission,
  sendSystemNotification,
} from "../engine/audioNotification";

interface NatalContextType extends NatalState {
  phases: Phase[];
  setPhases: (phases: Phase[]) => void;
  dueReviews: DueReviewItem[];
  budgetInfo: DailyBudgetInfo;
  isGateOpen: boolean;
  activePlan: DailyCycle | null;
  toggleLesson: (lessonId: string, force?: boolean) => { success: boolean; reason?: string };
  getLessonGateStatus: (lessonId: string) => LessonGateStatus;
  saveNote: (lessonId: string, text: string) => void;
  saveFeynman: (lessonId: string, text: string) => void;
  setDifficultyRating: (lessonId: string, rating: number) => void;
  saveAiMaterial: (lessonId: string, content: string) => void;
  saveQuizResult: (lessonId: string, score: number, total: number, answers: number[]) => void;
  setPacePreference: (pace: "relaxed" | "standard" | "intensive") => void;
  submitReviewGrade: (lessonId: string, grade: number) => void;
  ensurePlan: () => void;
  unlockPlanNow: () => void;
  setActiveTab: (tab: NatalState["activeTab"]) => void;
  togglePomodoro: () => void;
  resetPomodoro: () => void;
  setPomodoroMode: (mode: "work" | "break") => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  resetAllData: () => void;
  resetToDefaultCurriculum: () => void;
  totalLessonsCount: number;
  completedLessonsCount: number;
}

const NatalContext = createContext<NatalContextType | null>(null);

const STORAGE_KEY = "natal-v3";
const CURRICULUM_KEY = "natal-curriculum-v4.1-final";
const POMODORO_STORAGE_KEY = "natal-pomodoro-sync-v3";

export const NatalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phases, setPhasesState] = useState<Phase[]>(() => {
    try {
      const saved = localStorage.getItem(CURRICULUM_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load saved curriculum:", e);
    }
    return DEFAULT_CURRICULUM;
  });

  const setPhases = (newPhases: Phase[]) => {
    setPhasesState(newPhases);
    try {
      localStorage.setItem(CURRICULUM_KEY, JSON.stringify(newPhases));
    } catch (e) {
      console.error("Failed to persist curriculum:", e);
    }
  };

  const [state, setState] = useState<NatalState>(() => {
    const defaultState: NatalState = {
      checked: [],
      notes: {},
      feynmanNotes: {},
      aiMaterials: {},
      difficulty: {},
      checkDates: {},
      reviewData: {},
      dailyPlan: {},
      studySessions: [],
      quizResults: {},
      pacePreference: "standard",
      activePhase: 0,
      activeTab: "today",
      pomodoroActive: false,
      pomodoroTimeLeft: 25 * 60,
      pomodoroMode: "work",
      pomodoroTargetEnd: null,
      pomodoroCompletedSessions: 0,
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      let parsedState = defaultState;
      if (saved) {
        parsedState = { ...defaultState, ...JSON.parse(saved), activeTab: "today" };
      }

      // Restore synchronized Pomodoro state if available
      const savedPomo = localStorage.getItem(POMODORO_STORAGE_KEY);
      if (savedPomo) {
        const parsedPomo = JSON.parse(savedPomo);
        if (parsedPomo.pomodoroActive && parsedPomo.pomodoroTargetEnd) {
          const now = Date.now();
          const remainingSec = Math.max(0, Math.ceil((parsedPomo.pomodoroTargetEnd - now) / 1000));
          if (remainingSec > 0) {
            parsedState = {
              ...parsedState,
              pomodoroActive: true,
              pomodoroTargetEnd: parsedPomo.pomodoroTargetEnd,
              pomodoroTimeLeft: remainingSec,
              pomodoroMode: parsedPomo.pomodoroMode || "work",
              pomodoroCompletedSessions: parsedPomo.pomodoroCompletedSessions || 0,
            };
          } else {
            // Completed while offline/closed
            const nextMode = parsedPomo.pomodoroMode === "work" ? "break" : "work";
            const nextTime = nextMode === "work" ? 25 * 60 : 5 * 60;
            parsedState = {
              ...parsedState,
              pomodoroActive: false,
              pomodoroTargetEnd: null,
              pomodoroTimeLeft: nextTime,
              pomodoroMode: nextMode,
              pomodoroCompletedSessions: (parsedPomo.pomodoroCompletedSessions || 0) + (parsedPomo.pomodoroMode === "work" ? 1 : 0),
            };
          }
        } else if (parsedPomo.pomodoroTimeLeft) {
          parsedState = {
            ...parsedState,
            pomodoroActive: false,
            pomodoroTimeLeft: parsedPomo.pomodoroTimeLeft,
            pomodoroMode: parsedPomo.pomodoroMode || "work",
            pomodoroCompletedSessions: parsedPomo.pomodoroCompletedSessions || 0,
          };
        }
      }

      return parsedState;
    } catch (err) {
      console.error("Failed to load natal state:", err);
    }
    return defaultState;
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      const {
        pomodoroActive,
        pomodoroTimeLeft,
        pomodoroMode,
        pomodoroTargetEnd,
        pomodoroCompletedSessions,
        ...persistable
      } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
      localStorage.setItem(
        POMODORO_STORAGE_KEY,
        JSON.stringify({
          pomodoroActive,
          pomodoroTimeLeft,
          pomodoroMode,
          pomodoroTargetEnd,
          pomodoroCompletedSessions,
        })
      );
    } catch (e) {
      console.error("Failed to persist state:", e);
    }
  }, [state]);

  // High-Precision Wall-Clock Epoch Pomodoro Timer & Tab Title & Notification Sync
  useEffect(() => {
    let interval: any = null;

    const checkTimerSync = () => {
      if (!state.pomodoroActive || !state.pomodoroTargetEnd) {
        if (!state.pomodoroActive) {
          if (document.title.includes("Focus") || document.title.includes("Break")) {
            document.title = "Natal AI • Systems Roadmap";
          }
        }
        return;
      }

      const now = Date.now();
      const remainingMs = state.pomodoroTargetEnd - now;
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      if (remainingSec <= 0) {
        // Complete current cycle!
        if (state.pomodoroMode === "work") {
          playAcousticChime("complete");
          sendSystemNotification(
            "🎯 پایان دوره تمرکز عمیق ۲۵ دقیقه‌ای!",
            "خسته نباشید! اکنون زمان ۵ دقیقه استراحت و ریست شناختی است."
          );
          setState((prev) => ({
            ...prev,
            pomodoroMode: "break",
            pomodoroTimeLeft: 5 * 60,
            pomodoroActive: false,
            pomodoroTargetEnd: null,
            pomodoroCompletedSessions: (prev.pomodoroCompletedSessions || 0) + 1,
          }));
        } else {
          playAcousticChime("start");
          sendSystemNotification(
            "⚡ پایان ۵ دقیقه استراحت",
            "ذهن شما بازیابی شد. آماده شروع چرخه ۲۵ دقیقه‌ای تمرکز بعدی هستید؟"
          );
          setState((prev) => ({
            ...prev,
            pomodoroMode: "work",
            pomodoroTimeLeft: 25 * 60,
            pomodoroActive: false,
            pomodoroTargetEnd: null,
          }));
        }
      } else {
        // Update countdown & browser tab title in real-time
        setState((prev) =>
          prev.pomodoroTimeLeft !== remainingSec ? { ...prev, pomodoroTimeLeft: remainingSec } : prev
        );

        const minutes = Math.floor(remainingSec / 60);
        const seconds = String(remainingSec % 60).padStart(2, "0");
        const modeLabel = state.pomodoroMode === "work" ? "🧠 Focus" : "☕ Break";
        document.title = `[${minutes}:${seconds}] ${modeLabel} | Natal AI`;
      }
    };

    if (state.pomodoroActive) {
      checkTimerSync();
      interval = setInterval(checkTimerSync, 500);
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkTimerSync();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [state.pomodoroActive, state.pomodoroTargetEnd, state.pomodoroMode]);

  // Derived: All due reviews computed with priority queue
  const dueReviews = useMemo(() => {
    return getDueReviews(phases, state.checked, state.reviewData);
  }, [phases, state.checked, state.reviewData]);

  // Daily gate is open only when there are zero overdue/due reviews
  const isGateOpen = dueReviews.length === 0;

  // Derived: Cognitive load & budget
  const budgetInfo = useMemo(() => {
    return calculateBudget(dueReviews, state.checkDates, state.reviewData, state.pacePreference);
  }, [dueReviews, state.checkDates, state.reviewData, state.pacePreference]);

  // Derived: Count total lessons
  const { totalLessonsCount, completedLessonsCount } = useMemo(() => {
    let total = 0;
    phases.forEach((p) => {
      p.mods.forEach((m) => {
        total += m.lessons.length;
      });
      total += p.projs.length;
    });
    return {
      totalLessonsCount: total,
      completedLessonsCount: state.checked.length,
    };
  }, [phases, state.checked]);

  // Active Daily Plan for today
  const todayKey = getTodayDateString();
  const activePlan: DailyCycle | null = useMemo(() => {
    const activeId = state.dailyPlan.__active || todayKey;
    return state.dailyPlan[activeId] || null;
  }, [state.dailyPlan, todayKey]);

  // Ensure daily plan logic with standard cognitive day cutoff (04:00 AM rollover)
  const ensurePlan = () => {
    const today = getTodayDateString();
    const currentActiveId = state.dailyPlan.__active;

    // If an active plan exists for today's cognitive date and unlockAt has not passed, keep it
    if (currentActiveId && state.dailyPlan[currentActiveId]) {
      const plan = state.dailyPlan[currentActiveId];
      if (currentActiveId === today && plan.unlockAt && Date.now() < plan.unlockAt) {
        return;
      }
    }

    // Otherwise generate or refresh today's plan
    const checkedSet = new Set(state.checked);
    const uncompletedLessons: string[] = [];
    const orderedItems = getCurriculumOrderedItems(phases);

    // Find the next available uncompleted lessons strictly in curriculum sequence
    for (const item of orderedItems) {
      if (!checkedSet.has(item.id)) {
        uncompletedLessons.push(item.id);
        if (uncompletedLessons.length >= budgetInfo.budget) break;
      }
    }

    const nextCutoff = getNextCutoffTimestamp();

    const newCycle: DailyCycle = {
      lessonIds: uncompletedLessons,
      budget: budgetInfo.budget,
      dueCountAtStart: dueReviews.length,
      reviewLoadAtStart: budgetInfo.reviewLoad,
      startedAt: Date.now(),
      unlockAt: nextCutoff,
    };

    setState((prev) => ({
      ...prev,
      dailyPlan: {
        ...prev.dailyPlan,
        [today]: newCycle,
        __active: today,
      },
    }));
  };

  // Run ensurePlan on mount and periodically check for 04:00 AM cognitive day boundary transitions
  useEffect(() => {
    ensurePlan();

    const checkInterval = setInterval(() => {
      const today = getTodayDateString();
      const currentActiveId = state.dailyPlan.__active;
      if (currentActiveId !== today) {
        ensurePlan();
      }
    }, 15000);

    const onFocus = () => {
      ensurePlan();
    };

    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(checkInterval);
      window.removeEventListener("focus", onFocus);
    };
  }, [phases, state.dailyPlan.__active, state.checked.length, budgetInfo.budget]);

  // Comprehensive Pedagogical Gate & Progression Validator
  const getLessonGateStatus = (lessonId: string): LessonGateStatus => {
    const isDone = state.checked.includes(lessonId);
    const today = getTodayDateString();
    const completedTodayCount = Object.values(state.checkDates).filter((d) => d === today).length;
    const isBudgetExceeded = !isDone && budgetInfo.budget > 0 && completedTodayCount >= budgetInfo.budget;
    const isGateLocked = dueReviews.length > 0;

    // Prerequisites validation across the entire ordered curriculum
    const orderedItems = getCurriculumOrderedItems(phases);
    const itemIndex = orderedItems.findIndex((it) => it.id === lessonId);

    let isUnlocked = true;
    let prerequisiteTitle: string | undefined = undefined;
    let prerequisiteId: string | undefined = undefined;

    if (itemIndex > 0) {
      // Find the first uncompleted prior item in sequence
      for (let idx = 0; idx < itemIndex; idx++) {
        if (!state.checked.includes(orderedItems[idx].id)) {
          isUnlocked = false;
          const missingItem = orderedItems[idx];
          prerequisiteTitle = `${missingItem.phaseTitle} • ${missingItem.title}`;
          prerequisiteId = missingItem.id;
          break;
        }
      }
    }

    // Tri-fold active recall and mastery check (min 15 chars note, min 15 chars feynman, rating 1-5, and quiz passed for lessons)
    const isProject = lessonId.includes("-proj-");
    const noteEntry = state.notes[lessonId];
    const feynmanEntry = state.feynmanNotes[lessonId];
    const diffRating = state.difficulty[lessonId] || 0;
    const quizResult = state.quizResults?.[lessonId];

    const needNote = !isProject && !(noteEntry && noteEntry.text.trim().length >= 15);
    const needFeynman = !isProject && !(feynmanEntry && feynmanEntry.text.trim().length >= 15);
    const needDifficulty = !isProject && !(diffRating >= 1 && diffRating <= 5);
    const needQuizPass = !isProject && !(quizResult && quizResult.passed);
    const isTriFoldReady = isProject || (!needNote && !needFeynman && !needDifficulty);

    const unmetReasons: string[] = [];
    if (!isUnlocked && prerequisiteTitle) {
      unmetReasons.push(`پیش‌نیاز تکمیل نشده است: ابتدا «${prerequisiteTitle}» را مطالعه و تایید کنید.`);
    }
    if (isGateLocked) {
      unmetReasons.push(`قفل مرور فعال است: شما ${dueReviews.length} کارت موعدرسیده در صف SM-2 دارید. مرور کارت‌ها جهت جلوگیری از فراموشی الزامی است.`);
    }
    if (isBudgetExceeded) {
      unmetReasons.push(`سقف ظرفیت شناختی امروز پر شده است (${completedTodayCount} از ${budgetInfo.budget} درس مجاز). مغز شما برای تثبیت حافظه به استراحت نیاز دارد.`);
    }
    if (needNote) {
      unmetReasons.push("یادداشت تحلیلی مهندسی ثبت نشده است (حداقل ۱۵ کاراکتر).");
    }
    if (needFeynman) {
      unmetReasons.push("تبیین مفهومی با تکنیک فاینمن ثبت نشده است (حداقل ۱۵ کاراکتر).");
    }
    if (needDifficulty) {
      unmetReasons.push("درجه سختی ادراک‌شده (۱ تا ۵ ستاره) برای کالیبره‌سازی ضریب EF الگوریتم SM-2 انتخاب نشده است.");
    }
    if (needQuizPass) {
      unmetReasons.push("قبولی در آزمون تشخیصی ۳ سوالی ثبت نشده است (حداقل ۲ پاسخ صحیح از ۳).");
    }

    const canComplete = isUnlocked && !isGateLocked && !isBudgetExceeded && isTriFoldReady && !needQuizPass;

    return {
      canComplete,
      isUnlocked,
      isGateLocked,
      isBudgetExceeded,
      isTriFoldReady,
      needQuizPass,
      quizResult,
      unmetReasons,
      prerequisiteTitle,
      prerequisiteId,
      dueReviewsCount: dueReviews.length,
      completedTodayCount,
      dailyBudget: budgetInfo.budget,
      needNote,
      needFeynman,
      needDifficulty,
    };
  };

  // Toggle completion of a lesson with cognitive gate enforcement
  const toggleLesson = (lessonId: string, force = false): { success: boolean; reason?: string } => {
    const isChecked = state.checked.includes(lessonId);

    if (isChecked) {
      // Unchecking to relearn is always allowed
      setState((prev) => {
        const nextChecked = prev.checked.filter((id) => id !== lessonId);
        const { [lessonId]: _, ...nextDates } = prev.checkDates;
        const { [lessonId]: __, ...nextReview } = prev.reviewData;
        return {
          ...prev,
          checked: nextChecked,
          checkDates: nextDates,
          reviewData: nextReview,
        };
      });
      return { success: true };
    }

    // Gating check for marking as complete
    if (!force) {
      const status = getLessonGateStatus(lessonId);
      if (!status.canComplete) {
        return {
          success: false,
          reason: status.unmetReasons[0] || "شرایط شناختی و سه‌گانه تکمیل این درس فراهم نیست.",
        };
      }
    }

    const today = getTodayDateString();
    const diffRating = state.difficulty[lessonId] || 3;

    // Dynamically calibrate initial Ease Factor according to perceived difficulty:
    // 1: 2.7 (Very easy), 2: 2.6, 3: 2.5 (Normal), 4: 2.3 (Challenging), 5: 2.1 (Hard)
    const calibratedEf =
      diffRating === 5 ? 2.1 :
      diffRating === 4 ? 2.3 :
      diffRating === 2 ? 2.6 :
      diffRating === 1 ? 2.7 :
      COGNITIVE_CONSTANTS.SM2_INITIAL_EF;

    setState((prev) => {
      const nextChecked = [...prev.checked, lessonId];
      const nextDates = { ...prev.checkDates, [lessonId]: today };

      // Initialize SM-2 card: first repetition due in 24 hours
      const newCard: SM2CardData = {
        ef: calibratedEf,
        reps: 0,
        interval: COGNITIVE_CONSTANTS.FIRST_INTERVAL,
        last: Date.now(),
        dueAt: Date.now() + COGNITIVE_CONSTANTS.UNLOCK_MS,
        lapses: 0,
        relearn: false,
      };

      const nextReview = { ...prev.reviewData, [lessonId]: newCard };

      return {
        ...prev,
        checked: nextChecked,
        checkDates: nextDates,
        reviewData: nextReview,
      };
    });

    return { success: true };
  };

  const saveNote = (lessonId: string, text: string) => {
    setState((prev) => ({
      ...prev,
      notes: {
        ...prev.notes,
        [lessonId]: { text, updatedAt: Date.now() },
      },
    }));
  };

  const saveFeynman = (lessonId: string, text: string) => {
    setState((prev) => ({
      ...prev,
      feynmanNotes: {
        ...prev.feynmanNotes,
        [lessonId]: { text, updatedAt: Date.now() },
      },
    }));
  };

  const setDifficultyRating = (lessonId: string, rating: number) => {
    setState((prev) => ({
      ...prev,
      difficulty: {
        ...prev.difficulty,
        [lessonId]: rating,
      },
    }));
  };

  const saveAiMaterial = (lessonId: string, content: string) => {
    setState((prev) => ({
      ...prev,
      aiMaterials: {
        ...prev.aiMaterials,
        [lessonId]: { content, generatedAt: Date.now() },
      },
    }));
  };

  const saveQuizResult = (lessonId: string, score: number, total: number, answers: number[]) => {
    const passed = total > 0 && score >= Math.ceil(total * 0.66);
    setState((prev) => ({
      ...prev,
      quizResults: {
        ...(prev.quizResults || {}),
        [lessonId]: { score, total, passed, takenAt: Date.now(), answers },
      },
    }));
  };

  const setPacePreference = (pace: "relaxed" | "standard" | "intensive") => {
    setState((prev) => ({
      ...prev,
      pacePreference: pace,
    }));
  };

  const submitReviewGrade = (lessonId: string, grade: number) => {
    setState((prev) => {
      const currentCard = prev.reviewData[lessonId] || {
        ef: COGNITIVE_CONSTANTS.SM2_INITIAL_EF,
        reps: 0,
        interval: 1,
        last: Date.now(),
        dueAt: Date.now(),
        lapses: 0,
        relearn: false,
      };

      const updatedCard = executeSM2(currentCard, grade);

      return {
        ...prev,
        reviewData: {
          ...prev.reviewData,
          [lessonId]: updatedCard,
        },
      };
    });
  };

  const unlockPlanNow = () => {
    const today = getTodayDateString();
    const checkedSet = new Set(state.checked);
    const orderedItems = getCurriculumOrderedItems(phases);

    setState((prev) => {
      const activeKey = prev.dailyPlan.__active || today;
      const current = prev.dailyPlan[activeKey] || {
        lessonIds: [],
        budget: 2,
        dueCountAtStart: 0,
        reviewLoadAtStart: 0,
        startedAt: Date.now(),
        unlockAt: Date.now(),
      };

      const currentList = current.lessonIds || [];
      const currentListSet = new Set(currentList);
      const additionalLessons: string[] = [];

      for (const item of orderedItems) {
        if (!checkedSet.has(item.id) && !currentListSet.has(item.id)) {
          additionalLessons.push(item.id);
          if (additionalLessons.length >= 2) break;
        }
      }

      return {
        ...prev,
        dailyPlan: {
          ...prev.dailyPlan,
          [activeKey]: {
            ...current,
            lessonIds: [...currentList, ...additionalLessons],
            budget: currentList.length + additionalLessons.length,
            unlockAt: Date.now() - 1000,
          },
          __active: activeKey,
        },
      };
    });
  };

  const setActiveTab = (tab: NatalState["activeTab"]) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  const togglePomodoro = () => {
    setState((prev) => {
      if (prev.pomodoroActive) {
        // Pausing timer: preserve exact remaining seconds
        const remainingSec = prev.pomodoroTargetEnd
          ? Math.max(0, Math.ceil((prev.pomodoroTargetEnd - Date.now()) / 1000))
          : prev.pomodoroTimeLeft;
        return {
          ...prev,
          pomodoroActive: false,
          pomodoroTargetEnd: null,
          pomodoroTimeLeft: remainingSec,
        };
      } else {
        // Starting timer: request notification permission & set epoch target
        requestSystemNotificationPermission().catch(() => {});
        playAcousticChime("start");
        const duration =
          prev.pomodoroTimeLeft > 0
            ? prev.pomodoroTimeLeft
            : prev.pomodoroMode === "work"
            ? 25 * 60
            : 5 * 60;
        const targetEnd = Date.now() + duration * 1000;
        return {
          ...prev,
          pomodoroActive: true,
          pomodoroTargetEnd: targetEnd,
          pomodoroTimeLeft: duration,
        };
      }
    });
  };

  const resetPomodoro = () => {
    setState((prev) => ({
      ...prev,
      pomodoroActive: false,
      pomodoroTargetEnd: null,
      pomodoroTimeLeft: prev.pomodoroMode === "work" ? 25 * 60 : 5 * 60,
    }));
  };

  const setPomodoroMode = (mode: "work" | "break") => {
    setState((prev) => ({
      ...prev,
      pomodoroMode: mode,
      pomodoroActive: false,
      pomodoroTargetEnd: null,
      pomodoroTimeLeft: mode === "work" ? 25 * 60 : 5 * 60,
    }));
  };

  const exportData = () => {
    const { pomodoroActive, pomodoroTimeLeft, pomodoroMode, pomodoroTargetEnd, ...data } = state;
    return JSON.stringify({ state: data, phases }, null, 2);
  };

  const importData = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.state) {
        setState((prev) => ({ ...prev, ...parsed.state }));
        if (parsed.phases) {
          setPhases(parsed.phases);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error("Invalid backup json", e);
      return false;
    }
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRICULUM_KEY);
    window.location.reload();
  };

  const resetToDefaultCurriculum = () => {
    setPhases(DEFAULT_CURRICULUM);
  };

  return (
    <NatalContext.Provider
      value={{
        ...state,
        phases,
        setPhases,
        dueReviews,
        budgetInfo,
        isGateOpen,
        activePlan,
        toggleLesson,
        getLessonGateStatus,
        saveNote,
        saveFeynman,
        setDifficultyRating,
        saveAiMaterial,
        saveQuizResult,
        setPacePreference,
        submitReviewGrade,
        ensurePlan,
        unlockPlanNow,
        setActiveTab,
        togglePomodoro,
        resetPomodoro,
        setPomodoroMode,
        exportData,
        importData,
        resetAllData,
        resetToDefaultCurriculum,
        totalLessonsCount,
        completedLessonsCount,
      }}
    >
      {children}
    </NatalContext.Provider>
  );
};

export const useNatal = () => {
  const ctx = useContext(NatalContext);
  if (!ctx) {
    throw new Error("useNatal must be used within NatalProvider");
  }
  return ctx;
};
