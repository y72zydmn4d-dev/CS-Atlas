import { domains } from "@/content/domains";
import { canonicalConceptIdForTopic } from "@/content/concepts/registry";
import type { CanonicalResource } from "@/lib/domain/resources";

export const resources: CanonicalResource[] = domains.flatMap((domain) => {
  const conceptIds = domain.topicIds.map(canonicalConceptIdForTopic) as CanonicalResource["conceptIds"];
  return domain.resources.map((resource) => ({
    ...resource,
    id: `resource:${domain.id}:${resource.id}`,
    conceptIds,
    provenance: { source: "domain-registry" as const, sourceId: resource.id, domainId: domain.id, contentVersion: 1 as const },
  }));
});

export const resourceById = new Map(resources.map((resource) => [resource.id, resource]));
