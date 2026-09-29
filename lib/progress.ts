import type { ProgressStatus } from "@/lib/types";

export const progressWeight: Record<ProgressStatus, number> = {
  "not-started": 0,
  "in-progress": 0.5,
  completed: 1,
};

export function calculateProgress(ids: string[], state: Record<string, ProgressStatus>) {
  if (!ids.length) return 0;
  const total = ids.reduce((sum, id) => sum + progressWeight[state[id] ?? "not-started"], 0);
  return Math.round((total / ids.length) * 100);
}

export function deriveStatus(ids: string[], state: Record<string, ProgressStatus>): ProgressStatus {
  const progress = calculateProgress(ids, state);
  if (progress === 0) return "not-started";
  if (progress === 100) return "completed";
  return "in-progress";
}

export function sanitizeProgress(input: unknown): Record<string, ProgressStatus> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const allowed = new Set<ProgressStatus>(["not-started", "in-progress", "completed"]);
  return Object.fromEntries(
    Object.entries(input).filter((entry): entry is [string, ProgressStatus] => allowed.has(entry[1] as ProgressStatus)),
  );
}
