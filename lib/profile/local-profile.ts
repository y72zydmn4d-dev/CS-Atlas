import { storage } from "@/lib/storage";
import type { Bookmark, ExerciseStatus, Locale, ProgressStatus } from "@/lib/types";
import type { ExerciseAttempt } from "@/lib/domain/exercises";
import type { LearningEvent, LearningGoal, StudyPlan } from "@/lib/domain/learning";
import type { PracticeState } from "@/lib/practice/types";

export interface AnonymousLocalProfileExport {
  schemaVersion: 1;
  exportedAt: string;
  identity: { kind: "anonymous-local"; id: "current-browser"; visibility: "private" };
  preferences: { locale: Locale; theme: "light" | "dark" | "system"; sidebarCollapsed: boolean };
  learning: {
    progress: Record<string, ProgressStatus>;
    bookmarks: Bookmark[];
    exercises: Record<string, ExerciseStatus>;
    exerciseAttempts: ExerciseAttempt[];
    events: LearningEvent[];
    goals: LearningGoal[];
    studyPlans: StudyPlan[];
    practice: PracticeState;
  };
  exclusions: ["library-metadata", "library-files", "library-extracted-text"];
}

export function createAnonymousLocalProfileExport(exportedAt = new Date().toISOString()): AnonymousLocalProfileExport {
  return {
    schemaVersion: 1,
    exportedAt,
    identity: { kind: "anonymous-local", id: "current-browser", visibility: "private" },
    preferences: { locale: storage.loadLocale(), theme: storage.loadTheme() ?? "system", sidebarCollapsed: storage.loadSidebarCollapsed() },
    learning: {
      progress: storage.loadProgress(),
      bookmarks: storage.loadBookmarks(),
      exercises: storage.loadExercises(),
      exerciseAttempts: storage.loadExerciseAttempts(),
      events: storage.loadLearningEvents(),
      goals: storage.loadLearningGoals(),
      studyPlans: storage.loadStudyPlans(),
      practice: storage.loadPractice().state,
    },
    exclusions: ["library-metadata", "library-files", "library-extracted-text"],
  };
}
