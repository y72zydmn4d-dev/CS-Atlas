import { describe, expect, it } from "vitest";
import { validateAtlasAiRequest } from "@/lib/domain/ai";

describe("Atlas AI task contract", () => {
  it("accepts explicit typed public-context tasks", () => {
    expect(validateAtlasAiRequest({ question: "Explain the invariant", locale: "en", task: "hint", contextConceptId: "algorithm:binary-search" })).toMatchObject({ ok: true, value: { task: "hint" } });
  });

  it("rejects unknown task and malformed context source fields", () => {
    expect(validateAtlasAiRequest({ question: "Explain the invariant", locale: "en", task: "browse-library" })).toMatchObject({ ok: false });
    expect(validateAtlasAiRequest({ question: "Explain the invariant", locale: "en", task: "ask", contextConceptId: 7 })).toMatchObject({ ok: false });
  });
});
