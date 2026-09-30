# Learn route migration map

## Route ownership

| Route | New owner | Compatibility behavior |
|---|---|---|
| `/learn` | Knowledge and tutorial catalog | Replaces the flat lesson list; Guided Learning remains linked as a distinct mode. |
| `/learn/:subject` | Subject home | A known subject opens its complete learning surface. An unknown subject segment falls back to the legacy lesson resolver. |
| `/learn/:subject/tutorial` | Curriculum overview | Derived from the subject manifest. |
| `/learn/:subject/:lesson` | Tutorial workspace | Derived from the subject and lesson manifests. |
| `/learn/:subject/exercises` | Exercise hub | Links canonical shared Exercise records. |
| `/learn/:subject/examples` | Example index | Uses reusable authored Learn examples. |
| `/learn/:subject/quiz` | Quiz hub | Records shared local learning evidence. |
| `/learn/:subject/reference` | Dense reference index | Separate from tutorial prose. |
| `/learn/:subject/reference/:reference` | Reference detail | Uses structured reference records and canonical relations. |

## Deterministic migrated aliases

| Legacy path | Destination |
|---|---|
| `/learn/arrays` | `/learn/dsa/arrays` |
| `/learn/strings` | `/learn/dsa/strings` |
| `/learn/linked-lists` | `/learn/dsa/linked-list` |
| `/learn/stacks-queues` | `/learn/dsa/stack` |
| `/learn/hash-tables` | `/learn/dsa/hash-table` |
| `/learn/trees` | `/learn/dsa/tree-basics` |
| `/learn/heaps` | `/learn/dsa/heap` |
| `/learn/graphs` | `/learn/dsa/graph-representation` |
| `/learn/recursion` | `/learn/dsa/recursion` |
| `/learn/sorting` | `/learn/dsa/bubble-sort` |
| `/learn/searching` | `/learn/dsa/binary-search` |
| `/learn/graph-traversal` | `/learn/dsa/graph-traversal` |
| `/learn/shortest-paths` | `/learn/dsa/bfs-shortest-path` |
| `/learn/greedy-algorithms` | `/learn/dsa/greedy-strategy` |
| `/learn/dynamic-programming` | `/learn/dsa/dp-fundamentals` |
| `/learn/ml-fundamentals` | `/learn/machine-learning/introduction` |

All other existing lesson slugs continue through the legacy fallback and render the original topic experience. The former `/learn/python`, `/learn/numpy`, and `/learn/pandas` topic bookmarks now resolve to the corresponding subject homes rather than a dead route; those homes retain canonical Concept links and curriculum entry points.

IDs stored in existing topic progress and bookmark records are not rewritten or discarded. New lessons use `learn:*` evidence targets and the same versioned browser repository.
