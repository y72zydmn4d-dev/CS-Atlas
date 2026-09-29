import type { Technique } from "@/lib/types";

const algorithmTechniques: Array<[string, string, string, string[], string[], string[]]> = [
  ["two-pointers", "Two Pointers", "Coordinate indices to eliminate candidates or maintain a structured interval.", ["Input is sorted or can be sorted", "Pairs or intervals must be inspected", "In-place updates are useful"], ["Define what each pointer represents", "Write the invariant", "Move only the pointer justified by the invariant"], ["two-pointers"]],
  ["sliding-window", "Sliding Window", "Maintain a contiguous range and update its state incrementally.", ["The answer concerns contiguous items", "Window validity changes monotonically", "Adjacent candidates overlap"], ["Expand the right boundary", "Restore validity from the left", "Record the answer at a consistent phase"], ["sliding-window"]],
  ["prefix-sum", "Prefix Sum", "Trade preprocessing and memory for fast range aggregates.", ["Many immutable range queries", "Subarray sums or counts", "Cumulative balance conditions"], ["Add a leading identity value", "Build cumulative state", "Express each range as a difference"], ["prefix-sum"]],
  ["binary-search-on-answer", "Binary Search on Answer", "Search a monotonic feasibility boundary rather than a stored value.", ["Candidate answers are ordered", "A yes/no feasibility test is monotonic", "Direct construction is expensive"], ["Define the search interval", "Prove the feasibility predicate is monotonic", "Choose first-true or last-true boundaries"], ["binary-search"]],
  ["divide-and-conquer", "Divide and Conquer", "Split independent subproblems, solve them recursively, and combine results.", ["Problems divide into similar parts", "Combining is cheaper than solving directly", "Parallel structure exists"], ["Choose a base case", "Split with guaranteed progress", "Account for combine cost"], ["merge-sort", "quick-sort"]],
  ["greedy", "Greedy", "Commit to locally optimal choices only when an exchange or stay-ahead proof supports them.", ["Choices can be safely finalized", "An ordering exposes a dominant option", "Optimal substructure is present"], ["State the greedy choice", "Prove it can replace an optimal choice", "Implement the required ordering"], ["dijkstra"]],
  ["backtracking", "Backtracking", "Explore a decision tree while pruning partial assignments that cannot succeed.", ["Need all or one valid configuration", "Constraints reject partial states", "Search space is combinatorial"], ["Choose a decision", "Apply and recurse", "Undo exactly the applied state"], ["dfs"]],
  ["memoization", "Memoization", "Cache top-down recursive states so each distinct subproblem is solved once.", ["Subproblems overlap", "Recursive recurrence is natural", "Only a fraction of states may be visited"], ["Define a complete cache key", "Check cache before recursion", "Cache terminal results too"], ["knapsack-01"]],
  ["tabulation", "Tabulation", "Fill dynamic-programming states in dependency order from base cases upward.", ["State space is bounded", "Dependency order is known", "Memory layout matters"], ["Define dimensions", "Initialize base states", "Iterate in dependency-safe order"], ["knapsack-01"]],
  ["bit-manipulation", "Bit Manipulation", "Use binary representation and bitwise operations for compact state and low-level transformations.", ["State is a small subset", "Parity or powers of two matter", "Compact masks simplify transitions"], ["Write the bit meaning", "Use masks with explicit precedence", "Test zero and sign behavior"], []],
];

const mlTechniques: Array<[string, string, string]> = [
  ["normalization", "Normalization", "Rescale values to a bounded range when magnitude comparability or bounded inputs matter."],
  ["standardization", "Standardization", "Center and scale features using training-set statistics."],
  ["feature-engineering", "Feature Engineering", "Encode domain knowledge into informative, model-usable representations."],
  ["cross-validation", "Cross Validation", "Repeat train/validation splits to estimate selection performance more robustly."],
  ["regularization", "Regularization", "Constrain effective model complexity to improve generalization."],
  ["hyperparameter-tuning", "Hyperparameter Tuning", "Search configuration choices under a fixed, leakage-safe evaluation protocol."],
  ["data-augmentation", "Data Augmentation", "Create label-preserving variations that encode desired invariances."],
  ["transfer-learning", "Transfer Learning", "Reuse representations learned on a related, often larger dataset."],
  ["fine-tuning", "Fine-tuning", "Adapt pretrained parameters with a smaller task-specific learning signal."],
  ["ensembling", "Ensembling", "Combine diverse models to reduce correlated error."],
];

export const techniques: Technique[] = [
  ...algorithmTechniques.map(([id, name, summary, whenToUse, steps, algorithmIds]) => ({
    id, slug: id, name, family: "Algorithms" as const, summary, whenToUse, steps,
    topicIds: [id === "greedy" ? "greedy-algorithms" : id === "memoization" || id === "tabulation" ? "dynamic-programming" : "arrays"],
    algorithmIds,
  })),
  ...mlTechniques.map(([id, name, summary]) => ({
    id, slug: id, name, family: "Machine Learning" as const, summary,
    whenToUse: ["The technique matches a measured model or data failure", "It can be evaluated without contaminating the test set"],
    steps: ["Establish a reproducible baseline", `Apply ${name.toLowerCase()} inside the training pipeline`, "Compare on the same validation protocol"],
    topicIds: [id === "cross-validation" ? "model-evaluation" : id === "transfer-learning" || id === "fine-tuning" ? "neural-networks" : "ml-fundamentals"],
    algorithmIds: [],
  })),
];
