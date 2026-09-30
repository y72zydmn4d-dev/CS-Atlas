# Route inventory

This inventory is metadata-only. It intentionally omits lesson bodies and proprietary exercise/example content.

## Record schema

`Route | Subject | PageType | Title | Section | Parent | Previous | Next | SidebarGroup | SidebarPosition | PrimaryActions | SecondaryActions | HasExample | HasTryIt | HasExercise | HasQuiz | HasReference | HasTable | HasInteractiveDemo | ResponsiveNotes`

Previous/next relationships follow the ordered sidebar unless a page exposes a different relationship. Per-route boolean fields are recorded at archetype level where a full live DOM was unavailable.

## Catalog and global routes

| Route | PageType | Title | Primary relationship |
| --- | --- | --- | --- |
| `/` | TUTORIAL_CATALOG entry | W3Schools homepage | Global tutorials/references/exercises navigation |
| `/tutorials/index.php` | TUTORIAL_CATALOG | Tutorials | Filterable multi-category subject inventory |

## Priority Tier 1: Python

Root: `/python/default.asp` (`SUBJECT_HOME`). Ordered groups and verified routes:

```text
GETTING STARTED
/python/python_intro.asp | Introduction
/python/python_getstarted.asp | Get Started
/python/python_syntax.asp | Syntax
/python/python_output.asp | Output
/python/python_comments.asp | Comments

VARIABLES AND TYPES
/python/python_variables.asp | Variables
/python/python_variables_names.asp | Variable Names
/python/python_variables_multiple.asp | Multiple Values
/python/python_variables_output.asp | Output Variables
/python/python_variables_global.asp | Global Variables
/python/python_datatypes.asp | Data Types
/python/python_numbers.asp | Numbers
/python/python_casting.asp | Casting
/python/python_booleans.asp | Booleans
/python/python_none.asp | None

STRINGS
/python/python_strings.asp | Strings
/python/python_strings_slicing.asp | Slicing
/python/python_strings_modify.asp | Modify Strings
/python/python_strings_concatenate.asp | Concatenate
/python/python_strings_format.asp | Format Strings
/python/python_strings_escape.asp | Escape Characters
/python/python_strings_methods.asp | String Methods
/python/python_string_formatting.asp | String Formatting

OPERATORS
/python/python_operators.asp | Operators
/python/python_operators_arithmetic.asp | Arithmetic
/python/python_operators_assign.asp | Assignment
/python/python_ternary_operator.asp | Ternary
/python/python_operators_comparison.asp | Comparison
/python/python_operators_logical.asp | Logical
/python/python_operators_identity.asp | Identity
/python/python_operators_membership.asp | Membership
/python/python_operators_bitwise.asp | Bitwise
/python/python_operators_precedence.asp | Precedence

LISTS
/python/python_lists.asp | Lists
/python/python_lists_access.asp | Access Items
/python/python_lists_change.asp | Change Items
/python/python_lists_add.asp | Add Items
/python/python_lists_remove.asp | Remove Items
/python/python_lists_loop.asp | Loop Lists
/python/python_lists_comprehension.asp | List Comprehension
/python/python_lists_sort.asp | Sort Lists
/python/python_lists_copy.asp | Copy Lists
/python/python_lists_join.asp | Join Lists
/python/python_lists_methods.asp | List Methods
/python/python_lists_exercises.asp | List Exercises | EXERCISE

TUPLES
/python/python_tuples.asp | Tuples
/python/python_tuples_access.asp | Access Tuples
/python/python_tuples_update.asp | Update Tuples
/python/python_tuples_unpack.asp | Unpack Tuples
/python/python_tuples_loop.asp | Loop Tuples
/python/python_tuples_join.asp | Join Tuples
/python/python_tuples_methods.asp | Tuple Methods
/python/python_tuples_exercises.asp | Tuple Exercises | EXERCISE

SETS
/python/python_sets.asp | Sets
/python/python_sets_access.asp | Access Sets
/python/python_sets_add.asp | Add Items
/python/python_sets_remove.asp | Remove Items
/python/python_sets_loop.asp | Loop Sets
/python/python_sets_join.asp | Join Sets
/python/python_frozenset.asp | Frozenset
/python/python_sets_methods.asp | Set Methods
/python/python_sets_exercises.asp | Set Exercises | EXERCISE

DICTIONARIES
/python/python_dictionaries.asp | Dictionaries
/python/python_dictionaries_access.asp | Access Items
/python/python_dictionaries_change.asp | Change Items
/python/python_dictionaries_add.asp | Add Items
/python/python_dictionaries_remove.asp | Remove Items
/python/python_dictionaries_loop.asp | Loop Dictionaries
/python/python_dictionaries_copy.asp | Copy Dictionaries
/python/python_dictionaries_nested.asp | Nested Dictionaries
/python/python_dictionaries_methods.asp | Dictionary Methods
/python/python_dictionaries_exercises.asp | Dictionary Exercises | EXERCISE

CONTROL FLOW AND FUNCTIONS
/python/python_conditions.asp | If
/python/python_if_elif.asp | Elif
/python/python_if_else.asp | Else
/python/python_if_shorthand.asp | Conditional expressions
/python/python_if_logical.asp | Logical conditions
/python/python_if_nested_if.asp | Nested conditions
/python/python_if_pass.asp | Pass
/python/python_match.asp | Match
/python/python_while_loops.asp | While
/python/python_for_loops.asp | For
/python/python_functions.asp | Functions
/python/python_arguments.asp | Arguments
/python/python_args_kwargs.asp | args and kwargs
/python/python_scope.asp | Scope
/python/python_decorators.asp | Decorators
/python/python_lambda.asp | Lambda
/python/python_recursion.asp | Recursion
/python/python_generators.asp | Generators
/python/python_range.asp | Range

MODULES, OOP, FILES
/python/python_arrays.asp | Arrays
/python/python_iterators.asp | Iterators
/python/python_modules.asp | Modules
/python/python_datetime.asp | Dates
/python/python_math.asp | Math
/python/python_json.asp | JSON
/python/python_regex.asp | RegEx
/python/python_pip.asp | pip
/python/python_try_except.asp | Exceptions
/python/python_user_input.asp | User Input
/python/python_virtualenv.asp | Virtual Environment
/python/python_oop.asp | OOP
/python/python_classes.asp | Classes and Objects
/python/python_class_init.asp | __init__
/python/python_class_self.asp | self
/python/python_class_properties.asp | Properties
/python/python_class_methods.asp | Class Methods
/python/python_magic_methods.asp | Magic Methods
/python/python_magic_str.asp | __str__
/python/python_magic_repr.asp | __repr__
/python/python_magic_eq.asp | __eq__
/python/python_magic_add.asp | __add__
/python/python_magic_len.asp | __len__
/python/python_magic_lt.asp | __lt__
/python/python_magic_contains.asp | __contains__
/python/python_magic_call.asp | __call__
/python/python_inheritance.asp | Inheritance
/python/python_polymorphism.asp | Polymorphism
/python/python_encapsulation.asp | Encapsulation
/python/python_class_inner.asp | Inner Classes
/python/python_file_handling.asp | File Handling
/python/python_file_open.asp | Open and Read
/python/python_file_write.asp | Write and Create
/python/python_file_remove.asp | Delete Files
```

