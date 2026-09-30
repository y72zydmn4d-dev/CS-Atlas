# Example and editor study

## Observed interaction contract

Lesson examples present a recognizable container, readable source, and a clear action that opens an editor. Dedicated editor routes separate editable source from an isolated result view. React/Node editor samples expose multiple-file or server-oriented variants, theme/orientation controls, keyboard shortcuts, reset/run behavior, and a result frame.

The value is the stable mental model, not the visual styling:

```text
example -> edit -> run -> inspect output/error -> reset -> continue
```

## Atlas design

- Each example declares language, starter source, runtime capability, maximum source/output, and the owning lesson/Concept IDs.
- Reuse the existing disposable QuickJS Worker for explicitly compatible JavaScript `solve(input)` examples.
- Treat syntax highlighting separately from execution capability.
- Unsupported languages remain editable/copyable but must show `runtime unavailable`; they never execute in a Next.js route.
- “Open Playground” links to the existing Practice/Problem experience or a future approved playground record.
- Run, reset and copy controls are keyboard operable and announce results/errors.
- The editor client island is lazy/route scoped; lesson text remains server-renderable.

No W3Schools editor implementation, code, CSS, examples, or output framing is copied.

