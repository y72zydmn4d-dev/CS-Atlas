import type { Domain, GraphEdge, GraphNode, Resource, SyllabusModule } from "@/lib/types";

const resource = (id: string, title: string, note: string, url?: string): Resource => ({ id, title, note, url, type: "Reference" });

function linearGraph(ids: string[], labels: string[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes = ids.map((id, index) => ({ id, label: labels[index], topicId: id, x: index % 4 * 230, y: Math.floor(index / 4) * 150, kind: index === 0 ? "root" as const : "leaf" as const }));
  const edges = ids.slice(1).map((id, index) => ({ id: `${ids[index]}-${id}`, source: ids[index], target: id }));
  return { nodes, edges };
}

function mindMap(root: string, groups: Array<[string, string, Array<[string, string]>]>): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [{ id: "root", label: root, x: 0, y: 220, kind: "root" }];
  const edges: GraphEdge[] = [];
  groups.forEach(([groupId, label, leaves], gi) => {
    nodes.push({ id: groupId, label, x: 280, y: gi * 210, kind: "branch" });
    edges.push({ id: `root-${groupId}`, source: "root", target: groupId });
    leaves.forEach(([id, leaf], li) => {
      nodes.push({ id, label: leaf, topicId: id, x: 560, y: gi * 210 + li * 74 - (leaves.length - 1) * 37, kind: "leaf" });
      edges.push({ id: `${groupId}-${id}`, source: groupId, target: id });
    });
  });
  return { nodes, edges };
}

