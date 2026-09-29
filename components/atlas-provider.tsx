"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Bookmark, ExerciseStatus, ProgressStatus } from "@/lib/types";
import type { GoalMetric, GoalRecurrence, LearningEvent, LearningEventTarget, LearningEventType, LearningGoal, StudyPlan, StudyPlanItem } from "@/lib/domain/learning";
import type { ExerciseAttempt } from "@/lib/domain/exercises";
import { storage } from "@/lib/storage";
import { mergeLearningEvents } from "@/lib/progress/migration";

interface AtlasContextValue {
  ready: boolean;
  progress: Record<string, ProgressStatus>;
  bookmarks: Bookmark[];
  exercises: Record<string, ExerciseStatus>;
  exerciseAttempts: ExerciseAttempt[];
  learningEvents: LearningEvent[];
  learningGoals: LearningGoal[];
  studyPlans: StudyPlan[];
  getStatus: (id: string) => ProgressStatus;
  setStatus: (id: string, status: ProgressStatus) => void;
  setExerciseStatus: (id: string, status: ExerciseStatus) => void;
  recordExerciseAttempt: (attempt: Omit<ExerciseAttempt, "id" | "occurredAt">) => boolean;
  toggleBookmark: (bookmark: Omit<Bookmark, "createdAt">) => void;
  isBookmarked: (id: string, type: Bookmark["type"]) => boolean;
  recordLearningEvent: (event: { type: LearningEventType; conceptId: string; source: LearningEvent["source"]; sourceVersion?: number; target?: LearningEventTarget }) => void;
  createLearningGoal: (input: { title: string; metric: GoalMetric; targetCount: number; conceptIds?: string[]; deadline?: string; recurrence?: GoalRecurrence }) => boolean;
  archiveLearningGoal: (id: string) => boolean;
  createStudyPlan: (input: { title: string; items: StudyPlanItem[] }) => boolean;
  completeStudyPlanItem: (planId: string, itemId: string) => boolean;
  rescheduleStudyPlanItem: (planId: string, itemId: string, scheduledFor?: string) => boolean;
}

const AtlasContext = createContext<AtlasContextValue | null>(null);

