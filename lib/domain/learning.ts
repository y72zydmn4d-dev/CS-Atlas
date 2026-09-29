import type { ConceptId } from "@/lib/domain/concepts";

export const learningEventTypes = [
  "lesson-completed",
  "lesson-status-changed",
  "exercise-attempted",
  "exercise-solved",
  "problem-public-run",
  "problem-solved",
  "problem-public-completion-imported",
  "study-plan-item-completed",
] as const;

export type LearningEventType = (typeof learningEventTypes)[number];
export type LearningEntityType = "concept" | "lesson" | "exercise" | "problem" | "roadmap" | "resource";
export type LearningEvidenceSource = "browser-local" | "browser-public" | "local-study-plan" | "legacy-local-snapshot";

export interface LearningEventTarget {
  type: LearningEntityType;
  id: string;
}

export interface LearningEvent {
  id: string;
  type: LearningEventType;
  conceptId: ConceptId;
  occurredAt: string;
  source: LearningEvidenceSource;
  sourceVersion?: number;
  /** Optional so the additive v1 event store remains readable. */
  target?: LearningEventTarget;
}

export const goalMetrics = ["lessons-completed", "exercises-solved", "problems-solved", "plan-items-completed"] as const;
export type GoalMetric = (typeof goalMetrics)[number];
export type GoalStatus = "active" | "completed" | "archived";
export type GoalRecurrence = "none" | "weekly" | "monthly";

