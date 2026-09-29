import { algorithms } from "@/content/algorithms";
import { domains } from "@/content/domains";
import { projects } from "@/content/projects";
import { techniques } from "@/content/techniques";
import { topics } from "@/content/topics";
import { sources, sourceById } from "@/content/sources";
import type { ExerciseBlock, SearchResult } from "@/lib/types";
import { domainTranslationsVi, topicTranslationsVi } from "@/content/translations/vi";
import { practiceProblems } from "@/content/practice/problems";
import { concepts, conceptRelations, conceptValidationIssues, resolveConcept } from "@/content/concepts/registry";
import { courses, lessons } from "@/content/lessons";
import { exercises } from "@/content/exercises";
import { problems } from "@/content/problems";
import { validateProblemCatalog } from "@/lib/problems/catalog";

export { algorithms, domains, projects, techniques, topics, sources, sourceById, concepts, conceptRelations, conceptValidationIssues, resolveConcept, courses, lessons, exercises, problems };

export const domainById = new Map(domains.map((item) => [item.id, item]));
export const domainBySlug = new Map(domains.map((item) => [item.slug, item]));
export const topicById = new Map(topics.map((item) => [item.id, item]));
export const topicBySlug = new Map(topics.map((item) => [item.slug, item]));
export const algorithmById = new Map(algorithms.map((item) => [item.id, item]));
export const algorithmBySlug = new Map(algorithms.map((item) => [item.slug, item]));
export const techniqueById = new Map(techniques.map((item) => [item.id, item]));
export const techniqueBySlug = new Map(techniques.map((item) => [item.slug, item]));
export const projectById = new Map(projects.map((item) => [item.id, item]));

