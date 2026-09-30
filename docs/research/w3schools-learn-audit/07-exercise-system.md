# Exercise system study

## Observed model

Exercise hubs are subject-level routes organized by tutorial chapter. Representative hubs expose search/filtering, completed counts, grouped tasks, question counts and open/done state. Individual exercise routes focus on one short prompt and provide submit, correctness, answer/retry and next-question states. Some lessons also link directly to a chapter exercise or code challenge.

Exercises and quizzes are separate from tutorial pages even when linked from them. Account-based progress may aggregate tutorials, exercises and quizzes, while public tutorial use remains possible without sign-in.

## Atlas design

- The subject hub is a projection over canonical Atlas `Exercise` records, grouped by manifest section/lesson.
- Inline checkpoints reference those same records; they do not duplicate prompts in page components.
- Completion appends existing local learning evidence and uses the current Exercise attempt store.
- Section and subject quizzes use the same evidence system, not a second score database.
- Exercise types remain original Atlas material: multiple choice, exact/fill answer, predict output, identify bug and small completion tasks.
- Exercise status and content version remain explicit; a changed version does not silently preserve an obsolete “solved” claim.

