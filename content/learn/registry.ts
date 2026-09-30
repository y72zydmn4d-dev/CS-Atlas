import { lessons as legacyLessons } from "@/content/lessons";
import type { ConceptId, LocalizedConceptText } from "@/lib/domain/concepts";
import type {
  CurriculumSection,
  LearnContentStatus,
  LearnRouteAlias,
  LessonManifest,
  SubjectCategory,
  SubjectManifest,
} from "@/lib/domain/learn-platform";

const text = (value: string): LocalizedConceptText => ({ en: value, vi: value });

function slugify(value: string) {
  return value.toLowerCase().replaceAll("c++", "cpp").replaceAll("c#", "csharp").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type LessonSeed = string | [title: string, slug: string, conceptId?: ConceptId];
type SectionSeed = [title: string, lessons: LessonSeed[]];

const authoredLessonIds = new Set([
  "learn:python:introduction",
  "learn:python:variables",
  "learn:python:strings",
  "learn:python:lists",
  "learn:python:functions",
  "learn:dsa:complexity",
  "learn:dsa:arrays",
  "learn:dsa:binary-search",
  "learn:dsa:graph-traversal",
]);

function buildSections(subjectId: string, fallbackConceptId: ConceptId, seeds: SectionSeed[]): CurriculumSection[] {
  return seeds.map(([sectionTitle, lessonSeeds], sectionIndex) => {
    const sectionId = `learn-section:${subjectId}:${slugify(sectionTitle)}`;
    const lessons: LessonManifest[] = lessonSeeds.map((seed, lessonIndex) => {
      const [title, slug, conceptId] = typeof seed === "string" ? [seed, slugify(seed), fallbackConceptId] : [seed[0], seed[1], seed[2] ?? fallbackConceptId];
      const id = `learn:${subjectId}:${slug}`;
      const authored = authoredLessonIds.has(id);
      return {
        id,
        subjectId,
        sectionId,
        slug,
        title: text(title),
        description: text(`Learn ${title.toLowerCase()} through concise explanations, examples, and connected practice.`),
        order: lessonIndex + 1,
        conceptIds: [conceptId],
        prerequisiteLessonIds: lessonIndex > 0 ? [`learn:${subjectId}:${typeof lessonSeeds[lessonIndex - 1] === "string" ? slugify(lessonSeeds[lessonIndex - 1] as string) : (lessonSeeds[lessonIndex - 1] as [string, string])[1]}`] : [],
        estimatedMinutes: authored ? 18 : 12,
        difficulty: sectionIndex < 3 ? "Foundational" : sectionIndex < 7 ? "Intermediate" : "Advanced",
        status: authored ? "COMPLETE" : "SKELETON",
        translationStatus: "english-only",
        ...(authored ? { contentSource: `content/learn/lesson-content.ts#${id}` } : {}),
        exerciseIds: id === "learn:dsa:arrays" ? ["exercise:array-linear-scan"] : [],
        problemIds: id === "learn:dsa:binary-search" ? ["first-occurrence"] : id === "learn:dsa:graph-traversal" ? ["unweighted-distance"] : [],
      };
    });
    return { id: sectionId, subjectId, title: text(sectionTitle), order: sectionIndex + 1, lessons };
  });
}

function subject(input: {
  id: string;
  navigationOrder: number;
  title: string;
  description: string;
  category: SubjectCategory;
  icon: string;
  status: LearnContentStatus;
  conceptId: ConceptId;
  sections: SectionSeed[];
}): SubjectManifest {
  const sections = buildSections(input.id, input.conceptId, input.sections);
  return {
    id: input.id,
    slug: input.id,
    navigationOrder: input.navigationOrder,
    title: text(input.title),
    description: text(input.description),
    category: input.category,
    icon: input.icon,
    status: input.status,
    translationStatus: "english-only",
    conceptIds: [input.conceptId],
    sections,
    references: input.id === "python" ? [
      { id: "python-builtins", title: text("Built-in functions"), order: 1, referenceIds: ["python-ref-len", "python-ref-range", "python-ref-enumerate"] },
      { id: "python-list-methods", title: text("List methods"), order: 2, referenceIds: ["python-ref-list-append", "python-ref-list-pop", "python-ref-list-sort"] },
    ] : input.id === "dsa" ? [
      { id: "dsa-complexity", title: text("Complexity reference"), order: 1, referenceIds: ["dsa-ref-growth-rates", "dsa-ref-search-complexity"] },
    ] : [],
    exerciseGroups: input.id === "dsa" ? [
      { id: "dsa-array-exercises", title: text("Arrays and searching"), lessonIds: ["learn:dsa:arrays", "learn:dsa:binary-search"], exerciseIds: ["exercise:array-linear-scan"] },
    ] : [],
    quizGroups: input.id === "python" ? [
      { id: "python-basics-quiz", title: text("Python basics quiz"), lessonIds: ["learn:python:introduction", "learn:python:variables", "learn:python:strings"], questionIds: ["python-quiz-dynamic-types", "python-quiz-string-index"] },
      { id: "python-collections-quiz", title: text("Python collections quiz"), lessonIds: ["learn:python:lists"], questionIds: ["python-quiz-list-mutation"] },
    ] : input.id === "dsa" ? [
      { id: "dsa-foundations-quiz", title: text("DSA foundations quiz"), lessonIds: ["learn:dsa:complexity", "learn:dsa:arrays", "learn:dsa:binary-search"], questionIds: ["dsa-quiz-binary-search", "dsa-quiz-growth"] },
    ] : [],
    relatedRoadmapIds: input.id === "dsa" ? ["roadmap:data-structures-algorithms"] : [],
    relatedProblemIds: input.id === "dsa" ? ["first-occurrence", "unweighted-distance"] : [],
  };
}

const pythonSections: SectionSeed[] = [
  ["Getting started", ["Python Home", "Introduction", "Installation", "Syntax", "Comments"]],
  ["Variables", ["Variables", "Variable Names", "Multiple Values", "Output", "Global Variables", "Scope"]],
  ["Data types", ["Data Types", "Numbers", "Casting", "Booleans", "None"]],
  ["Strings", ["Strings", "Slicing", "Modify Strings", "Concatenation", "Formatting", "Escape Characters", "String Methods"]],
  ["Operators", ["Arithmetic", "Assignment", "Comparison", "Logical", "Identity", "Membership", "Bitwise", "Precedence"]],
  ["Collections", ["Lists", "Access Lists", "Change Lists", "Add Items", "Remove Items", "Loop Lists", "List Comprehensions", "Sort Lists", "Copy Lists", "Join Lists", "Tuples", "Access Tuples", "Update Tuples", "Unpack Tuples", "Loop Tuples", "Join Tuples", "Sets", "Access Sets", "Add Set Items", "Remove Set Items", "Loop Sets", "Join Sets", "Frozenset", "Dictionaries", "Access Dictionaries", "Change Dictionaries", "Add Dictionary Items", "Remove Dictionary Items", "Loop Dictionaries", "Copy Dictionaries", "Nested Dictionaries"]],
  ["Control flow", ["If", "Elif", "Else", "Conditional Expressions", "Nested Conditions", "Match", "While", "For", "Range", "Pass"]],
  ["Functions", ["Functions", "Arguments", "Positional Arguments", "Keyword Arguments", "Default Arguments", "*args", "**kwargs", "Return Values", "Lambda", "Recursion", "Decorators", "Generators"]],
  ["Modules", ["Modules", "Import", "Packages", "pip", "Virtual Environments"]],
  ["Object-oriented programming", ["Classes", "Objects", "__init__", "self", "Properties", "Methods", "Class Methods", "Static Methods", "Inheritance", "Polymorphism", "Encapsulation", "Abstract Classes", "Dataclasses", "Inner Classes"]],
  ["Magic methods", ["__str__", "__repr__", "__eq__", "__lt__", "__len__", "__contains__", "__call__", "Arithmetic Operators", "Comparison Operators"]],
  ["Iteration and errors", ["Iterables", "Iterators", ["Generator Iteration", "generator-iteration"], "Exceptions", "Try", "Except", "Else Clause", "Finally", "Raise", "Custom Exceptions"]],
  ["Files and formats", ["Open Files", "Read Files", "Write Files", "Append Files", "Delete Files", "Paths", "Context Managers", "JSON", "CSV"]],
  ["Standard library", ["Dates", "Math", "Random", "Statistics", "Collections Module", "itertools", "functools", "pathlib", "os", "sys", "re"]],
  ["Advanced", ["Type Hints", "Typing", "Comprehensions", "Closures", "Async and Await", "Concurrency Overview", "Testing", "Logging", "Debugging", "Performance Basics"]],
];

const dsaSections: SectionSeed[] = [
  ["Foundations", [["Algorithms", "algorithms", "topic:complexity-analysis"], ["Data Structures", "data-structures", "topic:arrays"], ["Complexity", "complexity", "topic:complexity-analysis"], "Big O", "Big Theta", "Big Omega", "Space Complexity"]],
  ["Arrays and strings", [["Arrays", "arrays", "topic:arrays"], ["Strings", "strings", "topic:strings"], "Matrices"]],
  ["Searching", [["Linear Search", "linear-search", "topic:searching"], ["Binary Search", "binary-search", "topic:searching"], "Lower and Upper Bound", "Binary Search on Answer"]],
  ["Sorting", [["Bubble Sort", "bubble-sort", "topic:sorting"], "Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort", "Counting Sort", "Radix Sort", "Heap Sort"]],
  ["Linked structures", [["Linked List", "linked-list", "topic:linked-lists"], "Doubly Linked List", "Circular List"]],
  ["Stack and queue", [["Stack", "stack", "topic:stacks-queues"], ["Queue", "queue", "topic:stacks-queues"], "Deque", "Monotonic Stack", "Monotonic Queue"]],
  ["Hashing", [["Hash Table", "hash-table", "topic:hash-tables"], "Hash Set", "Hash Map", "Frequency Maps"]],
  ["Patterns", ["Two Pointers", "Sliding Window", "Prefix Sum", "Difference Array"]],
  ["Recursion", [["Recursion", "recursion", "topic:recursion"], "Backtracking", "Divide and Conquer"]],
  ["Trees and heaps", [["Tree Basics", "tree-basics", "topic:trees"], "Binary Tree", "Tree Traversal", "Binary Search Tree", "AVL Tree", "Trie", ["Heap", "heap", "topic:heaps"], "Priority Queue"]],
  ["Graphs", [["Graph Representation", "graph-representation", "topic:graphs"], ["Graph Traversal", "graph-traversal", "topic:graph-traversal"], "Breadth-First Search", "Depth-First Search", "Components", "Cycle Detection", "Topological Sort"]],
  ["Shortest paths and MST", [["BFS Shortest Path", "bfs-shortest-path", "topic:shortest-paths"], "Dijkstra", "Bellman-Ford", "Floyd-Warshall", "0-1 BFS", "Disjoint Set Union", "Kruskal", "Prim"]],
  ["Advanced graphs", ["Strongly Connected Components", "Bridges", "Articulation Points", "Lowest Common Ancestor", "Binary Lifting", "Euler Tour", "Flow", "Matching"]],
  ["Greedy and dynamic programming", [["Greedy Strategy", "greedy-strategy", "topic:greedy-algorithms"], "Interval Problems", "Scheduling", ["DP Fundamentals", "dp-fundamentals", "topic:dynamic-programming"], "1D DP", "2D DP", "Knapsack", "Longest Increasing Subsequence", "Longest Common Subsequence", "Interval DP", "Tree DP", "Bitmask DP", "Digit DP"]],
  ["Range and string algorithms", ["Fenwick Tree", "Segment Tree", "Lazy Propagation", "Sparse Table", "KMP", "Prefix Function", "Z Algorithm", "Rolling Hash", "Trie for Strings"]],
  ["Number theory and geometry", ["GCD", "Extended GCD", "Prime Sieve", "Factorization", "Modular Arithmetic", "Fast Exponentiation", "Combinatorics", "Points and Vectors", "Orientation", "Line Intersection", "Convex Hull"]],
  ["Advanced topics", ["Coordinate Compression", "Offline Queries", "Meet in the Middle", "Mo's Algorithm", "Heavy-Light Decomposition"]],
];

export const learnSubjects: SubjectManifest[] = [
  subject({ id: "python", navigationOrder: 5, title: "Python", description: "A precise path from Python fundamentals through the object model, standard library, testing, and concurrency.", category: "programming-languages", icon: "Code2", status: "PARTIAL", conceptId: "topic:python", sections: pythonSections }),
  subject({ id: "dsa", navigationOrder: 9, title: "Data Structures & Algorithms", description: "Foundations, reusable problem-solving patterns, core structures, graph algorithms, dynamic programming, and advanced techniques.", category: "computer-science", icon: "Network", status: "PARTIAL", conceptId: "topic:complexity-analysis", sections: dsaSections }),
  subject({ id: "c", navigationOrder: 7, title: "C", description: "Procedural programming, memory, pointers, data structures, files, and systems-oriented foundations.", category: "programming-languages", icon: "Terminal", status: "SKELETON", conceptId: "topic:programming-fundamentals", sections: [["Foundations", ["Introduction", "Toolchain", "Syntax", "Types", "Operators", "Control Flow", "Functions"]], ["Memory and data", ["Arrays", "Strings", "Pointers", "Dynamic Memory", "Structures", "Files", "Errors"]]] }),
  subject({ id: "cpp", navigationOrder: 8, title: "C++", description: "Modern C++ foundations, value semantics, the standard library, generic programming, and resource-safe design.", category: "programming-languages", icon: "Braces", status: "SKELETON", conceptId: "topic:programming-fundamentals", sections: [["Language", ["Introduction", "Types", "Control Flow", "Functions", "References", "Pointers"]], ["Abstraction", ["Classes", "RAII", "Inheritance", "Templates", "STL Containers", "Algorithms"]]] }),
  subject({ id: "java", navigationOrder: 6, title: "Java", description: "Java syntax, object-oriented design, collections, streams, concurrency, testing, and runtime fundamentals.", category: "programming-languages", icon: "Coffee", status: "SKELETON", conceptId: "topic:object-oriented-programming", sections: [["Foundations", ["Introduction", "Types", "Control Flow", "Methods", "Arrays"]], ["Object model", ["Classes", "Inheritance", "Interfaces", "Exceptions", "Collections", "Streams", "Concurrency"]]] }),
  subject({ id: "javascript", navigationOrder: 3, title: "JavaScript", description: "The JavaScript language, browser platform, asynchronous programming, modules, and modern application patterns.", category: "programming-languages", icon: "FileCode2", status: "SKELETON", conceptId: "topic:programming-fundamentals", sections: [["Language", ["Syntax", "Variables", "Types", "Operators", "Control Flow", "Functions", "Objects", "Arrays", "Strings"]], ["Modern JavaScript", ["Classes", "Modules", "Promises", "Async and Await", "Iterators", "Generators", "Errors"]], ["Browser", ["DOM", "Events", "Fetch", "Storage"]]] }),
  subject({ id: "html", navigationOrder: 1, title: "HTML", description: "Semantic document structure, forms, media, metadata, graphics, and accessible markup.", category: "web-development", icon: "FileType2", status: "SKELETON", conceptId: "topic:programming-fundamentals", sections: [["Document", ["Document Structure", "Elements", "Attributes", "Headings", "Paragraphs", "Links", "Images", "Lists", "Tables"]], ["Semantic web", ["Semantic HTML", "Forms", "Media", "Accessibility", "Metadata", "Canvas", "SVG"]]] }),
  subject({ id: "css", navigationOrder: 2, title: "CSS", description: "Cascade, layout, responsive design, typography, motion, and modern styling primitives.", category: "web-development", icon: "Palette", status: "SKELETON", conceptId: "topic:programming-fundamentals", sections: [["Core", ["Syntax", "Selectors", "Cascade", "Specificity", "Box Model", "Units", "Colors", "Typography"]], ["Layout", ["Display", "Position", "Flexbox", "Grid", "Responsive Design"]], ["Modern CSS", ["Variables", "Functions", "Transforms", "Transitions", "Animations"]]] }),
  subject({ id: "sql", navigationOrder: 4, title: "SQL", description: "Relational querying, joins, aggregation, schema design, constraints, transactions, and performance fundamentals.", category: "data-databases", icon: "Database", status: "SKELETON", conceptId: "topic:programming-fundamentals", sections: [["Queries", ["Select", "Filter", "Sort", "Aggregate", "Group By", "Joins", "Subqueries"]], ["Data definition", ["Tables", "Keys", "Constraints", "Indexes", "Transactions", "Views"]]] }),
  subject({ id: "numpy", navigationOrder: 10, title: "NumPy", description: "Typed multidimensional arrays, vectorized operations, broadcasting, aggregation, random sampling, and linear algebra basics.", category: "data-science", icon: "Grid3X3", status: "SKELETON", conceptId: "topic:numpy", sections: [["Arrays", ["Introduction", "Arrays", "Dtypes", "Shape", "Indexing", "Slicing", "Broadcasting"]], ["Computation", ["Universal Functions", "Aggregation", "Random", "Linear Algebra Basics"]]] }),
  subject({ id: "pandas", navigationOrder: 11, title: "Pandas", description: "Labeled tabular data, selection, cleaning, grouping, reshaping, joins, time series, and IO.", category: "data-science", icon: "Table2", status: "SKELETON", conceptId: "topic:pandas", sections: [["Core structures", ["Introduction", "Series", "DataFrame", "Indexing", "Filtering", "Missing Data"]], ["Transform", ["GroupBy", "Merge", "Join", "Pivot", "Time Series", "IO", "Cleaning"]]] }),
  subject({ id: "machine-learning", navigationOrder: 12, title: "Machine Learning", description: "Mathematical foundations, supervised and unsupervised learning, evaluation, model selection, and production-minded workflows.", category: "ai-machine-learning", icon: "BrainCircuit", status: "SKELETON", conceptId: "topic:ml-fundamentals", sections: [["Foundations", ["Introduction", "Train Validation Test", "Bias and Variance", "Feature Engineering", "Metrics"]], ["Algorithms", ["Linear Regression", "Logistic Regression", "KNN", "Naive Bayes", "Decision Trees", "Random Forest", "Gradient Boosting", "SVM", "K-Means", "PCA"]], ["scikit-learn", ["Datasets", "Preprocessing", "Pipelines", "Models", "Metrics API", "Model Selection"]], ["Generative AI", ["Attention", "Transformers", "LLMs", "Embeddings", "RAG", "Agents", "Evaluation"]]] }),
  subject({ id: "pytorch", navigationOrder: 13, title: "PyTorch", description: "Tensor computation, autograd, datasets, modules, training loops, accelerators, and model persistence.", category: "ai-machine-learning", icon: "Flame", status: "SKELETON", conceptId: "topic:neural-networks", sections: [["Foundations", ["Tensors", "Autograd", "Datasets", "DataLoader", "nn.Module"]], ["Training", ["Training Loops", "GPU", "Saving Models", "Evaluation"]]] }),
];

export const learnSubjectsForNavigation = [...learnSubjects].sort((left, right) => left.navigationOrder - right.navigationOrder || left.title.en.localeCompare(right.title.en));

export const learnSubjectBySlug = new Map(learnSubjects.map((item) => [item.slug, item]));
export const learnSubjectById = new Map(learnSubjects.map((item) => [item.id, item]));
export const learnLessons = learnSubjects.flatMap((item) => item.sections.flatMap((section) => section.lessons));
export const learnLessonById = new Map(learnLessons.map((item) => [item.id, item]));
export const learnLessonByRoute = new Map(learnLessons.map((item) => [`${item.subjectId}/${item.slug}`, item]));

const migratedLegacyDestinations: Record<string, string> = {
  arrays: "/learn/dsa/arrays",
  strings: "/learn/dsa/strings",
  "linked-lists": "/learn/dsa/linked-list",
  "stacks-queues": "/learn/dsa/stack",
  "hash-tables": "/learn/dsa/hash-table",
  trees: "/learn/dsa/tree-basics",
  heaps: "/learn/dsa/heap",
  graphs: "/learn/dsa/graph-representation",
  recursion: "/learn/dsa/recursion",
  sorting: "/learn/dsa/bubble-sort",
  searching: "/learn/dsa/binary-search",
  "graph-traversal": "/learn/dsa/graph-traversal",
  "shortest-paths": "/learn/dsa/bfs-shortest-path",
  "greedy-algorithms": "/learn/dsa/greedy-strategy",
  "dynamic-programming": "/learn/dsa/dp-fundamentals",
  "ml-fundamentals": "/learn/machine-learning/introduction",
};

export const learnRouteAliases: LearnRouteAlias[] = legacyLessons.flatMap((lesson) => {
  const destination = migratedLegacyDestinations[lesson.slug];
  const [, , subjectId, lessonSlug] = destination?.split("/") ?? [];
  return destination && subjectId && lessonSlug ? [{ legacyPath: `/learn/${lesson.slug}`, destination, lessonId: `learn:${subjectId}:${lessonSlug}` }] : [];
});

export const learnRouteAliasByPath = new Map(learnRouteAliases.map((item) => [item.legacyPath, item]));
export const legacyLearnLessonBySlug = new Map(legacyLessons.map((item) => [item.slug, item]));