export const searchIndex: SearchResult[] = [
  ...practiceProblems.map((item) => ({ id: `practice:${item.id}`, title: item.title.en, titleVi: item.title.vi, type: "Exercise" as const, hierarchy: `Practice · ${domainById.get(item.domainId)?.name ?? "Atlas"}`, hierarchyVi: `Luyện tập · ${domainTranslationsVi[item.domainId]?.name ?? "Atlas"}`, href: `/practice/${item.id}`, keywords: `${item.summary.en} ${item.summary.vi} ${item.algorithmIds.join(" ")} ${item.techniqueIds.join(" ")}` })),
  ...domains.map((item) => ({ id: item.id, title: item.name, titleVi: domainTranslationsVi[item.id]?.name, type: "Domain" as const, hierarchy: "Atlas", hierarchyVi: "Atlas", href: `/domains/${item.slug}`, keywords: `${item.description} ${domainTranslationsVi[item.id]?.description ?? ""} ${item.keyConcepts.join(" ")}` })),
  ...domains.flatMap((item) => [
    { id: `roadmap:${item.id}`, canonicalId: item.id, title: `${item.name} roadmap`, titleVi: `${domainTranslationsVi[item.id]?.name ?? item.name} roadmap`, type: "Roadmap" as const, hierarchy: "Curated learning sequence", hierarchyVi: "Trình tự học được biên soạn", href: `/domains/${item.slug}/roadmap`, keywords: `${item.name} ${item.description} ${item.topicIds.join(" ")}` },
    { id: `mindmap:${item.id}`, canonicalId: item.id, title: `${item.name} mind map`, titleVi: `${domainTranslationsVi[item.id]?.name ?? item.name} mind map`, type: "MindMap" as const, hierarchy: "Conceptual association", hierarchyVi: "Liên kết khái niệm", href: `/domains/${item.slug}/mindmap`, keywords: `${item.name} ${item.description} ${item.topicIds.join(" ")}` },
  ]),
  ...topics.map((item) => ({ id: item.id, title: item.title, titleVi: topicTranslationsVi[item.id]?.title, type: "Topic" as const, hierarchy: domainById.get(item.domainId)?.name ?? "Topic", hierarchyVi: domainTranslationsVi[item.domainId]?.name, href: `/topics/${item.slug}`, keywords: `${item.summary} ${topicTranslationsVi[item.id]?.summary ?? ""} ${item.glossary.flatMap((term) => [term.term, term.definition, ...(term.aliases ?? [])]).join(" ")} ${JSON.stringify(item.content)}` })),
  ...topics.flatMap((topic) => topic.content.filter((block): block is ExerciseBlock => block.type === "exercise").map((exercise) => ({ id: `${topic.id}:${exercise.id}`, title: exercise.title, type: "Exercise" as const, hierarchy: `${topic.title} · ${domainById.get(topic.domainId)?.name ?? "Topic"}`, href: `/topics/${topic.slug}#${exercise.id}`, keywords: `${exercise.prompt} ${exercise.exerciseType} ${exercise.difficulty} ${exercise.hints.join(" ")}` }))),
  ...algorithms.map((item) => ({ id: item.id, title: item.name, type: "Algorithm" as const, hierarchy: `${item.category} · DSA`, href: `/algorithms/${item.slug}`, keywords: `${item.summary} ${item.useCases.join(" ")}` })),
  ...techniques.map((item) => ({ id: item.id, title: item.name, type: "Technique" as const, hierarchy: item.family, href: `/techniques/${item.slug}`, keywords: `${item.summary} ${item.whenToUse.join(" ")}` })),
  ...projects.map((item) => ({ id: item.id, title: item.title, type: "Project" as const, hierarchy: domainById.get(item.domainId)?.name ?? "Project", href: `/projects#${item.slug}`, keywords: `${item.summary} ${item.deliverables.join(" ")}` })),
  ...sources.map((item) => ({ id: item.id, title: item.title, type: "Source" as const, hierarchy: [item.sourceType, item.publisher].filter(Boolean).join(" · "), href: item.url ?? "/search", keywords: `${item.authors?.join(" ") ?? ""} ${item.publisher ?? ""} ${item.year ?? ""}` })),
  ...concepts.map((item) => ({ id: item.id, canonicalId: item.id, title: item.name.en, titleVi: item.name.vi, type: "Concept" as const, hierarchy: `Canonical ${item.kind}`, hierarchyVi: `Khái niệm chuẩn · ${item.kind}`, href: `/concepts/${item.slug}`, keywords: `${item.summary.en} ${item.summary.vi} ${item.aliases.join(" ")}` })),
  ...problems.map((item) => ({ id: `problem:${item.id}`, title: item.title.en, titleVi: item.title.vi, type: "Problem" as const, hierarchy: "Programming problems", hierarchyVi: "Bài toán lập trình", href: item.href, keywords: `${item.summary.en} ${item.summary.vi} ${item.difficulty} ${item.conceptIds.join(" ")}` })),
  ...exercises.map((item) => ({ id: item.id, title: item.title.en, titleVi: item.title.vi, type: "Exercise" as const, hierarchy: "Topic exercises", hierarchyVi: "Bài tập theo chủ đề", href: item.href, keywords: `${item.prompt.en} ${item.prompt.vi} ${item.mode} ${item.difficulty}` })),
];

