export type Difficulty = "Foundational" | "Intermediate" | "Advanced";
export type Locale = "en" | "vi";
export type TranslationStatus = "complete" | "partial" | "english-only";
export type ProgressStatus = "not-started" | "in-progress" | "completed";
export type ExerciseStatus = "not-attempted" | "attempted" | "solved";
export type ContentLevel = "Foundation" | "Developing" | "Detailed" | "Reference-quality";

export interface Citation {
  sourceId: string;
  locator?: string;
  note?: string;
}

export interface Source {
  id: string;
  title: string;
  authors?: string[];
  publisher?: string;
  year?: number;
  url?: string;
  sourceType: "book" | "paper" | "documentation" | "course" | "article";
}

export interface LearningObjective { id: string; description: string }
export interface GlossaryTerm { term: string; definition: string; aliases?: string[] }
export interface ContentRevisionMetadata { version: number; reviewedAt: string; contentLevel: ContentLevel; sourceIds: string[] }

interface BaseContentBlock {
  id: string;
  type: string;
  title: string;
  citations?: Citation[];
}

export interface ParagraphBlock extends BaseContentBlock { type: "paragraph"; body: string; bullets?: string[] }
export interface LearningObjectivesBlock extends BaseContentBlock { type: "learning-objectives"; objectives: string[] }
export interface DefinitionBlock extends BaseContentBlock { type: "definition"; term: string; definition: string; notation?: string }
export interface IntuitionBlock extends BaseContentBlock { type: "intuition"; body: string; analogy?: string }
export interface KeyIdeaBlock extends BaseContentBlock { type: "key-idea"; body: string; points: string[] }
export interface TheoremBlock extends BaseContentBlock { type: "theorem"; statement: string; proofSketch: string }
export interface DerivationBlock extends BaseContentBlock { type: "derivation"; introduction: string; steps: Array<{ expression: string; explanation: string }>; conclusion: string }
export interface FormulaBlock extends BaseContentBlock { type: "formula"; expression: string; description: string; terms: Array<{ symbol: string; meaning: string }> }
export interface WorkedExampleBlock extends BaseContentBlock { type: "worked-example"; problem: string; steps: Array<{ title: string; explanation: string; formula?: string; code?: string }>; conclusion: string }
export interface StepByStepBlock extends BaseContentBlock { type: "step-by-step"; steps: Array<{ title: string; body: string }> }
export interface CodeContentBlock extends BaseContentBlock { type: "code"; language: string; code: string; explanation: Array<{ lines: string; body: string }> }
export interface ComplexityBlock extends BaseContentBlock { type: "complexity"; time: string; space: string; analysis: string; cases?: Array<{ name: string; complexity: string; reason: string }> }
export interface ComparisonBlock extends BaseContentBlock { type: "comparison"; columns: string[]; rows: Array<{ label: string; values: string[] }> }
export interface CommonMistakesBlock extends BaseContentBlock { type: "common-mistakes"; mistakes: Array<{ mistake: string; consequence: string; correction: string }> }
export interface ApplicationsBlock extends BaseContentBlock { type: "applications"; applications: Array<{ name: string; description: string }> }
export interface ExerciseBlock extends BaseContentBlock { type: "exercise"; exerciseType: "conceptual" | "calculation" | "coding" | "proof" | "debugging" | "design"; difficulty: "easy" | "medium" | "hard"; prompt: string; constraints?: string[]; starterCode?: string; language?: string; hints: string[]; solution: string; explanation: string; relatedTopicIds: string[]; estimatedMinutes: number }
export interface CalloutBlock extends BaseContentBlock { type: "callout"; tone: "insight" | "warning" | "prerequisite"; body: string }
export interface FurtherReadingBlock extends BaseContentBlock { type: "further-reading"; sourceIds: string[]; body: string }

export type ContentBlock = ParagraphBlock | LearningObjectivesBlock | DefinitionBlock | IntuitionBlock | KeyIdeaBlock | TheoremBlock | DerivationBlock | FormulaBlock | WorkedExampleBlock | StepByStepBlock | CodeContentBlock | ComplexityBlock | ComparisonBlock | CommonMistakesBlock | ApplicationsBlock | ExerciseBlock | CalloutBlock | FurtherReadingBlock;

export interface Topic {
  id: string;
  slug: string;
  title: string;
  domainId: string;
  summary: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  prerequisiteIds: string[];
  relatedTopicIds: string[];
  objectives: LearningObjective[];
  glossary: GlossaryTerm[];
  content: ContentBlock[];
  revision: ContentRevisionMetadata;
}

export interface SyllabusModule {
  id: string;
  order: number;
  title: string;
  description: string;
  objectives: string[];
  topicIds: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  topicId?: string;
  x: number;
  y: number;
  kind?: "root" | "branch" | "leaf";
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface Domain {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  accent: string;
  icon: string;
  difficulty: Difficulty;
  contentLevel: ContentLevel;
  topicIds: string[];
  prerequisites: string[];
  startingPoint: string;
  keyConcepts: string[];
  syllabus: SyllabusModule[];
  roadmap: { nodes: GraphNode[]; edges: GraphEdge[] };
  mindMap: { nodes: GraphNode[]; edges: GraphEdge[] };
  algorithmIds: string[];
  techniqueIds: string[];
  projectIds: string[];
  resources: Resource[];
}

export interface Algorithm {
  id: string;
  slug: string;
  name: string;
  category: string;
  summary: string;
  intuition: string;
  prerequisiteIds: string[];
  pseudocode: string;
  python: string;
  timeComplexity: string;
  spaceComplexity: string;
  mistakes: string[];
  useCases: string[];
  relatedIds: string[];
  techniqueIds: string[];
  visualizer?: "binary-search" | "bfs" | "merge-sort";
}

export interface Technique {
  id: string;
  slug: string;
  name: string;
  family: "Algorithms" | "Machine Learning";
  summary: string;
  whenToUse: string[];
  steps: string[];
  topicIds: string[];
  algorithmIds: string[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  domainId: string;
  summary: string;
  difficulty: Difficulty;
  deliverables: string[];
  skillIds: string[];
}

export interface Resource {
  id: string;
  title: string;
  type: "Documentation" | "Book" | "Course" | "Paper" | "Reference";
  url?: string;
  note: string;
}

export type SearchResultType = "Concept" | "Domain" | "Topic" | "Algorithm" | "Technique" | "Project" | "Exercise" | "Problem" | "Roadmap" | "MindMap" | "Source" | "Library";
export interface SearchResult {
  id: string;
  title: string;
  type: SearchResultType;
  canonicalId?: string;
  hierarchy: string;
  href: string;
  keywords: string;
  titleVi?: string;
  hierarchyVi?: string;
}

export interface Bookmark {
  id: string;
  type: "topic" | "algorithm" | "technique" | "resource" | "library";
  title: string;
  href: string;
  context: string;
  createdAt: number;
}