Subject-level routes: `/python/python_examples.asp` (EXAMPLES_INDEX), `/python/python_compiler.asp` (EDITOR), `/python/python_exercises.asp` (EXERCISE_INDEX), `/python/python_quiz.asp` (QUIZ), `/python/python_syllabus.asp` (SYLLABUS), `/python/python_study_plan.asp` (STUDY_PLAN). Reference groups cover built-ins, collection/file methods, keywords, exceptions, glossary, and selected modules. Per-topic challenge routes follow `/python/python_challenges_<topic>.asp` for many chapters.

## Priority Tier 1: DSA

Root: `/dsa/index.php`. Complete observed sidebar order:

```text
TUTORIAL
/dsa/dsa_intro.php | Intro
/dsa/dsa_algo_simple.php | Simple Algorithm
ARRAYS
/dsa/dsa_data_arrays.php | Arrays
/dsa/dsa_algo_bubblesort.php | Bubble Sort
/dsa/dsa_algo_selectionsort.php | Selection Sort
/dsa/dsa_algo_insertionsort.php | Insertion Sort
/dsa/dsa_algo_quicksort.php | Quick Sort
/dsa/dsa_algo_countingsort.php | Counting Sort
/dsa/dsa_algo_radixsort.php | Radix Sort
/dsa/dsa_algo_mergesort.php | Merge Sort
/dsa/dsa_algo_linearsearch.php | Linear Search
/dsa/dsa_algo_binarysearch.php | Binary Search
LINKED LISTS
/dsa/dsa_theory_linkedlists.php | Linked Lists
/dsa/dsa_theory_linkedlists_memory.php | Linked Lists in Memory
/dsa/dsa_data_linkedlists_types.php | Linked List Types
/dsa/dsa_algo_linkedlists_operations.php | Linked List Operations
STACKS AND QUEUES
/dsa/dsa_data_stacks.php | Stacks
/dsa/dsa_data_queues.php | Queues
HASH TABLES
/dsa/dsa_theory_hashtables.php | Hash Tables
/dsa/dsa_data_hashsets.php | Hash Sets
/dsa/dsa_data_hashmaps.php | Hash Maps
TREES
/dsa/dsa_theory_trees.php | Trees
/dsa/dsa_data_binarytrees.php | Binary Trees
/dsa/dsa_algo_binarytrees_preorder.php | Pre-order Traversal
/dsa/dsa_algo_binarytrees_inorder.php | In-order Traversal
/dsa/dsa_algo_binarytrees_postorder.php | Post-order Traversal
/dsa/dsa_data_binarytrees_arrayImpl.php | Array Implementation
/dsa/dsa_data_binarysearchtrees.php | Binary Search Trees
/dsa/dsa_data_avltrees.php | AVL Trees
GRAPHS
/dsa/dsa_theory_graphs.php | Graphs
/dsa/dsa_data_graphs_implementation.php | Graph Representation
/dsa/dsa_algo_graphs_traversal.php | Graph Traversal
/dsa/dsa_algo_graphs_cycledetection.php | Cycle Detection
SHORTEST PATH
/dsa/dsa_theory_graphs_shortestpath.php | Shortest Path
/dsa/dsa_algo_graphs_dijkstra.php | Dijkstra
/dsa/dsa_algo_graphs_bellmanford.php | Bellman-Ford
MINIMUM SPANNING TREE
/dsa/dsa_theory_mst_minspantree.php | Minimum Spanning Tree
/dsa/dsa_algo_mst_prim.php | Prim
/dsa/dsa_algo_mst_kruskal.php | Kruskal
MAXIMUM FLOW
/dsa/dsa_theory_graphs_maxflow.php | Maximum Flow
/dsa/dsa_algo_graphs_fordfulkerson.php | Ford-Fulkerson
/dsa/dsa_algo_graphs_edmondskarp.php | Edmonds-Karp
TIME COMPLEXITY
/dsa/dsa_timecomplexity_theory.php | Introduction
/dsa/dsa_timecomplexity_bblsort.php | Bubble Sort
/dsa/dsa_timecomplexity_selsort.php | Selection Sort
/dsa/dsa_timecomplexity_insertionsort.php | Insertion Sort
/dsa/dsa_timecomplexity_quicksort.php | Quick Sort
/dsa/dsa_timecomplexity_countsort.php | Counting Sort
/dsa/dsa_timecomplexity_radixsort.php | Radix Sort
/dsa/dsa_timecomplexity_mergesort.php | Merge Sort
/dsa/dsa_timecomplexity_linearsearch.php | Linear Search
/dsa/dsa_timecomplexity_binarysearch.php | Binary Search
REFERENCE-LABELED TOPICS
/dsa/dsa_ref_euclidean_algorithm.php | Euclidean Algorithm
/dsa/dsa_ref_huffman_coding.php | Huffman Coding
/dsa/dsa_ref_traveling_salesman.php | Traveling Salesman
/dsa/dsa_ref_knapsack.php | 0/1 Knapsack
/dsa/dsa_ref_memoization.php | Memoization
/dsa/dsa_ref_tabulation.php | Tabulation
/dsa/dsa_ref_dynamic_programming.php | Dynamic Programming
/dsa/dsa_ref_greedy.php | Greedy Algorithms
```

