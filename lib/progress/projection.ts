import { concepts } from "@/content/concepts/registry";
import type { ProgressStatus } from "@/lib/types";

export function projectLegacyProgressToConcepts(legacyProgress: Record<string, ProgressStatus>) {
  const projection: Record<string, ProgressStatus> = {};
  for (const concept of concepts) {
    if (concept.kind !== "topic") continue;
    projection[concept.id] = legacyProgress[concept.provenance.legacyId] ?? "not-started";
  }
  return projection;
}
