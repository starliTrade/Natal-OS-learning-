import { DueReviewItem, Phase, SM2CardData, NoteEntry, DailyBudgetInfo, DailyCycle } from "../types";

export const COGNITIVE_CONSTANTS = Object.freeze({
  PLAN_CAPACITY: 6.0,
  NEW_LESSON_LOAD: 2.0,
  REVIEW_LOAD: 1.0,
  OVERDUE_REVIEW_LOAD: 1.25,
  WEAK_REVIEW_LOAD: 1.5,
  LOW_PACE_THRESHOLD: 2.0,
  STARTER_CEILING: 2,
  SUSTAINED_CEILING: 3,
  UNLOCK_MS: 86_400_000, // 24 hours
  SM2_INITIAL_EF: 2.5,
  SM2_MIN_EF: 1.3,
  FIRST_INTERVAL: 1,
  SECOND_INTERVAL: 6,
});

const tehranFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tehran",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getTodayDateString(d: Date = new Date()): string {
  const parts = tehranFormatter.formatToParts(d);
  const getVal = (t: string) => parts.find((p) => p.type === t)?.value || "00";
  return `${getVal("year")}-${getVal("month")}-${getVal("day")}`;
}

export function addDaysToDate(dateStr: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || "");
  const utc = match ? Date.UTC(+match[1], +match[2] - 1, +match[3]) : NaN;
  if (Number.isFinite(utc)) {
    return new Date(utc + 86_400_000 * days).toISOString().slice(0, 10);
  }
  return getTodayDateString();
}

export function lessonIdToKey(phaseId: number | string, modId: string, lessonIdx: number): string {
  return `${phaseId}-${modId}-l-${lessonIdx}`;
}

export function projectIdToKey(phaseId: number | string, projIdx: number): string {
  return `${phaseId}-proj-${projIdx}`;
}

export function parseLessonId(id: string, phases: Phase[]) {
  const parts = id.split("-");
  const phase = phases.find((p) => String(p.id) === parts[0]);
  if (!phase) return null;

  if (parts[1] === "proj") {
    const projIdx = parseInt(parts[2], 10);
    const proj = phase.projs[projIdx];
    return proj
      ? {
          title: `${proj.id} — ${proj.title}`,
          fa: proj.fa,
          phase: phase.title,
          isProject: true,
          risky: false,
        }
      : null;
  }

  const modId = parts[1];
  const lastL = parts.lastIndexOf("l");
  const lessonIdx = parseInt(parts[lastL + 1], 10);
  const mod = phase.mods.find((m) => m.id === modId);
  if (!mod) return null;
  const lesson = mod.lessons[lessonIdx];
  if (!lesson) return null;

  return {
    title: lesson.en,
    fa: lesson.fa,
    phase: phase.title,
    module: `${mod.id} ${mod.title}`,
    isProject: false,
    risky: mod.title.includes("⚠️") || (mod.fa || "").includes("⚠️"),
  };
}

export function isWeakCard(card?: SM2CardData): boolean {
  if (!card) return false;
  return card.ef < 2.0 || (card.lapses || 0) >= 2 || Boolean(card.isLeech);
}

export function isLeechCard(card?: SM2CardData): boolean {
  if (!card) return false;
  return Boolean(card.isLeech) || (card.lapses || 0) >= 3;
}