Subject-level routes: `/dsa/dsa_examples.php`, `/dsa/dsa_exercises.php`, `/dsa/dsa_quiz.php`, `/dsa/dsa_syllabus.php`, `/dsa/dsa_study_plan.php`.

## Priority Tier 1: NumPy, Pandas, Machine Learning

NumPy (`/python/numpy/default.asp`) exposes 43 ordered tutorial pages: introduction/setup; creating, indexing, slicing, typing, copying, shaping, reshaping, iterating, joining, splitting, searching, sorting, and filtering arrays; random distributions; and ufunc creation/arithmetic/rounding/log/sum/product/difference/LCM/GCD/trigonometry/hyperbolic/set operations. Verified system routes: `/python/numpy/numpy_compiler.asp`, `numpy_exercises.asp`, `numpy_quiz.asp`, `numpy_syllabus.asp`, `numpy_study_plan.asp`.

Pandas (`/python/pandas/default.asp`) exposes 14 ordered pages: intro, setup, Series, DataFrame, CSV, JSON, analysis, cleaning overview, empty cells, wrong format, wrong data, duplicates, correlations, plotting. System routes: `pandas_compiler.asp`, `pandas_exercises.asp`, `pandas_quiz.asp`, `pandas_syllabus.asp`, `pandas_study_plan.asp`, and `pandas_ref_dataframe.asp`.

