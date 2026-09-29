import type { Algorithm } from "@/lib/types";

export const algorithms: Algorithm[] = [
  {
    id: "binary-search", slug: "binary-search", name: "Binary Search", category: "Searching",
    summary: "Halve an ordered search space by comparing its midpoint with the target.",
    intuition: "Sorted order lets one comparison rule out an entire half. The key invariant is that if the target exists, it remains inside the active interval.",
    prerequisiteIds: ["arrays", "complexity-analysis"],
    pseudocode: `lo = 0, hi = length - 1\nwhile lo <= hi:\n  mid = lo + (hi - lo) // 2\n  if a[mid] == target: return mid\n  if a[mid] < target: lo = mid + 1\n  else: hi = mid - 1\nreturn -1`,
    python: `def binary_search(values, target):\n    lo, hi = 0, len(values) - 1\n    while lo <= hi:\n        mid = lo + (hi - lo) // 2\n        if values[mid] == target:\n            return mid\n        if values[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1`,
    timeComplexity: "O(log n)", spaceComplexity: "O(1)",
    mistakes: ["Applying it to unsorted data", "Mixing inclusive and exclusive boundaries", "Failing to move past mid"],
    useCases: ["Lookup in sorted arrays", "Boundary finding", "Monotonic feasibility search"], relatedIds: ["two-pointers"], techniqueIds: ["binary-search-on-answer"], visualizer: "binary-search",
  },
  {
    id: "bfs", slug: "breadth-first-search", name: "Breadth-First Search", category: "Graph Algorithms",
    summary: "Explore an unweighted graph layer by layer with a queue.",
    intuition: "The queue processes nodes in nondecreasing distance from the source, so the first discovery of a node gives a shortest unweighted path.",
    prerequisiteIds: ["graphs", "stacks-queues"],
    pseudocode: `enqueue(source); mark source\nwhile queue not empty:\n  node = dequeue()\n  for neighbor in graph[node]:\n    if neighbor unvisited:\n      mark neighbor\n      enqueue(neighbor)`,
    python: `from collections import deque\n\ndef bfs(graph, source):\n    queue = deque([source])\n    seen = {source}\n    order = []\n    while queue:\n        node = queue.popleft()\n        order.append(node)\n        for neighbor in graph[node]:\n            if neighbor not in seen:\n                seen.add(neighbor)\n                queue.append(neighbor)\n    return order`,
    timeComplexity: "O(V + E)", spaceComplexity: "O(V)", mistakes: ["Marking nodes only when dequeued", "Forgetting disconnected components", "Using a stack by accident"],
    useCases: ["Shortest paths in unweighted graphs", "Level-order traversal", "State-space search"], relatedIds: ["dfs", "dijkstra"], techniqueIds: [], visualizer: "bfs",
  },
  {
    id: "dfs", slug: "depth-first-search", name: "Depth-First Search", category: "Graph Algorithms",
    summary: "Follow each branch deeply before backtracking, using recursion or an explicit stack.", intuition: "DFS turns graph exploration into nested decisions and exposes entry/exit structure useful for cycles, ordering, and components.",
    prerequisiteIds: ["graphs", "recursion"], pseudocode: `visit(node):\n  mark node\n  for neighbor in graph[node]:\n    if neighbor unvisited: visit(neighbor)`,
    python: `def dfs(graph, node, seen=None):\n    seen = seen or set()\n    seen.add(node)\n    for neighbor in graph[node]:\n        if neighbor not in seen:\n            dfs(graph, neighbor, seen)\n    return seen`,
    timeComplexity: "O(V + E)", spaceComplexity: "O(V)", mistakes: ["Missing a visited set", "Recursion depth overflow", "Assuming traversal order is unique"], useCases: ["Cycle detection", "Topological ordering", "Connected components"], relatedIds: ["bfs"], techniqueIds: ["backtracking"],
  },
  {
    id: "dijkstra", slug: "dijkstra", name: "Dijkstra’s Algorithm", category: "Graph Algorithms",
    summary: "Find single-source shortest paths in graphs with non-negative edge weights.", intuition: "A priority queue always settles the cheapest reachable frontier. Non-negative edges ensure a settled distance cannot later improve.",
    prerequisiteIds: ["graphs", "heaps"], pseudocode: `distance[source] = 0\nwhile heap not empty:\n  d, u = pop minimum\n  if d is stale: continue\n  for (v, weight) from u:\n    relax distance[v]`,
    python: `import heapq\n\ndef dijkstra(graph, source):\n    dist = {source: 0}\n    heap = [(0, source)]\n    while heap:\n        d, u = heapq.heappop(heap)\n        if d != dist[u]: continue\n        for v, w in graph[u]:\n            nd = d + w\n            if nd < dist.get(v, float("inf")):\n                dist[v] = nd\n                heapq.heappush(heap, (nd, v))\n    return dist`,
    timeComplexity: "O((V + E) log V)", spaceComplexity: "O(V + E)", mistakes: ["Using negative edges", "Not skipping stale heap entries", "Confusing discovered with settled"], useCases: ["Routing", "Network latency", "Weighted pathfinding"], relatedIds: ["bfs"], techniqueIds: ["greedy"],
  },
  {
    id: "merge-sort", slug: "merge-sort", name: "Merge Sort", category: "Sorting", summary: "Recursively sort halves, then merge them in linear time.",
    intuition: "Splitting makes subproblems trivial; merging preserves order by repeatedly choosing the smaller front element.", prerequisiteIds: ["arrays", "recursion"],
    pseudocode: `sort(a):\n  if length <= 1: return a\n  left = sort(first half)\n  right = sort(second half)\n  return merge(left, right)`,
    python: `def merge_sort(a):\n    if len(a) <= 1: return a\n    mid = len(a) // 2\n    left = merge_sort(a[:mid])\n    right = merge_sort(a[mid:])\n    out = []\n    while left and right:\n        out.append((left if left[0] <= right[0] else right).pop(0))\n    return out + left + right`,
    timeComplexity: "O(n log n)", spaceComplexity: "O(n)", mistakes: ["Dropping leftovers during merge", "Excessive copying", "Using an unstable comparison"], useCases: ["Stable sorting", "Linked-list sorting", "External sorting"], relatedIds: ["quick-sort"], techniqueIds: ["divide-and-conquer"], visualizer: "merge-sort",
  },
  {
    id: "quick-sort", slug: "quick-sort", name: "Quick Sort", category: "Sorting", summary: "Partition around a pivot, then recursively sort the partitions.", intuition: "After partitioning, the pivot is in final position and each side can be solved independently.", prerequisiteIds: ["arrays", "recursion"], pseudocode: `choose pivot\npartition values around pivot\nquicksort(left partition)\nquicksort(right partition)`, python: `def quicksort(a):\n    if len(a) <= 1: return a\n    pivot = a[len(a)//2]\n    return quicksort([x for x in a if x < pivot]) + [x for x in a if x == pivot] + quicksort([x for x in a if x > pivot])`, timeComplexity: "Average O(n log n), worst O(n²)", spaceComplexity: "Average O(log n)", mistakes: ["Poor pivot selection", "Incorrect duplicate handling", "Unbounded recursion"], useCases: ["Fast in-memory sorting", "Partition-based selection"], relatedIds: ["merge-sort"], techniqueIds: ["divide-and-conquer"],
  },
  {
    id: "sliding-window", slug: "sliding-window", name: "Sliding Window", category: "Arrays & Strings", summary: "Maintain an incrementally updated contiguous range instead of recomputing every range.", intuition: "When adjacent candidate ranges overlap heavily, carry forward the shared state and update only entering or leaving elements.", prerequisiteIds: ["arrays"], pseudocode: `left = 0\nfor right in range(n):\n  add a[right]\n  while window invalid:\n    remove a[left]; left += 1\n  update answer`, python: `def longest_unique(s):\n    seen, left, best = {}, 0, 0\n    for right, ch in enumerate(s):\n        if ch in seen and seen[ch] >= left:\n            left = seen[ch] + 1\n        seen[ch] = right\n        best = max(best, right - left + 1)\n    return best`, timeComplexity: "Usually O(n)", spaceComplexity: "O(k)", mistakes: ["Using it when validity is not monotonic", "Updating the answer at the wrong time", "Not removing outgoing state"], useCases: ["Subarray constraints", "Streaming aggregates", "Substring problems"], relatedIds: ["two-pointers", "prefix-sum"], techniqueIds: ["sliding-window"],
  },
  {
    id: "two-pointers", slug: "two-pointers", name: "Two Pointers", category: "Arrays & Strings", summary: "Coordinate two indices to exploit ordering or maintain a meaningful interval.", intuition: "Move the pointer whose change can eliminate impossible candidates while preserving completeness.", prerequisiteIds: ["arrays"], pseudocode: `left = 0; right = n - 1\nwhile left < right:\n  inspect a[left], a[right]\n  move one pointer based on invariant`, python: `def pair_sum_sorted(a, target):\n    left, right = 0, len(a) - 1\n    while left < right:\n        total = a[left] + a[right]\n        if total == target: return left, right\n        if total < target: left += 1\n        else: right -= 1`, timeComplexity: "O(n)", spaceComplexity: "O(1)", mistakes: ["Losing the pointer invariant", "Skipping equal values incorrectly", "Applying to unsorted input without justification"], useCases: ["Pair sums", "In-place compaction", "Interval scanning"], relatedIds: ["sliding-window", "binary-search"], techniqueIds: ["two-pointers"],
  },
  {
    id: "prefix-sum", slug: "prefix-sum", name: "Prefix Sum", category: "Arrays & Strings", summary: "Precompute cumulative aggregates so range queries become constant-time differences.", intuition: "A range total is everything before its right boundary minus everything before its left boundary.", prerequisiteIds: ["arrays"], pseudocode: `prefix[0] = 0\nfor i in 0..n-1: prefix[i+1] = prefix[i] + a[i]\nsum(left, right) = prefix[right+1] - prefix[left]`, python: `def prefix_sums(a):\n    out = [0]\n    for value in a: out.append(out[-1] + value)\n    return out`, timeComplexity: "O(n) build, O(1) query", spaceComplexity: "O(n)", mistakes: ["Off-by-one indexing", "Forgetting the leading zero", "Using it for frequently changing data"], useCases: ["Range sums", "Subarray counting", "2D integral images"], relatedIds: ["sliding-window"], techniqueIds: ["prefix-sum"],
  },
  {
    id: "knapsack-01", slug: "zero-one-knapsack", name: "0/1 Knapsack", category: "Dynamic Programming", summary: "Choose indivisible items under a capacity constraint to maximize total value.", intuition: "For each item and remaining capacity, the optimal solution either excludes the item or includes it exactly once.", prerequisiteIds: ["dynamic-programming"], pseudocode: `dp[0..capacity] = 0\nfor item in items:\n  for c from capacity down to weight[item]:\n    dp[c] = max(dp[c], value[item] + dp[c-weight[item]])`, python: `def knapsack(items, capacity):\n    dp = [0] * (capacity + 1)\n    for weight, value in items:\n        for c in range(capacity, weight - 1, -1):\n            dp[c] = max(dp[c], value + dp[c - weight])\n    return dp[capacity]`, timeComplexity: "O(nW)", spaceComplexity: "O(W)", mistakes: ["Iterating capacity forward and reusing an item", "Choosing an incomplete state", "Calling pseudo-polynomial time polynomial"], useCases: ["Budgeted selection", "Subset sum", "Resource allocation"], relatedIds: [], techniqueIds: ["tabulation", "memoization"],
  },
];
