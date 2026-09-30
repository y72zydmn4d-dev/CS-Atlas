import type { Bookmark, ExerciseStatus, Locale, ProgressStatus } from "@/lib/types";
import { isLearningEvent, isLearningGoal, isStudyPlan, type LearningEvent, type LearningGoal, type StudyPlan } from "@/lib/domain/learning";
import { sanitizeProgress } from "@/lib/progress";
import { sanitizePracticeState } from "@/lib/practice/validation";
import type { PracticeState } from "@/lib/practice/types";
import { isExerciseAttempt, type ExerciseAttempt } from "@/lib/domain/exercises";
import { createLegacyLearningMigration, isLegacyLearningMigration, type LegacyLearningMigration } from "@/lib/progress/migration";

const KEYS = {
  sidebar: "cs-atlas.sidebar-collapsed.v1",
  libraryView: "cs-atlas.library-view.v1",
  progress: "cs-atlas.progress.v1",
  bookmarks: "cs-atlas.bookmarks.v1",
  exercises: "cs-atlas.exercises.v1",
  exerciseAttempts: "cs-atlas.exercise-attempts.v1",
  theme: "cs-atlas.theme.v1",
  locale: "cs-atlas.locale.v1",
  translationPopover: "cs-atlas.translation-popover.v1",
  practice: "cs-atlas.practice.v1",
  learningEvents: "cs-atlas.learning-events.v1",
  learningGoals: "cs-atlas.learning-goals.v1",
  studyPlans: "cs-atlas.study-plans.v1",
  learningMigration: "cs-atlas.learning-migration.v1",
  learnNavigation: "cs-atlas.learn-navigation.v1",
} as const;

function readJson(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage can be unavailable in private or restricted contexts.
  }
}