Machine Learning is a Python-sidebar group rather than an independent subject shell. Verified routes run from `/python/python_ml_getting_started.asp` through descriptive statistics, distributions, scatter/linear/polynomial/multiple regression, scaling, train/test, trees, confusion matrices, clustering, logistic regression, grid search, preprocessing, k-means, bagging, cross-validation, AUC/ROC, and KNN. No ML-specific exercise hub, quiz, examples index, reference, syllabus, study plan, or editor was observed.

## Priority Tier 1: HTML, CSS, JavaScript, SQL, C, C++, Java

For these subjects the current full ordered sidebar taxonomy was captured, while individual hrefs were not all dereferenced because direct site access was restricted. Verified subject roots and system routes are:

| Subject | Root | Examples | Editor/compiler | Exercises | Quiz | Syllabus | Study plan | Reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| HTML | `/html/default.asp` | `/html/html_examples.asp` | `/html/html_editor.asp` | `/html/html_exercises.asp` | `/html/html_quiz.asp` | `/html/html_syllabus.asp` | `/html/html_study_plan.asp` | `/tags/default.asp` |
| CSS | `/css/default.asp` | `/css/css_examples.asp` | `/css/css_editor.asp` | `/css/css_exercises.asp` | `/css/css_quiz.asp` | `/css/css_syllabus.asp` | `/css/css_study_plan.asp` | `/cssref/index.php` |
| JavaScript | `/js/default.asp` | `/js/js_examples.asp` | `/js/js_editor.asp` | `/js/js_exercises.asp` | `/js/js_quiz.asp` | `/js/js_syllabus.asp` | `/js/js_study_plan.asp` | in-sidebar indexes |
| SQL | `/sql/default.asp` | `/sql/sql_examples.asp` | `/sql/sql_editor.asp` | `/sql/sql_exercises.asp` | `/sql/sql_quiz.asp` | `/sql/sql_syllabus.asp` | `/sql/sql_study_plan.asp` | in-sidebar indexes |
| C | `/c/index.php` | `/c/c_examples.php` | not observed | `/c/c_exercises.php` | `/c/c_quiz.php` | `/c/c_syllabus.php` | `/c/c_study_plan.php` | header libraries |
| C++ | `/cpp/default.asp` | `/cpp/cpp_examples.asp` | `/cpp/cpp_compiler.asp` | `/cpp/cpp_exercises.asp` | `/cpp/cpp_quiz.asp` | `/cpp/cpp_syllabus.asp` | `/cpp/cpp_study_plan.asp` | standard-library groups |
| Java | `/java/default.asp` | `/java/java_examples.asp` | `/java/java_compiler.asp` | `/java/java_exercises.asp` | `/java/java_quiz.asp` | `/java/java_syllabus.asp` | `/java/java_study_plan.asp` | language/library groups |

Taxonomy coverage: HTML spans document structure, formatting, links/media, tables/lists, semantics, forms, graphics, media and browser APIs; CSS spans cascade, box model, typography, positioning, responsive design, flex/grid and advanced effects; JavaScript spans language core, objects/collections, DOM/events/Web APIs, async/modules/classes/iterators and references; SQL spans querying, joins, grouping, DDL/constraints/security and vendor functions; C/C++/Java span language core, functions, memory/files/errors, OOP where applicable, data structures, projects and dense library references.

## Priority Tier 2 and Tier 3

Representative subject roots observed: `/typescript/`, `/react/`, `/nodejs/`, `/mysql/`, `/postgresql/`, `/mongodb/`, `/git/`, `/bash/`, `/rust/index.php`, `/go/`, `/cs/index.php`, `/php/`, `/django/`, `/python/scipy/index.php`, `/python/matplotlib_intro.asp`, `/statistics/`, `/datascience/`, `/ai/`, `/gen_ai/index.php`, `/cybersecurity/`.

Additional catalog subjects include Kotlin, Swift, R, Vue, Angular, jQuery, Sass, Bootstrap, XML, JSON, AJAX, SVG, Canvas, accessibility, AWS, Raspberry Pi, Excel, Google Sheets, and introductory programming/web material. These are catalog discoveries, not complete inventories.

## Cross-route findings

- Subject home is usually tutorial home.
- Sub-lessons are independent routes and participate in previous/next order.
- Lesson-local exercises and code challenges may be separate nested-looking routes.
- Examples, editor/compiler, exercise hub, quiz, syllabus, and study plan are subject-level destinations near the bottom of the same subject sidebar.
- Reference breadth varies by subject; DSA’s “Reference” grouping is topic-like rather than API-like.
- Historical extensions, mixed naming, and query parameters make the public route system inconsistent; Atlas should use stable extensionless slugs and typed aliases.