export interface LearningGoal {
  id: string;
  title: string;
  metric: GoalMetric;
  targetCount: number;
  conceptIds: ConceptId[];
  deadline?: string;
  recurrence?: GoalRecurrence;
  timezone?: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlanItem {
  id: string;
  target: LearningEventTarget;
  conceptId: ConceptId;
  title: string;
  href: string;
  scheduledFor?: string;
  completedAt?: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  timezone: string;
  items: StudyPlanItem[];
  status: "active" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface GoalProgress {
  goalId: string;
  completedCount: number;
  targetCount: number;
  percent: number;
  isComplete: boolean;
}

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function isLearningEvent(value: unknown): value is LearningEvent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const event = value as Record<string, unknown>;
  const target = event.target;
  const hasValidTarget = target === undefined || Boolean(
    target && typeof target === "object" && !Array.isArray(target)
    && typeof (target as Record<string, unknown>).id === "string"
    && ["concept", "lesson", "exercise", "problem", "roadmap", "resource"].includes((target as Record<string, unknown>).type as string),
  );
  return typeof event.id === "string"
    && event.id.length > 0
    && typeof event.conceptId === "string"
    && event.conceptId.length > 0
    && typeof event.occurredAt === "string"
    && !Number.isNaN(Date.parse(event.occurredAt))
    && learningEventTypes.includes(event.type as LearningEventType)
    && ["browser-local", "browser-public", "local-study-plan", "legacy-local-snapshot"].includes(event.source as LearningEvidenceSource)
    && (event.sourceVersion === undefined || (typeof event.sourceVersion === "number" && Number.isInteger(event.sourceVersion) && event.sourceVersion > 0))
    && hasValidTarget;
}

export function isLearningGoal(value: unknown): value is LearningGoal {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const goal = value as Record<string, unknown>;
  return typeof goal.id === "string"
    && typeof goal.title === "string"
    && goal.title.trim().length > 0
    && goal.title.length <= 160
    && goalMetrics.includes(goal.metric as GoalMetric)
    && typeof goal.targetCount === "number"
    && Number.isInteger(goal.targetCount)
    && goal.targetCount > 0
    && Array.isArray(goal.conceptIds)
    && goal.conceptIds.every((id) => typeof id === "string" && id.length > 0)
    && (goal.deadline === undefined || (typeof goal.deadline === "string" && isoDatePattern.test(goal.deadline)))
    && (goal.recurrence === undefined || ["none", "weekly", "monthly"].includes(goal.recurrence as string))
    && (goal.timezone === undefined || (typeof goal.timezone === "string" && goal.timezone.length > 0 && goal.timezone.length <= 100))
    && ["active", "completed", "archived"].includes(goal.status as string)
    && typeof goal.createdAt === "string"
    && !Number.isNaN(Date.parse(goal.createdAt))
    && typeof goal.updatedAt === "string"
    && !Number.isNaN(Date.parse(goal.updatedAt));
}

export function isStudyPlan(value: unknown): value is StudyPlan {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const plan = value as Record<string, unknown>;
  if (typeof plan.id !== "string" || typeof plan.title !== "string" || !plan.title.trim() || plan.title.length > 160 || typeof plan.timezone !== "string" || !plan.timezone.trim() || !Array.isArray(plan.items) || !["active", "completed", "archived"].includes(plan.status as string) || typeof plan.createdAt !== "string" || Number.isNaN(Date.parse(plan.createdAt)) || typeof plan.updatedAt !== "string" || Number.isNaN(Date.parse(plan.updatedAt))) return false;
  return plan.items.every((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    const candidate = item as Record<string, unknown>;
    const target = candidate.target;
    return typeof candidate.id === "string"
      && typeof candidate.conceptId === "string"
      && typeof candidate.title === "string"
      && typeof candidate.href === "string"
      && target && typeof target === "object" && !Array.isArray(target)
      && typeof (target as Record<string, unknown>).id === "string"
      && ["concept", "lesson", "exercise", "problem", "roadmap", "resource"].includes((target as Record<string, unknown>).type as string)
      && (candidate.scheduledFor === undefined || (typeof candidate.scheduledFor === "string" && isoDatePattern.test(candidate.scheduledFor)))
      && (candidate.completedAt === undefined || (typeof candidate.completedAt === "string" && !Number.isNaN(Date.parse(candidate.completedAt))));
  });
}

function eventMatchesMetric(event: LearningEvent, metric: GoalMetric) {
  if (metric === "lessons-completed") return event.type === "lesson-completed";
  if (metric === "exercises-solved") return event.type === "exercise-solved";
  if (metric === "problems-solved") return event.type === "problem-solved" || event.type === "problem-public-completion-imported";
  return event.type === "study-plan-item-completed";
}

function calendarDate(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type: "year" | "month" | "day") => parts.find((item) => item.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function recurringPeriodStart(recurrence: GoalRecurrence, timezone: string, now: Date) {
  const today = calendarDate(now, timezone);
  if (recurrence === "none") return null;
  if (recurrence === "monthly") return `${today.slice(0, 8)}01`;
  const [year, month, day] = today.split("-").map(Number);
  const current = new Date(Date.UTC(year, month - 1, day));
  const daysSinceMonday = (current.getUTCDay() + 6) % 7;
  current.setUTCDate(current.getUTCDate() - daysSinceMonday);
  return current.toISOString().slice(0, 10);
}

export function deriveGoalProgress(goal: LearningGoal, events: LearningEvent[], now = new Date()): GoalProgress {
  const timezone = goal.timezone ?? "UTC";
  const periodStart = recurringPeriodStart(goal.recurrence ?? "none", timezone, now);
  const matching = events.filter((event) => eventMatchesMetric(event, goal.metric)
    && (!goal.conceptIds.length || goal.conceptIds.includes(event.conceptId))
    && (!periodStart || calendarDate(new Date(event.occurredAt), timezone) >= periodStart));
  const completedCount = new Set(matching.map((event) => event.target ? `${event.target.type}:${event.target.id}` : `${event.type}:${event.conceptId}`)).size;
  return {
    goalId: goal.id,
    completedCount,
    targetCount: goal.targetCount,
    percent: Math.min(100, Math.round((completedCount / goal.targetCount) * 100)),
    isComplete: completedCount >= goal.targetCount,
  };
}

export interface LearningActivityDay {
  date: string;
  total: number;
  byType: Partial<Record<LearningEventType, number>>;
}

export function aggregateLearningActivity(events: LearningEvent[], timezone: string): LearningActivityDay[] {
  const days = new Map<string, LearningActivityDay>();
  for (const event of events) {
    const date = calendarDate(new Date(event.occurredAt), timezone);
    const day = days.get(date) ?? { date, total: 0, byType: {} };
    day.total += 1;
    day.byType[event.type] = (day.byType[event.type] ?? 0) + 1;
    days.set(date, day);
  }
  return [...days.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export interface UserMastery {
  conceptId: ConceptId;
  state: "not-started" | "developing" | "practicing" | "confident";
  evidenceCount: number;
  confidence: "low" | "medium" | "high";
  recency: "none" | "recent" | "aging" | "stale";
  lastEvidenceAt?: string;
  modelVersion: 1;
}

export function deriveLocalMastery(conceptId: ConceptId, events: LearningEvent[], now = new Date()): UserMastery {
  const relevant = events.filter((event) => event.conceptId === conceptId);
  const demonstrated = relevant.filter((event) => event.source !== "legacy-local-snapshot");
  const hasSolved = demonstrated.some((event) => event.type === "exercise-solved" || event.type === "problem-solved");
  const hasPractice = relevant.some((event) => event.type === "exercise-attempted" || event.type === "problem-public-run" || event.type === "problem-public-completion-imported");
  const hasLesson = relevant.some((event) => event.type === "lesson-completed" || event.type === "lesson-status-changed");
  const state = hasSolved ? "confident" : hasPractice ? "practicing" : hasLesson ? "developing" : "not-started";
  const lastEvidenceAt = relevant.map((event) => event.occurredAt).sort().at(-1);
  const ageDays = lastEvidenceAt ? Math.max(0, (now.getTime() - Date.parse(lastEvidenceAt)) / 86_400_000) : Number.POSITIVE_INFINITY;
  const recency = !lastEvidenceAt ? "none" : ageDays <= 30 ? "recent" : ageDays <= 120 ? "aging" : "stale";
  const distinctSolvedTargets = new Set(demonstrated.filter((event) => event.type === "exercise-solved" || event.type === "problem-solved").map((event) => event.target ? `${event.target.type}:${event.target.id}` : event.id)).size;
  const confidence = hasSolved && distinctSolvedTargets > 1 && recency === "recent" ? "medium" : "low";
  return { conceptId, state, evidenceCount: relevant.length, confidence, recency, lastEvidenceAt, modelVersion: 1 };
}
