import type { ConceptId } from "@/lib/domain/concepts";
import type { Resource } from "@/lib/types";

export interface CanonicalResource {
  id: string;
  title: string;
  type: Resource["type"];
  url?: string;
  note: string;
  conceptIds: [ConceptId, ...ConceptId[]];
  provenance: { source: "domain-registry"; sourceId: string; domainId: string; contentVersion: 1 };
}

export function validateCanonicalResources(resources: CanonicalResource[], knownConceptIds: Set<string>) {
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const resource of resources) {
    if (ids.has(resource.id)) issues.push(`resources contains duplicate ID ${resource.id}`);
    ids.add(resource.id);
    if (!resource.title.trim() || !resource.note.trim()) issues.push(`${resource.id} requires a title and note`);
    if (!resource.conceptIds.length || resource.conceptIds.some((id) => !knownConceptIds.has(id))) issues.push(`${resource.id} has an invalid Concept relation`);
    if (resource.url) {
      try { if (!["http:", "https:"].includes(new URL(resource.url).protocol)) issues.push(`${resource.id} has an invalid URL`); }
      catch { issues.push(`${resource.id} has an invalid URL`); }
    }
  }
  return issues;
}