export function AtlasProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<Record<string, ProgressStatus>>({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [exercises, setExercises] = useState<Record<string, ExerciseStatus>>({});
  const [exerciseAttempts, setExerciseAttempts] = useState<ExerciseAttempt[]>([]);
  const [learningEvents, setLearningEvents] = useState<LearningEvent[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);

  useEffect(() => {
    // Hydration is the boundary where browser-only persisted state becomes available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(storage.loadProgress());
    setBookmarks(storage.loadBookmarks());
    setExercises(storage.loadExercises());
    setExerciseAttempts(storage.loadExerciseAttempts());
    const migration = storage.loadOrCreateLegacyLearningMigration();
    setLearningEvents(mergeLearningEvents(migration?.events ?? [], storage.loadLearningEvents()));
    setLearningGoals(storage.loadLearningGoals());
    setStudyPlans(storage.loadStudyPlans());
    setReady(true);
  }, []);

  const setStatus = useCallback((id: string, status: ProgressStatus) => {
    setProgress((current) => {
      const next = { ...current, [id]: status };
      storage.saveProgress(next);
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((bookmark: Omit<Bookmark, "createdAt">) => {
    setBookmarks((current) => {
      const exists = current.some((item) => item.id === bookmark.id && item.type === bookmark.type);
      const next = exists
        ? current.filter((item) => !(item.id === bookmark.id && item.type === bookmark.type))
        : [{ ...bookmark, createdAt: Date.now() }, ...current];
      storage.saveBookmarks(next);
      return next;
    });
  }, []);

  const setExerciseStatus = useCallback((id: string, status: ExerciseStatus) => {
    setExercises((current) => {
      const next = { ...current, [id]: status };
      storage.saveExercises(next);
      return next;
    });
  }, []);

  const recordExerciseAttempt = useCallback((attempt: Omit<ExerciseAttempt, "id" | "occurredAt">) => {
    const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `exercise-attempt-${Date.now()}`;
    const nextAttempt: ExerciseAttempt = { ...attempt, id, occurredAt: new Date().toISOString() };
    let saved = false;
    setExerciseAttempts((current) => {
      const next = [...current, nextAttempt].slice(-500);
      saved = storage.saveExerciseAttempts(next);
      return saved ? next : current;
    });
    return saved;
  }, []);

  const recordLearningEvent = useCallback((event: { type: LearningEventType; conceptId: string; source: LearningEvent["source"]; sourceVersion?: number; target?: LearningEventTarget }) => {
    setLearningEvents((current) => {
      const eventId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `local-${Date.now()}-${current.length}`;
      const next = [...current, { ...event, id: eventId, occurredAt: new Date().toISOString() }].slice(-500);
      storage.saveLearningEvents(next);
      return next;
    });
  }, []);

  const createLearningGoal = useCallback((input: { title: string; metric: GoalMetric; targetCount: number; conceptIds?: string[]; deadline?: string; recurrence?: GoalRecurrence }) => {
    const title = input.title.trim();
    if (!title || title.length > 160 || !Number.isInteger(input.targetCount) || input.targetCount < 1) return false;
    const now = new Date().toISOString();
    const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `goal-${Date.now()}`;
    const nextGoal: LearningGoal = { id, title, metric: input.metric, targetCount: input.targetCount, conceptIds: input.conceptIds ?? [], deadline: input.deadline || undefined, recurrence: input.recurrence ?? "none", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", status: "active", createdAt: now, updatedAt: now };
    let saved = false;
    setLearningGoals((current) => {
      const next = [nextGoal, ...current].slice(0, 100);
      saved = storage.saveLearningGoals(next);
      return saved ? next : current;
    });
    return saved;
  }, []);

  const archiveLearningGoal = useCallback((id: string) => {
    let saved = false;
    setLearningGoals((current) => {
      const next = current.map((goal) => goal.id === id ? { ...goal, status: "archived" as const, updatedAt: new Date().toISOString() } : goal);
      saved = storage.saveLearningGoals(next);
      return saved ? next : current;
    });
    return saved;
  }, []);

  const createStudyPlan = useCallback((input: { title: string; items: StudyPlanItem[] }) => {
    const title = input.title.trim();
    if (!title || title.length > 160 || !input.items.length) return false;
    const now = new Date().toISOString();
    const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `plan-${Date.now()}`;
    const plan: StudyPlan = { id, title, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", items: input.items, status: "active", createdAt: now, updatedAt: now };
    let saved = false;
    setStudyPlans((current) => {
      const next = [plan, ...current].slice(0, 50);
      saved = storage.saveStudyPlans(next);
      return saved ? next : current;
    });
    return saved;
  }, []);

  const updatePlan = useCallback((planId: string, mutate: (plan: StudyPlan) => StudyPlan) => {
    let saved = false;
    setStudyPlans((current) => {
      const next = current.map((plan) => plan.id === planId ? mutate(plan) : plan);
      saved = storage.saveStudyPlans(next);
      return saved ? next : current;
    });
    return saved;
  }, []);

  const completeStudyPlanItem = useCallback((planId: string, itemId: string) => {
    const selectedPlan = studyPlans.find((plan) => plan.id === planId);
    const selectedItem = selectedPlan?.items.find((item) => item.id === itemId);
    if (!selectedPlan || !selectedItem || selectedItem.completedAt) return false;
    const completedAt = new Date().toISOString();
    const saved = updatePlan(planId, (plan) => {
      const items = plan.items.map((item) => item.id === itemId ? { ...item, completedAt } : item);
      const allComplete = items.every((item) => item.completedAt);
      return { ...plan, items, status: allComplete ? "completed" : plan.status, updatedAt: completedAt };
    });
    if (saved) recordLearningEvent({ type: "study-plan-item-completed", conceptId: selectedItem.conceptId, source: "local-study-plan", target: selectedItem.target });
    return saved;
  }, [recordLearningEvent, studyPlans, updatePlan]);

  const rescheduleStudyPlanItem = useCallback((planId: string, itemId: string, scheduledFor?: string) => updatePlan(planId, (plan) => ({
    ...plan,
    items: plan.items.map((item) => item.id === itemId ? { ...item, scheduledFor: scheduledFor || undefined } : item),
    updatedAt: new Date().toISOString(),
  })), [updatePlan]);

  const value = useMemo<AtlasContextValue>(() => ({
    ready,
    progress,
    bookmarks,
    exercises,
    exerciseAttempts,
    learningEvents,
    learningGoals,
    studyPlans,
    getStatus: (id) => progress[id] ?? "not-started",
    setStatus,
    setExerciseStatus,
    recordExerciseAttempt,
    toggleBookmark,
    isBookmarked: (id, type) => bookmarks.some((item) => item.id === id && item.type === type),
    recordLearningEvent,
    createLearningGoal,
    archiveLearningGoal,
    createStudyPlan,
    completeStudyPlanItem,
    rescheduleStudyPlanItem,
  }), [archiveLearningGoal, bookmarks, completeStudyPlanItem, createLearningGoal, createStudyPlan, exerciseAttempts, exercises, learningEvents, learningGoals, progress, ready, recordExerciseAttempt, recordLearningEvent, rescheduleStudyPlanItem, setExerciseStatus, setStatus, studyPlans, toggleBookmark]);

  return <AtlasContext.Provider value={value}>{children}</AtlasContext.Provider>;
}

export function useAtlas() {
  const value = useContext(AtlasContext);
  if (!value) throw new Error("useAtlas must be used inside AtlasProvider");
  return value;
}

export function useOptionalAtlas() {
  return useContext(AtlasContext);
}