function modules(titles: string[], topicGroups: string[][]): SyllabusModule[] {
  return titles.map((title, index) => ({
    id: `${String(index + 1).padStart(2, "0")}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    order: index + 1,
    title,
    description: `Build a working understanding of ${title.toLowerCase()} through focused concepts and practice.`,
    objectives: [`Explain the central ideas in ${title.toLowerCase()}`, "Apply the ideas to a concrete problem", "Recognize assumptions and failure modes"],
    topicIds: topicGroups[index] ?? [],
  }));
}

const specs = [
  {
    id: "programming", slug: "programming", name: "Programming", shortName: "Programming", icon: "Terminal", accent: "#60a5fa", difficulty: "Foundational" as const,
    description: "Build reliable programs by mastering control flow, decomposition, tooling, and the habits that make software understandable.",
    ids: ["programming-fundamentals", "python", "object-oriented-programming", "modules", "debugging", "git-basics"],
    groups: [["foundations", "Foundations", [["programming-fundamentals", "Fundamentals"], ["python", "Python"]]], ["craft", "Software Craft", [["modules", "Modules"], ["debugging", "Debugging"], ["git-basics", "Git"]]]],
    moduleTitles: ["Programming Fundamentals", "Python", "Program Design", "Developer Workflow"], moduleTopics: [["programming-fundamentals"], ["python"], ["object-oriented-programming", "modules"], ["debugging", "git-basics"]],
    prerequisites: ["No prior programming experience required"], startingPoint: "programming-fundamentals", keys: ["Decomposition", "State", "Control flow", "Testing"], algorithms: [], techniques: [], projects: ["cli-study-tracker"],
  },
  {
    id: "data-structures-algorithms", slug: "data-structures-algorithms", name: "Data Structures & Algorithms", shortName: "DSA", icon: "Binary", accent: "#a78bfa", difficulty: "Intermediate" as const,
    description: "Choose representations and procedures deliberately, prove why they work, and understand how their costs scale.",
    ids: ["complexity-analysis", "arrays", "strings", "linked-lists", "stacks-queues", "hash-tables", "trees", "heaps", "graphs", "recursion", "sorting", "searching", "graph-traversal", "shortest-paths", "greedy-algorithms", "dynamic-programming"],
    groups: [["structures", "Data Structures", [["arrays", "Arrays"], ["hash-tables", "Hash Tables"], ["trees", "Trees"], ["graphs", "Graphs"]]], ["algorithms", "Algorithms", [["sorting", "Sorting"], ["searching", "Searching"], ["graph-traversal", "Traversal"]]], ["paradigms", "Problem Solving", [["recursion", "Recursion"], ["greedy-algorithms", "Greedy"], ["dynamic-programming", "Dynamic Programming"]]]],
    moduleTitles: ["Complexity", "Arrays & Strings", "Linear Structures", "Hashing", "Trees & Heaps", "Graphs", "Recursion", "Sorting", "Searching", "Greedy", "Dynamic Programming"], moduleTopics: [["complexity-analysis"], ["arrays", "strings"], ["linked-lists", "stacks-queues"], ["hash-tables"], ["trees", "heaps"], ["graphs", "graph-traversal", "shortest-paths"], ["recursion"], ["sorting"], ["searching"], ["greedy-algorithms"], ["dynamic-programming"]],
    prerequisites: ["Comfort with one programming language", "Functions, loops, and collections"], startingPoint: "complexity-analysis", keys: ["Complexity", "Invariants", "Traversal", "Optimization"], algorithms: ["binary-search", "bfs", "dfs", "dijkstra", "merge-sort", "quick-sort", "sliding-window", "two-pointers", "prefix-sum", "knapsack-01"], techniques: ["two-pointers", "sliding-window", "prefix-sum", "binary-search-on-answer", "divide-and-conquer", "greedy", "backtracking", "memoization", "tabulation", "bit-manipulation"], projects: ["route-planner", "algorithm-lab"],
  },
  {
    id: "mathematics-ai", slug: "mathematics-for-ai", name: "Mathematics for AI", shortName: "Math for AI", icon: "Sigma", accent: "#22d3ee", difficulty: "Intermediate" as const,
    description: "Develop the mathematical language needed to reason about representations, uncertainty, learning, and optimization.",
    ids: ["linear-algebra", "vectors-matrices", "eigenvalues", "calculus", "multivariable-calculus", "probability", "statistics", "optimization", "gradient-descent"],
    groups: [["linear", "Linear Algebra", [["vectors-matrices", "Vectors & Matrices"], ["eigenvalues", "Eigenvectors"]]], ["change", "Calculus", [["calculus", "Derivatives"], ["multivariable-calculus", "Gradients"]]], ["uncertainty", "Uncertainty", [["probability", "Probability"], ["statistics", "Statistics"]]], ["learning", "Optimization", [["optimization", "Objectives"], ["gradient-descent", "Gradient Descent"]]]],
    moduleTitles: ["Vectors", "Matrices", "Linear Transformations", "Calculus", "Multivariable Calculus", "Probability", "Statistics", "Optimization"], moduleTopics: [["vectors-matrices"], ["linear-algebra"], ["eigenvalues"], ["calculus"], ["multivariable-calculus"], ["probability"], ["statistics"], ["optimization", "gradient-descent"]],
    prerequisites: ["High-school algebra", "Comfort manipulating equations"], startingPoint: "linear-algebra", keys: ["Vectors", "Gradients", "Probability", "Optimization"], algorithms: [], techniques: ["normalization", "standardization"], projects: ["gradient-notebook"],
  },
  {
    id: "data-science", slug: "data-science", name: "Data Science", shortName: "Data Science", icon: "ChartNoAxesCombined", accent: "#34d399", difficulty: "Intermediate" as const,
    description: "Turn raw data into trustworthy evidence through reproducible transformation, exploration, and communication.",
    ids: ["numpy", "pandas", "data-cleaning", "data-visualization", "exploratory-data-analysis", "feature-processing"],
    groups: [["compute", "Data Computing", [["numpy", "NumPy"], ["pandas", "Pandas"]]], ["workflow", "Analysis Workflow", [["data-cleaning", "Cleaning"], ["exploratory-data-analysis", "EDA"], ["data-visualization", "Visualization"]]]],
    moduleTitles: ["Array Computing", "Tabular Data", "Data Quality", "Exploration", "Visualization", "Feature Processing"], moduleTopics: [["numpy"], ["pandas"], ["data-cleaning"], ["exploratory-data-analysis"], ["data-visualization"], ["feature-processing"]],
    prerequisites: ["Python fundamentals", "Basic statistics"], startingPoint: "numpy", keys: ["NumPy", "Pandas", "EDA", "Data quality"], algorithms: [], techniques: ["normalization", "standardization", "feature-engineering"], projects: ["data-quality-audit"],
  },
  {
    id: "machine-learning", slug: "machine-learning", name: "Machine Learning", shortName: "Machine Learning", icon: "BrainCircuit", accent: "#f59e0b", difficulty: "Intermediate" as const,
    description: "Learn models as systems of assumptions, objectives, optimization, and evidence—not as a catalog of estimators.",
    ids: ["ml-fundamentals", "supervised-learning", "linear-regression", "logistic-regression", "decision-trees", "support-vector-machines", "clustering", "principal-component-analysis", "model-evaluation", "ensemble-learning", "regression-losses"],
    groups: [["supervised", "Supervised Learning", [["linear-regression", "Regression"], ["logistic-regression", "Classification"], ["decision-trees", "Trees"], ["support-vector-machines", "SVM"]]], ["unsupervised", "Unsupervised Learning", [["clustering", "Clustering"], ["principal-component-analysis", "Dimensionality Reduction"]]], ["evaluation", "Evaluation", [["model-evaluation", "Metrics & Validation"], ["ensemble-learning", "Ensembles"]]]],
    moduleTitles: ["Fundamentals", "Data Preparation", "Linear Regression", "Logistic Regression", "Nearest Neighbors", "Decision Trees", "Random Forests", "Support Vector Machines", "Clustering", "Dimensionality Reduction", "Model Evaluation", "Ensemble Learning"], moduleTopics: [["ml-fundamentals", "supervised-learning"], ["feature-processing"], ["linear-regression", "regression-losses"], ["logistic-regression"], ["supervised-learning"], ["decision-trees"], ["ensemble-learning"], ["support-vector-machines"], ["clustering"], ["principal-component-analysis"], ["model-evaluation"], ["ensemble-learning"]],
    prerequisites: ["Python and NumPy", "Linear algebra", "Probability and statistics"], startingPoint: "ml-fundamentals", keys: ["Generalization", "Loss functions", "Validation", "Feature spaces"], algorithms: [], techniques: ["normalization", "standardization", "feature-engineering", "cross-validation", "regularization", "hyperparameter-tuning", "ensembling"], projects: ["model-selection-workbench"],
  },
  {
    id: "deep-learning", slug: "deep-learning", name: "Deep Learning", shortName: "Deep Learning", icon: "Network", accent: "#fb7185", difficulty: "Advanced" as const,
    description: "Understand representation learning through computation graphs, gradient flow, architecture, and disciplined experimentation.", ids: ["neural-networks", "activation-functions", "backpropagation", "deep-optimization", "convolutional-networks", "recurrent-networks", "transformers"],
    groups: [["foundations", "Foundations", [["neural-networks", "Neural Networks"], ["backpropagation", "Backpropagation"], ["deep-optimization", "Optimization"]]], ["architectures", "Architectures", [["convolutional-networks", "CNN"], ["recurrent-networks", "RNN"], ["transformers", "Transformers"]]]],
    moduleTitles: ["Neural Networks", "Activations", "Backpropagation", "Optimization", "CNNs", "Sequence Models", "Transformers"], moduleTopics: [["neural-networks"], ["activation-functions"], ["backpropagation"], ["deep-optimization"], ["convolutional-networks"], ["recurrent-networks"], ["transformers"]],
    prerequisites: ["Machine learning fundamentals", "Linear algebra and calculus"], startingPoint: "neural-networks", keys: ["Computation graphs", "Gradient flow", "Representations", "Architectures"], algorithms: [], techniques: ["regularization", "data-augmentation", "transfer-learning", "fine-tuning"], projects: ["tiny-autodiff"],
  },
  {
    id: "computer-vision", slug: "computer-vision", name: "Computer Vision", shortName: "Vision", icon: "ScanEye", accent: "#38bdf8", difficulty: "Advanced" as const,
    description: "Build systems that extract semantic and geometric structure from visual signals.", ids: ["image-representation", "opencv-basics", "convolutional-networks", "image-classification", "object-detection", "image-segmentation"],
    groups: [["signals", "Image Foundations", [["image-representation", "Pixels & Color"], ["opencv-basics", "Classical Vision"]]], ["tasks", "Vision Tasks", [["image-classification", "Classification"], ["object-detection", "Detection"], ["image-segmentation", "Segmentation"]]]],
    moduleTitles: ["Images as Data", "Classical Vision", "Visual Features", "Classification", "Detection", "Segmentation"], moduleTopics: [["image-representation"], ["opencv-basics"], ["convolutional-networks"], ["image-classification"], ["object-detection"], ["image-segmentation"]],
    prerequisites: ["Python and NumPy", "Deep learning fundamentals"], startingPoint: "image-representation", keys: ["Pixels", "Convolutions", "Detection", "Segmentation"], algorithms: [], techniques: ["data-augmentation", "transfer-learning", "fine-tuning"], projects: ["image-segmenter"],
  },
  {
    id: "nlp", slug: "natural-language-processing", name: "Natural Language Processing", shortName: "NLP", icon: "Languages", accent: "#c084fc", difficulty: "Advanced" as const,
    description: "Represent and model language while respecting sequence, context, ambiguity, and evaluation design.", ids: ["text-preprocessing", "word-embeddings", "sequence-models", "attention", "nlp-transformers"],
    groups: [["representation", "Representation", [["text-preprocessing", "Text Processing"], ["word-embeddings", "Embeddings"]]], ["models", "Sequence Modeling", [["sequence-models", "Sequence Models"], ["attention", "Attention"], ["nlp-transformers", "Transformers"]]]],
    moduleTitles: ["Text Processing", "Vector Semantics", "Sequence Models", "Attention", "Transformers"], moduleTopics: [["text-preprocessing"], ["word-embeddings"], ["sequence-models"], ["attention"], ["nlp-transformers"]],
    prerequisites: ["Machine learning", "Probability", "Deep learning basics"], startingPoint: "text-preprocessing", keys: ["Tokens", "Embeddings", "Attention", "Evaluation"], algorithms: [], techniques: ["transfer-learning", "fine-tuning"], projects: ["text-classifier"],
  },
  {
    id: "llm-engineering", slug: "llm-engineering", name: "LLM Engineering", shortName: "LLM Engineering", icon: "Sparkles", accent: "#f472b6", difficulty: "Advanced" as const,
    description: "Engineer reliable language-model systems around retrieval, tools, evaluation, context, and operational constraints.", ids: ["llm-transformers", "semantic-embeddings", "vector-search", "rag", "prompting", "ai-agents", "llm-evaluation", "llm-fine-tuning"],
    groups: [["models", "Model Interface", [["llm-transformers", "Transformers"], ["prompting", "Prompting"]]], ["grounding", "Grounding", [["semantic-embeddings", "Embeddings"], ["vector-search", "Vector Search"], ["rag", "RAG"]]], ["systems", "Systems", [["ai-agents", "Agents"], ["llm-evaluation", "Evaluation"], ["llm-fine-tuning", "Fine-tuning"]]]],
    moduleTitles: ["Transformer Systems", "Embeddings", "Vector Retrieval", "RAG", "Prompt Interfaces", "Agents", "Evaluation", "Fine-tuning"], moduleTopics: [["llm-transformers"], ["semantic-embeddings"], ["vector-search"], ["rag"], ["prompting"], ["ai-agents"], ["llm-evaluation"], ["llm-fine-tuning"]],
    prerequisites: ["NLP and transformers", "Software engineering fundamentals"], startingPoint: "llm-transformers", keys: ["Context", "Retrieval", "Tools", "Evaluation"], algorithms: [], techniques: ["fine-tuning", "ensembling"], projects: ["grounded-assistant"],
  },
  {
    id: "ai-engineering", slug: "ai-engineering", name: "AI Engineering", shortName: "AI Engineering", icon: "Blocks", accent: "#2dd4bf", difficulty: "Advanced" as const,
    description: "Move models into dependable products with typed interfaces, serving systems, evaluation, and observability.", ids: ["ai-apis", "model-inference", "model-serving", "vector-databases", "ai-observability", "ai-deployment"],
    groups: [["runtime", "Runtime", [["ai-apis", "APIs"], ["model-inference", "Inference"], ["model-serving", "Serving"]]], ["operations", "Operations", [["vector-databases", "Vector Stores"], ["ai-observability", "Observability"], ["ai-deployment", "Deployment"]]]],
    moduleTitles: ["AI APIs", "Inference", "Model Serving", "Vector Databases", "Observability", "Evaluation", "Deployment"], moduleTopics: [["ai-apis"], ["model-inference"], ["model-serving"], ["vector-databases"], ["ai-observability"], ["llm-evaluation"], ["ai-deployment"]],
    prerequisites: ["Backend development", "Machine learning fundamentals"], startingPoint: "ai-apis", keys: ["Serving", "Latency", "Observability", "Deployment"], algorithms: [], techniques: ["hyperparameter-tuning"], projects: ["inference-service"],
  },
];

const customRoadmaps: Record<string, Domain["roadmap"]> = {
  "data-structures-algorithms": {
    nodes: [
      { id: "complexity-analysis", label: "Complexity Analysis", topicId: "complexity-analysis", x: 0, y: 250, kind: "root" },
      { id: "arrays", label: "Arrays", topicId: "arrays", x: 230, y: 80 },
      { id: "recursion", label: "Recursion", topicId: "recursion", x: 230, y: 420 },
      { id: "strings", label: "Strings", topicId: "strings", x: 460, y: 0 },
      { id: "linked-lists", label: "Linked Lists", topicId: "linked-lists", x: 460, y: 120 },
      { id: "stacks-queues", label: "Stacks & Queues", topicId: "stacks-queues", x: 460, y: 240 },
      { id: "hash-tables", label: "Hash Tables", topicId: "hash-tables", x: 460, y: 360 },
      { id: "sorting", label: "Sorting", topicId: "sorting", x: 460, y: 480 },
      { id: "searching", label: "Searching", topicId: "searching", x: 690, y: 40 },
      { id: "trees", label: "Trees", topicId: "trees", x: 690, y: 170 },
      { id: "graphs", label: "Graphs", topicId: "graphs", x: 690, y: 300 },
      { id: "greedy-algorithms", label: "Greedy", topicId: "greedy-algorithms", x: 690, y: 450 },
      { id: "dynamic-programming", label: "Dynamic Programming", topicId: "dynamic-programming", x: 690, y: 570 },
      { id: "heaps", label: "Heaps", topicId: "heaps", x: 920, y: 140 },
      { id: "graph-traversal", label: "Graph Traversal", topicId: "graph-traversal", x: 920, y: 300 },
      { id: "shortest-paths", label: "Shortest Paths", topicId: "shortest-paths", x: 1150, y: 230 },
    ],
    edges: [
      { id: "complexity-arrays", source: "complexity-analysis", target: "arrays" }, { id: "complexity-recursion", source: "complexity-analysis", target: "recursion" },
      { id: "arrays-strings", source: "arrays", target: "strings" }, { id: "arrays-linked", source: "arrays", target: "linked-lists" }, { id: "arrays-stacks", source: "arrays", target: "stacks-queues" }, { id: "arrays-hash", source: "arrays", target: "hash-tables" }, { id: "arrays-sorting", source: "arrays", target: "sorting" },
      { id: "sorting-searching", source: "sorting", target: "searching" }, { id: "linked-trees", source: "linked-lists", target: "trees" }, { id: "recursion-trees", source: "recursion", target: "trees" },
      { id: "hash-graphs", source: "hash-tables", target: "graphs" }, { id: "stacks-graphs", source: "stacks-queues", target: "graphs" }, { id: "sorting-greedy", source: "sorting", target: "greedy-algorithms" }, { id: "recursion-dp", source: "recursion", target: "dynamic-programming" },
      { id: "trees-heaps", source: "trees", target: "heaps" }, { id: "graphs-traversal", source: "graphs", target: "graph-traversal" }, { id: "graphs-shortest", source: "graphs", target: "shortest-paths" }, { id: "heaps-shortest", source: "heaps", target: "shortest-paths" },
    ],
  },
  "mathematics-ai": {
    nodes: [
      { id: "math-entry", label: "Mathematical Foundations", x: 0, y: 260, kind: "root" },
      { id: "linear-algebra", label: "Linear Algebra", topicId: "linear-algebra", x: 230, y: 70 }, { id: "calculus", label: "Calculus", topicId: "calculus", x: 230, y: 260 }, { id: "probability", label: "Probability", topicId: "probability", x: 230, y: 450 },
      { id: "vectors-matrices", label: "Vectors & Matrices", topicId: "vectors-matrices", x: 470, y: 70 }, { id: "multivariable-calculus", label: "Multivariable Calculus", topicId: "multivariable-calculus", x: 470, y: 260 }, { id: "statistics", label: "Statistics", topicId: "statistics", x: 470, y: 450 },
      { id: "eigenvalues", label: "Eigenvalues", topicId: "eigenvalues", x: 710, y: 70 }, { id: "optimization", label: "Optimization", topicId: "optimization", x: 710, y: 260 }, { id: "gradient-descent", label: "Gradient Descent", topicId: "gradient-descent", x: 950, y: 260 },
    ],
    edges: [
      { id: "entry-linear", source: "math-entry", target: "linear-algebra" }, { id: "entry-calculus", source: "math-entry", target: "calculus" }, { id: "entry-probability", source: "math-entry", target: "probability" },
      { id: "linear-vectors", source: "linear-algebra", target: "vectors-matrices" }, { id: "vectors-eigen", source: "vectors-matrices", target: "eigenvalues" }, { id: "calculus-multi", source: "calculus", target: "multivariable-calculus" }, { id: "vectors-multi", source: "vectors-matrices", target: "multivariable-calculus" }, { id: "probability-statistics", source: "probability", target: "statistics" },
      { id: "multi-optimization", source: "multivariable-calculus", target: "optimization" }, { id: "linear-optimization", source: "linear-algebra", target: "optimization" }, { id: "optimization-gradient", source: "optimization", target: "gradient-descent" },
    ],
  },
  "machine-learning": {
    nodes: [
      { id: "ml-entry", label: "Math + Programming + Data", x: 0, y: 260, kind: "root" }, { id: "ml-fundamentals", label: "ML Fundamentals", topicId: "ml-fundamentals", x: 230, y: 260 },
      { id: "supervised-learning", label: "Supervised Learning", topicId: "supervised-learning", x: 470, y: 130 }, { id: "clustering", label: "Unsupervised Learning", topicId: "clustering", x: 470, y: 390 },
      { id: "linear-regression", label: "Linear Regression", topicId: "linear-regression", x: 710, y: 20 }, { id: "logistic-regression", label: "Logistic Regression", topicId: "logistic-regression", x: 710, y: 130 }, { id: "decision-trees", label: "Decision Trees", topicId: "decision-trees", x: 710, y: 240 }, { id: "support-vector-machines", label: "Support Vector Machines", topicId: "support-vector-machines", x: 710, y: 350 }, { id: "principal-component-analysis", label: "PCA", topicId: "principal-component-analysis", x: 710, y: 460 },
      { id: "regression-losses", label: "Regression Losses", topicId: "regression-losses", x: 950, y: 20 }, { id: "model-evaluation", label: "Model Evaluation", topicId: "model-evaluation", x: 950, y: 230 }, { id: "ensemble-learning", label: "Ensemble Learning", topicId: "ensemble-learning", x: 1190, y: 230 },
    ],
    edges: [
      { id: "entry-fundamentals", source: "ml-entry", target: "ml-fundamentals" }, { id: "fundamentals-supervised", source: "ml-fundamentals", target: "supervised-learning" }, { id: "fundamentals-unsupervised", source: "ml-fundamentals", target: "clustering" },
      { id: "supervised-linear", source: "supervised-learning", target: "linear-regression" }, { id: "supervised-logistic", source: "supervised-learning", target: "logistic-regression" }, { id: "supervised-trees", source: "supervised-learning", target: "decision-trees" }, { id: "supervised-svm", source: "supervised-learning", target: "support-vector-machines" },
      { id: "linear-losses", source: "linear-regression", target: "regression-losses" }, { id: "clustering-pca", source: "clustering", target: "principal-component-analysis" }, { id: "linear-evaluation", source: "linear-regression", target: "model-evaluation" }, { id: "logistic-evaluation", source: "logistic-regression", target: "model-evaluation" }, { id: "trees-evaluation", source: "decision-trees", target: "model-evaluation" }, { id: "evaluation-ensemble", source: "model-evaluation", target: "ensemble-learning" }, { id: "trees-ensemble", source: "decision-trees", target: "ensemble-learning" },
    ],
  },
};

export const domains: Domain[] = specs.map((spec) => ({
  id: spec.id,
  slug: spec.slug,
  name: spec.name,
  shortName: spec.shortName,
  icon: spec.icon,
  accent: spec.accent,
  difficulty: spec.difficulty,
  contentLevel: (["data-structures-algorithms", "mathematics-ai", "machine-learning"].includes(spec.id) ? "Developing" : "Foundation") as Domain["contentLevel"],
  description: spec.description,
  topicIds: spec.ids,
  prerequisites: spec.prerequisites,
  startingPoint: spec.startingPoint,
  keyConcepts: spec.keys,
  syllabus: modules(spec.moduleTitles, spec.moduleTopics),
  roadmap: customRoadmaps[spec.id] ?? linearGraph(spec.ids, spec.ids.map((id) => id.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" "))),
  mindMap: mindMap(spec.shortName, spec.groups as Array<[string, string, Array<[string, string]>]>),
  algorithmIds: spec.algorithms,
  techniqueIds: spec.techniques,
  projectIds: spec.projects,
  resources: [
    resource(`${spec.id}-guide`, `${spec.shortName} field guide`, "A structured reading path aligned with this atlas."),
    resource(`${spec.id}-practice`, `${spec.shortName} practice set`, "Progressive exercises from recall to implementation."),
  ],
}));
