import { deepTopicProfiles } from "@/content/deep-topic-content";
import type { ContentBlock, Difficulty, Topic } from "@/lib/types";

type TopicSeed = [
  slug: string,
  title: string,
  domainId: string,
  summary: string,
  difficulty?: Difficulty,
  prerequisites?: string[],
  related?: string[],
  detail?: string,
];

function foundationalContent(title: string, summary: string, detail?: string): ContentBlock[] {
  return [
    {
      type: "paragraph",
      id: "overview",
      title: "Overview",
      body: summary,
    },
    {
      type: "intuition",
      id: "core-idea",
      title: "Core idea",
      body:
        detail ??
        `${title} is best learned by connecting its formal model to a concrete implementation. Identify the inputs, the transformation being performed, and the observable output before optimizing details.`,
    },
    {
      type: "callout",
      id: "mistakes",
      title: "Coverage status",
      tone: "insight",
      body: "This topic currently provides foundation-level coverage. Follow its prerequisites and related links for context while the reference-quality chapter is developed.",
    },
  ];
}

const seeds: TopicSeed[] = [
  ["python", "Python", "programming", "Use Python as a precise, expressive tool for programs, scripts, data work, and algorithm prototypes.", "Foundational", [], ["programming-fundamentals", "debugging"], "Python emphasizes readable structure, a rich standard library, and a dynamic object model. Learn the data model—not just syntax—to reason about mutation, identity, iteration, and exceptions."],
  ["programming-fundamentals", "Programming Fundamentals", "programming", "Variables, control flow, functions, data types, and decomposition form the working vocabulary of programming."],
  ["object-oriented-programming", "Object-Oriented Programming", "programming", "Model state and behavior through objects, composition, interfaces, and carefully chosen abstractions.", "Intermediate", ["programming-fundamentals"]],
  ["modules", "Modules & Packages", "programming", "Organize code into cohesive, reusable boundaries with explicit public interfaces.", "Foundational", ["python"]],
  ["debugging", "Debugging", "programming", "Reduce uncertainty systematically with reproduction, instrumentation, hypotheses, and focused tests.", "Foundational", ["programming-fundamentals"]],
  ["git-basics", "Git Basics", "programming", "Track meaningful changes, work safely with branches, and understand the commit graph."],

  ["complexity-analysis", "Complexity Analysis", "data-structures-algorithms", "Describe how time and space grow as input size increases using asymptotic bounds.", "Foundational", ["programming-fundamentals"], ["arrays", "sorting"], "Big-O gives an upper growth bound, while Ω and Θ express lower and tight bounds. Analyze dominant operations and distinguish worst, average, and amortized cost."],
  ["arrays", "Arrays", "data-structures-algorithms", "Store indexed elements contiguously for constant-time access and cache-friendly traversal.", "Foundational", ["complexity-analysis"], ["strings", "two-pointers"]],
  ["strings", "Strings", "data-structures-algorithms", "Treat text as sequences with encoding, immutability, and pattern-processing constraints.", "Foundational", ["arrays"]],
  ["linked-lists", "Linked Lists", "data-structures-algorithms", "Represent ordered data as nodes connected by references, trading access speed for local updates.", "Foundational", ["complexity-analysis"]],
  ["stacks-queues", "Stacks & Queues", "data-structures-algorithms", "Use LIFO and FIFO access disciplines to model traversal, parsing, scheduling, and history.", "Foundational", ["arrays"], ["graph-traversal"]],
  ["hash-tables", "Hash Tables", "data-structures-algorithms", "Map keys to buckets for expected constant-time lookup while managing collisions and capacity.", "Intermediate", ["arrays", "complexity-analysis"]],
  ["trees", "Trees", "data-structures-algorithms", "Model hierarchical relationships with recursive node structures and well-defined traversal orders.", "Intermediate", ["linked-lists", "recursion"]],
  ["heaps", "Heaps", "data-structures-algorithms", "Maintain quick access to an extreme element with a partially ordered complete binary tree.", "Intermediate", ["trees", "arrays"]],
  ["graphs", "Graphs", "data-structures-algorithms", "Represent entities and relationships with vertices, edges, and adjacency structures.", "Intermediate", ["hash-tables", "stacks-queues"], ["graph-traversal", "shortest-paths"]],
  ["recursion", "Recursion", "data-structures-algorithms", "Solve a problem through smaller instances with an explicit base case and shrinking state.", "Intermediate", ["programming-fundamentals"]],
  ["sorting", "Sorting", "data-structures-algorithms", "Reorder data under a comparator while reasoning about stability, memory, and lower bounds.", "Intermediate", ["arrays", "complexity-analysis"]],
  ["searching", "Searching", "data-structures-algorithms", "Locate information by exploiting structure, ordering, or a traversable state space.", "Intermediate", ["arrays", "complexity-analysis"]],
  ["graph-traversal", "Graph Traversal", "data-structures-algorithms", "Systematically visit graph states with breadth-first or depth-first search.", "Intermediate", ["graphs"]],
  ["shortest-paths", "Shortest Paths", "data-structures-algorithms", "Find minimum-cost routes using edge-weight assumptions to select the correct algorithm.", "Advanced", ["graphs", "heaps"]],
  ["greedy-algorithms", "Greedy Algorithms", "data-structures-algorithms", "Build a solution through locally optimal choices backed by a proof of global correctness.", "Advanced", ["sorting", "complexity-analysis"]],
  ["dynamic-programming", "Dynamic Programming", "data-structures-algorithms", "Reuse overlapping subproblem results after defining state, transitions, and base cases.", "Advanced", ["recursion", "complexity-analysis"]],

  ["linear-algebra", "Linear Algebra", "mathematics-ai", "Use vectors, matrices, and linear transformations to represent data and models.", "Foundational", [], ["vectors-matrices", "eigenvalues"], "Linear algebra provides the computational language of machine learning. A matrix can be understood simultaneously as a data table, a system of equations, or a transformation of space."],
  ["vectors-matrices", "Vectors & Matrices", "mathematics-ai", "Work with shapes, products, norms, projections, and transformations.", "Foundational", ["linear-algebra"]],
  ["eigenvalues", "Eigenvalues & Eigenvectors", "mathematics-ai", "Identify directions preserved by a linear transformation and their scale factors.", "Advanced", ["vectors-matrices"]],
  ["calculus", "Calculus", "mathematics-ai", "Describe change, accumulation, and local linear behavior with derivatives and integrals.", "Foundational"],
  ["multivariable-calculus", "Multivariable Calculus", "mathematics-ai", "Use partial derivatives, gradients, and Jacobians for functions of many variables.", "Intermediate", ["calculus", "vectors-matrices"]],
  ["probability", "Probability", "mathematics-ai", "Model uncertainty with random variables, distributions, conditioning, and expectation.", "Foundational"],
  ["statistics", "Statistics", "mathematics-ai", "Estimate, test, and quantify uncertainty from finite samples.", "Intermediate", ["probability"]],
  ["optimization", "Optimization", "mathematics-ai", "Choose parameters that minimize or maximize an objective under constraints.", "Intermediate", ["multivariable-calculus", "linear-algebra"]],
  ["gradient-descent", "Gradient Descent", "mathematics-ai", "Iteratively move parameters opposite the objective gradient to reduce loss.", "Intermediate", ["optimization"], ["linear-regression", "neural-networks"], "For parameters θ and learning rate η, the update θ ← θ − η∇J(θ) follows the steepest local descent direction. Scale, curvature, and step size determine convergence behavior."],

  ["numpy", "NumPy", "data-science", "Compute efficiently with typed multidimensional arrays, broadcasting, and vectorized operations.", "Foundational", ["python"]],
  ["pandas", "Pandas", "data-science", "Transform labeled tabular data with explicit indexing, joins, grouping, and missing-value semantics.", "Foundational", ["python", "numpy"]],
  ["data-cleaning", "Data Cleaning", "data-science", "Detect and resolve missing, duplicated, inconsistent, and invalid observations.", "Intermediate", ["pandas"]],
  ["data-visualization", "Data Visualization", "data-science", "Encode data visually to reveal structure without distorting comparisons.", "Intermediate", ["pandas", "statistics"]],
  ["exploratory-data-analysis", "Exploratory Data Analysis", "data-science", "Interrogate a dataset through distributions, relationships, anomalies, and hypotheses.", "Intermediate", ["data-cleaning", "data-visualization"]],
  ["feature-processing", "Feature Processing", "data-science", "Convert raw observations into model-ready, leakage-safe numerical representations.", "Intermediate", ["pandas", "statistics"]],

  ["ml-fundamentals", "Machine Learning Fundamentals", "machine-learning", "Frame learning as choosing a model from data under an objective and an evaluation protocol.", "Foundational", ["statistics", "python"], ["model-evaluation", "linear-regression"], "Separate the data-generating process, hypothesis class, objective, optimizer, and evaluation procedure. Generalization—not training fit—is the central concern."],
  ["supervised-learning", "Supervised Learning", "machine-learning", "Learn a mapping from labeled examples for regression or classification.", "Foundational", ["ml-fundamentals"]],
  ["linear-regression", "Linear Regression", "machine-learning", "Fit a linear conditional mean by minimizing squared residuals.", "Intermediate", ["supervised-learning", "gradient-descent"], ["regression-losses"], "A linear model predicts ŷ = Xw + b. Least squares has a closed-form solution under suitable conditions, while gradient methods scale to large or regularized problems."],
  ["logistic-regression", "Logistic Regression", "machine-learning", "Model class probability through a linear score passed through the logistic function.", "Intermediate", ["supervised-learning", "probability"]],
  ["decision-trees", "Decision Trees", "machine-learning", "Partition feature space with interpretable rules chosen to reduce impurity.", "Intermediate", ["supervised-learning"]],
  ["support-vector-machines", "Support Vector Machines", "machine-learning", "Find a maximum-margin decision boundary, optionally in an implicit feature space.", "Advanced", ["linear-algebra", "optimization"]],
  ["clustering", "Clustering", "machine-learning", "Group unlabeled observations by a chosen notion of similarity and cluster structure.", "Intermediate", ["ml-fundamentals", "vectors-matrices"]],
  ["principal-component-analysis", "Principal Component Analysis", "machine-learning", "Project centered data onto orthogonal directions of maximum variance.", "Advanced", ["eigenvalues", "statistics"]],
  ["model-evaluation", "Model Evaluation", "machine-learning", "Estimate generalization with leakage-safe splits, suitable metrics, and uncertainty.", "Intermediate", ["ml-fundamentals", "statistics"], ["cross-validation"], "The evaluation metric must reflect the decision cost. Keep training, model selection, and final estimation logically separate; pipelines prevent preprocessing leakage."],
  ["ensemble-learning", "Ensemble Learning", "machine-learning", "Combine diverse predictors to reduce variance, bias, or both.", "Advanced", ["decision-trees", "model-evaluation"]],
  ["regression-losses", "Regression Losses", "machine-learning", "Choose an objective whose geometry and robustness match the error you care about.", "Intermediate", ["linear-regression"]],

  ["neural-networks", "Neural Networks", "deep-learning", "Compose parameterized transformations and learn representations end to end.", "Intermediate", ["ml-fundamentals", "linear-algebra"]],
  ["backpropagation", "Backpropagation", "deep-learning", "Apply the chain rule efficiently through a computational graph.", "Advanced", ["neural-networks", "multivariable-calculus"]],
  ["activation-functions", "Activation Functions", "deep-learning", "Introduce nonlinear transformations that shape signal and gradient flow.", "Intermediate", ["neural-networks"]],
  ["deep-optimization", "Deep Learning Optimization", "deep-learning", "Train deep models with adaptive updates, schedules, normalization, and regularization.", "Advanced", ["backpropagation", "optimization"]],
  ["convolutional-networks", "Convolutional Networks", "deep-learning", "Learn local, translation-aware spatial features with shared filters.", "Advanced", ["neural-networks"]],
  ["recurrent-networks", "Recurrent Networks", "deep-learning", "Process sequences through a state updated across time.", "Advanced", ["neural-networks"]],
  ["transformers", "Transformers", "deep-learning", "Model dependencies with attention, residual streams, and position-aware representations.", "Advanced", ["neural-networks", "linear-algebra"]],

  ["image-representation", "Image Representation", "computer-vision", "Represent images as sampled color signals and reason about geometry, channels, and resolution.", "Foundational", ["numpy"]],
  ["opencv-basics", "OpenCV Basics", "computer-vision", "Load, transform, filter, and measure images with classical vision operations.", "Foundational", ["image-representation"]],
  ["image-classification", "Image Classification", "computer-vision", "Assign semantic labels to images using learned visual representations.", "Intermediate", ["convolutional-networks"]],
  ["object-detection", "Object Detection", "computer-vision", "Locate and classify multiple objects with box regression and confidence scoring.", "Advanced", ["image-classification"]],
  ["image-segmentation", "Image Segmentation", "computer-vision", "Predict semantic or instance labels at pixel resolution.", "Advanced", ["convolutional-networks"]],

  ["text-preprocessing", "Text Preprocessing", "nlp", "Convert raw language into normalized units while preserving task-relevant information.", "Foundational", ["python"]],
  ["word-embeddings", "Word Embeddings", "nlp", "Represent linguistic items as dense vectors learned from context.", "Intermediate", ["linear-algebra", "text-preprocessing"]],
  ["sequence-models", "Sequence Models", "nlp", "Model ordered language with recurrent or convolutional state.", "Intermediate", ["word-embeddings"]],
  ["attention", "Attention", "nlp", "Build context-sensitive representations by weighting interactions among tokens.", "Advanced", ["sequence-models", "linear-algebra"]],
  ["nlp-transformers", "Transformers for Language", "nlp", "Apply self-attention architectures to representation learning and generation.", "Advanced", ["attention", "transformers"]],

  ["llm-transformers", "LLM Transformer Architecture", "llm-engineering", "Understand tokenization, attention, residual streams, and autoregressive decoding.", "Advanced", ["transformers"]],
  ["semantic-embeddings", "Semantic Embeddings", "llm-engineering", "Encode meaning into vectors for retrieval, clustering, and semantic comparison.", "Intermediate", ["word-embeddings"]],
  ["vector-search", "Vector Search", "llm-engineering", "Retrieve nearby embeddings efficiently with approximate nearest-neighbor indexes.", "Intermediate", ["semantic-embeddings"]],
  ["rag", "Retrieval-Augmented Generation", "llm-engineering", "Ground generation in retrieved evidence with explicit indexing, retrieval, and synthesis stages.", "Advanced", ["vector-search", "llm-transformers"]],
  ["prompting", "Prompt Engineering", "llm-engineering", "Design instructions, context, examples, and output constraints as a testable interface.", "Foundational", ["llm-transformers"]],
  ["ai-agents", "AI Agents", "llm-engineering", "Build bounded control loops that choose tools, observe results, and manage state.", "Advanced", ["prompting", "rag"]],
  ["llm-evaluation", "LLM Evaluation", "llm-engineering", "Measure task quality, grounding, safety, and operational performance with reproducible cases.", "Advanced", ["rag", "model-evaluation"]],
  ["llm-fine-tuning", "LLM Fine-tuning", "llm-engineering", "Adapt model behavior with curated examples and parameter-efficient updates.", "Advanced", ["llm-transformers", "deep-optimization"]],

  ["ai-apis", "AI APIs", "ai-engineering", "Integrate model capabilities behind typed, resilient application boundaries.", "Foundational", ["python"]],
  ["model-inference", "Model Inference", "ai-engineering", "Turn trained parameters into latency- and cost-aware predictions.", "Intermediate", ["ai-apis", "ml-fundamentals"]],
  ["model-serving", "Model Serving", "ai-engineering", "Expose models through scalable, observable request pipelines.", "Advanced", ["model-inference"]],
  ["vector-databases", "Vector Databases", "ai-engineering", "Store, filter, and search embeddings with production retrieval constraints.", "Intermediate", ["vector-search"]],
  ["ai-observability", "AI Observability", "ai-engineering", "Trace quality, latency, cost, and failure modes across AI workflows.", "Advanced", ["model-serving", "llm-evaluation"]],
  ["ai-deployment", "AI Deployment", "ai-engineering", "Ship models and AI workflows with safe rollout, monitoring, and rollback strategies.", "Advanced", ["model-serving", "ai-observability"]],
];