export function getDueReviews(phases: Phase[], checked: string[], reviewData: Record<string, SM2CardData>): DueReviewItem[] {
  const checkedSet = new Set(checked);
  const now = Date.now();
  const dueItems: DueReviewItem[] = [];

  for (const id of Object.keys(reviewData)) {
    if (!checkedSet.has(id)) continue;
    const card = reviewData[id];
    if (card.dueAt == null || card.dueAt > now) continue;

    const parsed = parseLessonId(id, phases);
    if (!parsed) continue;

    const overdueDays = Math.max(0, Math.floor((now - card.dueAt) / 86_400_000));
    const isLeech = isLeechCard(card);

    dueItems.push({
      id,
      title: parsed.title,
      fa: parsed.fa,
      phase: parsed.phase,
      module: parsed.module || "",
      dueAt: card.dueAt,
      overdueDays,
      relearn: Boolean(card.relearn),
      isProject: parsed.isProject,
      risky: parsed.risky,
      isLeech,
    });
  }

  // Priority queue: Relearning / Leeches first -> Overdue days descending -> Earlier dueAt
  return dueItems.sort((a, b) => {
    if ((a.relearn || a.isLeech) && !(b.relearn || b.isLeech)) return -1;
    if (!(a.relearn || a.isLeech) && (b.relearn || b.isLeech)) return 1;
    if (b.overdueDays !== a.overdueDays) return b.overdueDays - a.overdueDays;
    return a.dueAt - b.dueAt;
  });
}

export function calculateWeightedPace(checkDates: Record<string, string>): number {
  const dateValues = Object.values(checkDates);
  if (dateValues.length === 0) return 0;

  const today = getTodayDateString();
  const windowDays = Math.min(7, new Set(dateValues).size || 1);
  let totalWeightedChecks = 0;
  let totalWeights = 0;

  for (let i = 0; i < windowDays; i++) {
    const targetDate = addDaysToDate(today, -i);
    const count = dateValues.filter((d) => d === targetDate).length;
    const weight = windowDays - i;
    totalWeightedChecks += count * weight;
    totalWeights += weight;
  }

  return totalWeights > 0 ? totalWeightedChecks / totalWeights : 0;
}

export function calculateBudget(
  dueItems: DueReviewItem[],
  checkDates: Record<string, string>,
  reviewData: Record<string, SM2CardData>,
  pacePreference: "relaxed" | "standard" | "intensive" = "standard"
): DailyBudgetInfo {
  const reviewLoad = dueItems.reduce((acc, item) => {
    if (item.relearn || isWeakCard(reviewData[item.id])) {
      return acc + COGNITIVE_CONSTANTS.WEAK_REVIEW_LOAD;
    }
    if (item.overdueDays > 0) {
      return acc + COGNITIVE_CONSTANTS.OVERDUE_REVIEW_LOAD;
    }
    return acc + COGNITIVE_CONSTANTS.REVIEW_LOAD;
  }, 0);

  const pace = calculateWeightedPace(checkDates);
  
  // Base ceiling according to user pace preference & historical velocity
  let personalCeiling: number;
  let planCapacity: number;

  if (pacePreference === "relaxed") {
    personalCeiling = 2;
    planCapacity = 4.0;
  } else if (pacePreference === "intensive") {
    personalCeiling = 5;
    planCapacity = 10.0;
  } else {
    personalCeiling =
      pace < COGNITIVE_CONSTANTS.LOW_PACE_THRESHOLD
        ? COGNITIVE_CONSTANTS.STARTER_CEILING
        : COGNITIVE_CONSTANTS.SUSTAINED_CEILING;
    planCapacity = COGNITIVE_CONSTANTS.PLAN_CAPACITY;
  }

  const remainingCapacity = Math.max(0, planCapacity - reviewLoad);
  const budget = Math.min(personalCeiling, Math.floor(remainingCapacity / COGNITIVE_CONSTANTS.NEW_LESSON_LOAD));

  return {
    budget,
    reviewLoad: Math.round(reviewLoad * 10) / 10,
    personalCeiling,
    dueCount: dueItems.length,
    pacePreference,
  };
}

