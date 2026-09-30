# W3Schools Learn audit: research scope

**Research date:** 2026-09-30  
**Purpose:** study the public learning information architecture and interaction model before redesigning CS-Atlas Learn.

## Boundary

W3Schools is an external research reference, not an implementation source. This audit records paths, titles, headings, taxonomy, page archetypes, navigation relationships, interaction observations, and approximate layout behavior. It does not store complete page bodies, remote HTML, CSS, JavaScript, lesson prose, examples, exercises, quizzes, illustrations, logos, or downloadable media.

All Atlas implementation and educational copy must be independently authored against CS-Atlas contracts and visual tokens. The canonical Atlas Concept registry remains authoritative.

## Method and access limits

The crawl began from the public homepage and tutorial catalog and followed public tutorial/sidebar destinations conservatively. Public indexed/rendered page metadata was used to enumerate curriculum and activity routes. A direct read-only HTTP request reached W3Schools but received `403`; the available in-app browser could not be initialized. No attempt was made to bypass access controls, anti-bot behavior, or rate limits.

Consequences:

- Exact hrefs were verified for Python, DSA, NumPy, Pandas, Machine Learning, and representative system/activity pages.
- Complete ordered sidebar labels were captured for HTML, CSS, JavaScript, SQL, C, C++, and Java, but every individual label was not dereferenced into a verified href.
- Tier 2 findings are representative rather than exhaustive route inventories.
- Live DOM screenshots, computed styles, pixel measurements, sticky offsets, and exact breakpoint values were unavailable. Approximate measurements in this package are hypotheses for Atlas design validation, never claims about current W3Schools CSS.
- “Not observed” means absent from sampled public navigation, not proof that a route does not exist.

## Research questions

1. Which route and page archetypes make a large tutorial catalog navigable?
2. How are tutorial, exercise, quiz, example, reference, syllabus, study-plan, and editor surfaces separated?
3. Which navigation state belongs to a subject, lesson, or global shell?
4. Which structural patterns should Atlas adopt without copying branding or implementation?
5. Where can Atlas improve depth, semantic linking, progress evidence, accessibility, and DSA/AI coverage?

## Primary public entry points sampled

- <https://www.w3schools.com/>
- <https://www.w3schools.com/tutorials/index.php>
- <https://www.w3schools.com/python/default.asp>
- <https://www.w3schools.com/dsa/index.php>
- <https://www.w3schools.com/html/default.asp>
- <https://www.w3schools.com/css/default.asp>
- <https://www.w3schools.com/js/default.asp>
- <https://www.w3schools.com/sql/default.asp>
- <https://www.w3schools.com/c/index.php>
- <https://www.w3schools.com/cpp/default.asp>
- <https://www.w3schools.com/java/default.asp>
- <https://www.w3schools.com/python/numpy/default.asp>
- <https://www.w3schools.com/python/pandas/default.asp>

## Evidence notation

- **Observed:** exposed by the public rendered/indexed page or link target.
- **Inferred:** product-design conclusion derived from multiple observed structures.
- **Unverified:** requires a render-capable browser or broader crawl.