export const topics: Topic[] = seeds.map(
  ([slug, title, domainId, summary, difficulty = "Foundational", prerequisiteIds = [], relatedTopicIds = [], detail]) => {
    const deep = deepTopicProfiles[slug];
    const objectiveDescriptions = deep?.objectives ?? [
      `Explain the purpose and central vocabulary of ${title.toLowerCase()}.`,
      `Connect ${title.toLowerCase()} to its prerequisites and adjacent topics.`,
      `Recognize one practical situation where ${title.toLowerCase()} applies.`,
    ];
    return {
    id: slug,
    slug,
    title,
    domainId,
    summary,
    difficulty,
    estimatedMinutes: deep?.estimatedMinutes ?? (difficulty === "Advanced" ? 75 : difficulty === "Intermediate" ? 55 : 35),
    prerequisiteIds,
    relatedTopicIds,
    objectives: objectiveDescriptions.map((description, index) => ({ id: `${slug}-objective-${index + 1}`, description })),
    glossary: deep?.glossary ?? [],
    content: deep?.content ?? foundationalContent(title, summary, detail),
    revision: {
      version: deep ? 2 : 1,
      reviewedAt: "2026-09-26",
      contentLevel: deep ? "Reference-quality" : "Foundation",
      sourceIds: deep?.sourceIds ?? [],
    },
  };
  },
);