export function executeSM2(currentCard: SM2CardData, grade: number): SM2CardData {
  const now = Date.now();

  // If grade < 3 (failure/lapse)
  if (grade < 3) {
    const nextLapses = (currentCard.lapses || 0) + 1;
    const isLeech = nextLapses >= 3;
    // Extra EF damping if repeated failure (Leech)
    const nextEF = Math.max(
      COGNITIVE_CONSTANTS.SM2_MIN_EF,
      currentCard.ef - (isLeech ? 0.25 : 0.15)
    );

    return {
      ...currentCard,
      reps: 0,
      interval: COGNITIVE_CONSTANTS.FIRST_INTERVAL,
      ef: nextEF,
      lapses: nextLapses,
      dueAt: now, // due immediately for relearning
      relearn: true,
      isLeech,
      last: now,
    };
  }

  // If grade >= 3 (successful recall)
  const nextReps = currentCard.reps + 1;
  const overdueDays =
    currentCard.dueAt && now > currentCard.dueAt
      ? Math.floor((now - currentCard.dueAt) / 86_400_000)
      : 0;

  let nextInterval: number;
  if (nextReps === 1) {
    nextInterval = COGNITIVE_CONSTANTS.FIRST_INTERVAL;
  } else if (nextReps === 2) {
    nextInterval = COGNITIVE_CONSTANTS.SECOND_INTERVAL;
  } else {
    // Overdue scaling: if user remembered despite overdue (grade >= 4), reward with slight bonus interval
    const effectiveInterval =
      overdueDays > 1 && grade >= 4
        ? currentCard.interval + Math.floor(overdueDays * 0.25)
        : currentCard.interval;

    nextInterval = Math.round(effectiveInterval * currentCard.ef);
  }

  // Ease Factor calculation formula
  const deltaEF = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
  const nextEF = Math.max(
    COGNITIVE_CONSTANTS.SM2_MIN_EF,
    Math.min(COGNITIVE_CONSTANTS.SM2_INITIAL_EF, currentCard.ef + deltaEF)
  );

  // If grade is 5 on a previous leech, mark leech as resolved
  const isLeech = currentCard.isLeech && grade < 5;

  return {
    ...currentCard,
    reps: nextReps,
    interval: nextInterval,
    ef: nextEF,
    dueAt: now + nextInterval * 86_400_000,
    relearn: false,
    isLeech,
    last: now,
  };
}

export function isLessonReady(
  lessonId: string,
  notes: Record<string, NoteEntry>,
  feynmanNotes: Record<string, NoteEntry>,
  difficulty: Record<string, number>
): boolean {
  const noteOk = Boolean(notes[lessonId] && notes[lessonId].text.trim().length > 0);
  const feynmanOk = Boolean(feynmanNotes[lessonId] && feynmanNotes[lessonId].text.trim().length > 0);
  const diffOk = Boolean(difficulty[lessonId] && Number(difficulty[lessonId]) > 0);
  return noteOk && feynmanOk && diffOk;
}

export interface CurriculumItemInfo {
  id: string;
  title: string;
  fa: string;
  phaseId: number | string;
  phaseTitle: string;
  modId?: string;
  modTitle?: string;
  isProject: boolean;
}

export function getCurriculumOrderedItems(phases: Phase[]): CurriculumItemInfo[] {
  const items: CurriculumItemInfo[] = [];

  for (const phase of phases) {
    for (const mod of phase.mods) {
      for (let i = 0; i < mod.lessons.length; i++) {
        const lesson = mod.lessons[i];
        items.push({
          id: lessonIdToKey(phase.id, mod.id, i),
          title: lesson.en,
          fa: lesson.fa,
          phaseId: phase.id,
          phaseTitle: phase.title,
          modId: mod.id,
          modTitle: mod.title,
          isProject: false,
        });
      }
    }

    if (phase.projs && phase.projs.length > 0) {
      for (let p = 0; p < phase.projs.length; p++) {
        const proj = phase.projs[p];
        items.push({
          id: projectIdToKey(phase.id, p),
          title: `${proj.id}: ${proj.title}`,
          fa: proj.fa,
          phaseId: phase.id,
          phaseTitle: phase.title,
          isProject: true,
        });
      }
    }
  }

  return items;
}
