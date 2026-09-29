"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Bookmark, ExerciseStatus, ProgressStatus } from "@/lib/types";
import type { LearningEvent, LearningEventType } from "@/lib/domain/learning";
import { storage } from "@/lib/storage";

interface AtlasContextValue {
  ready: boolean;
  progress: Record<string, ProgressStatus>;
  bookmarks: Bookmark[];
  exercises: Record<string, ExerciseStatus>;
  learningEvents: LearningEvent[];
  getStatus: (id: string) => ProgressStatus;
  setStatus: (id: string, status: ProgressStatus) => void;
  setExerciseStatus: (id: string, status: ExerciseStatus) => void;
  toggleBookmark: (bookmark: Omit<Bookmark, "createdAt">) => void;
  isBookmarked: (id: string, type: Bookmark["type"]) => boolean;
  recordLearningEvent: (event: { type: LearningEventType; conceptId: string; source: LearningEvent["source"]; sourceVersion?: number }) => void;
}

const AtlasContext = createContext<AtlasContextValue | null>(null);

export function AtlasProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<Record<string, ProgressStatus>>({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [exercises, setExercises] = useState<Record<string, ExerciseStatus>>({});
  const [learningEvents, setLearningEvents] = useState<LearningEvent[]>([]);

  useEffect(() => {
    // Hydration is the boundary where browser-only persisted state becomes available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(storage.loadProgress());
    setBookmarks(storage.loadBookmarks());
    setExercises(storage.loadExercises());
    setLearningEvents(storage.loadLearningEvents());
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

  const recordLearningEvent = useCallback((event: { type: LearningEventType; conceptId: string; source: LearningEvent["source"]; sourceVersion?: number }) => {
    setLearningEvents((current) => {
      const eventId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `local-${Date.now()}-${current.length}`;
      const next = [...current, { ...event, id: eventId, occurredAt: new Date().toISOString() }].slice(-500);
      storage.saveLearningEvents(next);
      return next;
    });
  }, []);

  const value = useMemo<AtlasContextValue>(() => ({
    ready,
    progress,
    bookmarks,
    exercises,
    learningEvents,
    getStatus: (id) => progress[id] ?? "not-started",
    setStatus,
    setExerciseStatus,
    toggleBookmark,
    isBookmarked: (id, type) => bookmarks.some((item) => item.id === id && item.type === type),
    recordLearningEvent,
  }), [bookmarks, exercises, learningEvents, progress, ready, recordLearningEvent, setExerciseStatus, setStatus, toggleBookmark]);

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