export const storage = {
  loadLearnNavigation(subjectId: string): { scrollTop: number; collapsedSectionIds: string[]; hasStoredState: boolean } {
    const value = readJson(KEYS.learnNavigation);
    if (!value || typeof value !== "object" || Array.isArray(value)) return { scrollTop: 0, collapsedSectionIds: [], hasStoredState: false };
    const selected = (value as Record<string, unknown>)[subjectId];
    if (!selected || typeof selected !== "object" || Array.isArray(selected)) return { scrollTop: 0, collapsedSectionIds: [], hasStoredState: false };
    const record = selected as Record<string, unknown>;
    return {
      scrollTop: typeof record.scrollTop === "number" && Number.isFinite(record.scrollTop) && record.scrollTop >= 0 ? record.scrollTop : 0,
      collapsedSectionIds: Array.isArray(record.collapsedSectionIds) ? record.collapsedSectionIds.filter((id): id is string => typeof id === "string").slice(0, 100) : [],
      hasStoredState: true,
    };
  },
  saveLearnNavigation(subjectId: string, state: { scrollTop: number; collapsedSectionIds: string[] }) {
    const current = readJson(KEYS.learnNavigation);
    const records = current && typeof current === "object" && !Array.isArray(current) ? current as Record<string, unknown> : {};
    writeJson(KEYS.learnNavigation, { ...records, [subjectId]: { scrollTop: Math.max(0, Math.round(state.scrollTop)), collapsedSectionIds: state.collapsedSectionIds.slice(0, 100) } });
  },
  loadLibraryView(): "list" | "grid" { return readJson(KEYS.libraryView) === "grid" ? "grid" : "list"; },
  saveLibraryView(value: "list" | "grid") { writeJson(KEYS.libraryView, value); },
  loadSidebarCollapsed(): boolean { return readJson(KEYS.sidebar) === true; },
  saveSidebarCollapsed(value: boolean) { writeJson(KEYS.sidebar, value); },
  loadPractice(): { state: PracticeState; recovered: boolean } {
    let value: unknown = null;
    try { if (typeof window !== "undefined") value = JSON.parse(window.localStorage.getItem(KEYS.practice) ?? "null"); }
    catch { return { state: sanitizePracticeState(null), recovered: true }; }
    const state = sanitizePracticeState(value);
    const validVersion = Boolean(value && typeof value === "object" && "schemaVersion" in value && (value.schemaVersion === 1 || value.schemaVersion === 2));
    if (!validVersion) return { state, recovered: value !== null };
    // Schema v1 is migrated in memory: its single draft becomes the JavaScript
    // draft while Python starts independently. This is expected, not corruption.
    if ((value as { schemaVersion: number }).schemaVersion === 1) {
      const raw = value as { attempts?: unknown; drafts?: unknown };
      const rawAttempts = Array.isArray(raw.attempts) ? raw.attempts.length : 0;
      const rawDrafts = raw.drafts && typeof raw.drafts === "object" && !Array.isArray(raw.drafts) ? Object.keys(raw.drafts).length : 0;
      return { state, recovered: state.attempts.length !== rawAttempts || Object.keys(state.drafts).length !== rawDrafts };
    }
    const current = value as Record<string, unknown>;
    const comparable = "completions" in current ? current : { ...current, completions: state.completions };
    return { state, recovered: JSON.stringify(comparable) !== JSON.stringify(state) };
  },
  savePractice(state: PracticeState): boolean {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.setItem(KEYS.practice, JSON.stringify(sanitizePracticeState(state)));
      window.dispatchEvent(new Event("cs-atlas-practice"));
      return true;
    } catch { return false; }
  },
  loadProgress(): Record<string, ProgressStatus> {
    return sanitizeProgress(readJson(KEYS.progress));
  },
  saveProgress(value: Record<string, ProgressStatus>) {
    writeJson(KEYS.progress, value);
  },
  loadBookmarks(): Bookmark[] {
    const value = readJson(KEYS.bookmarks);
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is Bookmark => Boolean(item && typeof item.id === "string" && typeof item.href === "string"));
  },
  saveBookmarks(value: Bookmark[]) {
    writeJson(KEYS.bookmarks, value);
  },
  loadExercises(): Record<string, ExerciseStatus> {
    const value = readJson(KEYS.exercises);
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const allowed = new Set<ExerciseStatus>(["not-attempted", "attempted", "solved"]);
    return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, ExerciseStatus] => allowed.has(entry[1] as ExerciseStatus)));
  },
  saveExercises(value: Record<string, ExerciseStatus>) {
    writeJson(KEYS.exercises, value);
  },
  loadExerciseAttempts(): ExerciseAttempt[] {
    const value = readJson(KEYS.exerciseAttempts);
    return Array.isArray(value) ? value.filter(isExerciseAttempt).slice(-500) : [];
  },
  saveExerciseAttempts(value: ExerciseAttempt[]): boolean {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.setItem(KEYS.exerciseAttempts, JSON.stringify(value.filter(isExerciseAttempt).slice(-500)));
      return true;
    } catch {
      return false;
    }
  },
  loadLearningEvents(): LearningEvent[] {
    const value = readJson(KEYS.learningEvents);
    if (!Array.isArray(value)) return [];
    // v1 records have no target; retain them as evidence instead of inventing it.
    return value.filter(isLearningEvent).slice(-500);
  },
  saveLearningEvents(value: LearningEvent[]): boolean {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.setItem(KEYS.learningEvents, JSON.stringify(value.slice(-500)));
      return true;
    } catch {
      return false;
    }
  },
  loadOrCreateLegacyLearningMigration(): LegacyLearningMigration | null {
    const existing = readJson(KEYS.learningMigration);
    if (isLegacyLearningMigration(existing)) return existing;
    if (typeof window === "undefined") return null;
    const migration = createLegacyLearningMigration({
      progress: sanitizeProgress(readJson(KEYS.progress)),
      exercises: this.loadExercises(),
      practice: this.loadPractice().state,
      migratedAt: new Date().toISOString(),
    });
    try {
      window.localStorage.setItem(KEYS.learningMigration, JSON.stringify(migration));
      return migration;
    } catch {
      return null;
    }
  },
  loadLearningGoals(): LearningGoal[] {
    const value = readJson(KEYS.learningGoals);
    return Array.isArray(value) ? value.filter(isLearningGoal).slice(-100) : [];
  },
  saveLearningGoals(value: LearningGoal[]): boolean {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.setItem(KEYS.learningGoals, JSON.stringify(value.filter(isLearningGoal).slice(-100)));
      return true;
    } catch {
      return false;
    }
  },
  loadStudyPlans(): StudyPlan[] {
    const value = readJson(KEYS.studyPlans);
    return Array.isArray(value) ? value.filter(isStudyPlan).slice(-50) : [];
  },
  saveStudyPlans(value: StudyPlan[]): boolean {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.setItem(KEYS.studyPlans, JSON.stringify(value.filter(isStudyPlan).slice(-50)));
      return true;
    } catch {
      return false;
    }
  },
  loadTheme(): "light" | "dark" | null {
    if (typeof window === "undefined") return null;
    try {
      const value = window.localStorage.getItem(KEYS.theme);
      return value === "light" || value === "dark" ? value : null;
    } catch { return null; }
  },
  saveTheme(value: "light" | "dark") {
    try { if (typeof window !== "undefined") window.localStorage.setItem(KEYS.theme, value); } catch { /* Keep the current in-memory theme when persistence is unavailable. */ }
  },
  loadLocale(): Locale {
    if (typeof window === "undefined") return "en";
    try {
      const value = window.localStorage.getItem(KEYS.locale);
      return value === "vi" || value === "en" ? value : "en";
    } catch {
      return "en";
    }
  },
  saveLocale(value: Locale) {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(KEYS.locale, value); } catch { /* Storage may be restricted. */ }
  },
  loadTranslationPopoverPreference(): boolean {
    return readJson(KEYS.translationPopover) !== false;
  },
  saveTranslationPopoverPreference(value: boolean) {
    writeJson(KEYS.translationPopover, value);
  },
  clearLocalLearningData(): boolean {
    if (typeof window === "undefined") return false;
    try {
      for (const key of [KEYS.progress, KEYS.bookmarks, KEYS.exercises, KEYS.exerciseAttempts, KEYS.practice, KEYS.learningEvents, KEYS.learningGoals, KEYS.studyPlans, KEYS.learningMigration]) window.localStorage.removeItem(key);
      window.dispatchEvent(new Event("cs-atlas-practice"));
      window.dispatchEvent(new Event("cs-atlas:learning-cleared"));
      return true;
    } catch {
      return false;
    }
  },
};
