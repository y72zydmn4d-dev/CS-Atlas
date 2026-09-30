# Navigation model

## Observed hierarchy

1. Global header exposes Tutorials, References, Exercises, certificates/account controls and search.
2. A horizontal topic strip provides fast cross-subject access.
3. A subject-scoped sidebar contains tutorial home, ordered chapter groups, lessons, and auxiliary surfaces.
4. Previous/Home/Next controls reinforce the authored sequence at lesson level.
5. Main content uses local links for examples, exercises, references and editor routes.

The sidebar is the primary curriculum map. Group headings chunk large inventories, the active lesson provides location, and previous/next lets readers advance without returning to an index. The same lesson sequence supports both scan-based navigation and linear learning.

## Responsive behavior

Public CSS/JavaScript lesson guidance states that the persistent desktop menu becomes a top-menu-triggered drawer at small widths. Editor routes expose orientation controls, indicating that the source/output split is responsive. Exact breakpoints and focus behavior were not live-tested.

## Atlas decisions

- Preserve the global Atlas shell, but scope the Learn curriculum sidebar to one subject.
- Keep curriculum state in a nested Learn layout/client island so navigation preserves filter, collapsed groups and scroll position.
- Use semantic `nav`, headings, lists, `aria-current`, visible focus and an accessible mobile dialog/drawer.
- Keep an optional right rail for on-page headings, concepts, related problems and Atlas AI actions.
- Do not reproduce the second global topic strip; global Atlas search and the Learn catalog already serve cross-subject discovery.
- Do not inherit historical URL shapes or mix teacher-product promotion into lesson navigation.