export function validateContent() {
  const errors: string[] = [];
  const unique = (name: string, ids: string[]) => {
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length) errors.push(`${name} contains duplicate IDs: ${duplicates.join(", ")}`);
  };
  unique("domains", domains.map((item) => item.id));
  unique("topics", topics.map((item) => item.id));
  unique("algorithms", algorithms.map((item) => item.id));
  unique("techniques", techniques.map((item) => item.id));
  unique("projects", projects.map((item) => item.id));
  unique("sources", sources.map((item) => item.id));
  for (const domain of domains) {
    for (const id of domain.topicIds) if (!topicById.has(id)) errors.push(`${domain.id} references missing topic ${id}`);
    for (const syllabusModule of domain.syllabus) for (const id of syllabusModule.topicIds) if (!topicById.has(id)) errors.push(`${syllabusModule.id} references missing topic ${id}`);
    for (const id of domain.algorithmIds) if (!algorithmById.has(id)) errors.push(`${domain.id} references missing algorithm ${id}`);
    for (const id of domain.techniqueIds) if (!techniqueById.has(id)) errors.push(`${domain.id} references missing technique ${id}`);
    for (const id of domain.projectIds) if (!projectById.has(id)) errors.push(`${domain.id} references missing project ${id}`);
  }
  const validateGraph = (domainId: string, graphName: string, graph: { nodes: Array<{ id: string; topicId?: string }>; edges: Array<{ id: string; source: string; target: string }> }) => {
    const nodeIdList = graph.nodes.map((node) => node.id);
    const nodeIds = new Set(nodeIdList);
    unique(`${domainId}.${graphName}.nodes`, nodeIdList);
    unique(`${domainId}.${graphName}.edges`, graph.edges.map((edge) => edge.id));
    for (const node of graph.nodes) if (node.topicId && !topicById.has(node.topicId)) errors.push(`${domainId}.${graphName} node ${node.id} references missing topic ${node.topicId}`);
    for (const edge of graph.edges) {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) errors.push(`${domainId}.${graphName} edge ${edge.id} references a missing node`);
      if (edge.source === edge.target) errors.push(`${domainId}.${graphName} edge ${edge.id} is a self-loop`);
    }
    const pairs = graph.edges.map((edge) => `${edge.source}->${edge.target}`);
    unique(`${domainId}.${graphName}.edgePairs`, pairs);
    const adjacency = new Map<string, string[]>();
    for (const id of nodeIds) adjacency.set(id, []);
    for (const edge of graph.edges) adjacency.get(edge.source)?.push(edge.target);
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const hasCycle = (id: string): boolean => {
      if (visiting.has(id)) return true;
      if (visited.has(id)) return false;
      visiting.add(id);
      for (const target of adjacency.get(id) ?? []) if (hasCycle(target)) return true;
      visiting.delete(id);
      visited.add(id);
      return false;
    };
    if (graph.nodes.some((node) => hasCycle(node.id))) errors.push(`${domainId}.${graphName} contains a cycle`);
    const reachable = new Set<string>();
    const walk = (id: string) => { if (reachable.has(id)) return; reachable.add(id); for (const target of adjacency.get(id) ?? []) walk(target); };
    if (graph.nodes[0]) walk(graph.nodes[0].id);
    for (const id of nodeIds) if (!reachable.has(id)) errors.push(`${domainId}.${graphName} node ${id} is unreachable from ${graph.nodes[0]?.id}`);
    return adjacency;
  };
  for (const domain of domains) {
    const roadmapAdjacency = validateGraph(domain.id, "roadmap", domain.roadmap);
    validateGraph(domain.id, "mindMap", domain.mindMap);
    const topicNode = new Map(domain.roadmap.nodes.filter((node) => node.topicId).map((node) => [node.topicId as string, node.id]));
    const canReach = (source: string, target: string) => { const seen = new Set<string>(); const visit = (id: string): boolean => { if (id === target) return true; if (seen.has(id)) return false; seen.add(id); return (roadmapAdjacency.get(id) ?? []).some(visit); }; return visit(source); };
    for (const topicId of domain.topicIds) {
      const topic = topicById.get(topicId);
      const target = topicNode.get(topicId);
      if (!topic || !target) continue;
      for (const prerequisiteId of topic.prerequisiteIds) {
        const source = topicNode.get(prerequisiteId);
        if (source && !canReach(source, target)) errors.push(`${domain.id}.roadmap does not place prerequisite ${prerequisiteId} before ${topicId}`);
      }
    }
  }
  for (const topic of topics) {
    for (const id of topic.prerequisiteIds) if (!topicById.has(id)) errors.push(`${topic.id} references missing prerequisite ${id}`);
    for (const id of topic.relatedTopicIds) if (!topicById.has(id) && !algorithmById.has(id) && !techniqueById.has(id)) errors.push(`${topic.id} references missing related topic ${id}`);
    unique(`${topic.id}.content`, topic.content.map((block) => block.id));
    for (const sourceId of topic.revision.sourceIds) if (!sourceById.has(sourceId)) errors.push(`${topic.id} references missing source ${sourceId}`);
    for (const block of topic.content) {
      if (block.type === "code" && !block.language.trim()) errors.push(`${topic.id}.${block.id} is missing a code language`);
      if (block.type === "exercise") {
        if (!block.prompt.trim() || !block.solution.trim()) errors.push(`${topic.id}.${block.id} requires a prompt and solution`);
        for (const id of block.relatedTopicIds) if (!topicById.has(id)) errors.push(`${topic.id}.${block.id} references missing topic ${id}`);
      }
      for (const citation of block.citations ?? []) if (!sourceById.has(citation.sourceId)) errors.push(`${topic.id}.${block.id} references missing citation ${citation.sourceId}`);
    }
  }
  for (const issue of conceptValidationIssues) errors.push(`canonical concepts: ${issue.message}`);
  errors.push(...validateProblemCatalog(problems, new Set(concepts.map((concept) => concept.id))));
  return errors;
}
