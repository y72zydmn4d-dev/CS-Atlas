import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AtlasProvider } from "@/components/atlas-provider";
import { ConceptDetail } from "@/components/concepts/concept-detail";
import { LocaleProvider } from "@/components/locale-provider";
import { resolveConcept } from "@/content/concepts/registry";
import { storage } from "@/lib/storage";

vi.mock("@/components/library/library-resources", () => ({ LibraryResources: () => <section>Private Library links</section> }));

afterEach(() => { cleanup(); localStorage.clear(); });

describe("canonical Concept detail", () => {
  it("connects a lesson, problem, explicit AI context, and local evidence", async () => {
    const concept = resolveConcept("topic:arrays");
    if (!concept) throw new Error("fixture concept missing");
    render(<LocaleProvider><AtlasProvider><ConceptDetail concept={concept} lesson={{ id: "lesson:arrays", title: { en: "Arrays", vi: "Mảng" }, href: "/learn/arrays" }} related={[]} exercises={[]} problems={[{ id: "sorted-pair", title: { en: "Pair sum", vi: "Tổng cặp" }, href: "/problems/sorted-pair" }]} learningViews={[]} /></AtlasProvider></LocaleProvider>);
    expect(screen.getByRole("link", { name: "Read lesson" })).toHaveAttribute("href", "/learn/arrays");
    expect(screen.getByRole("link", { name: "Ask Atlas AI" })).toHaveAttribute("href", "/assistant?concept=topic%3Aarrays");
    fireEvent.change(screen.getByRole("combobox", { name: "Learning status" }), { target: { value: "completed" } });
    await waitFor(() => expect(storage.loadLearningEvents().some((event) => event.conceptId === "topic:arrays" && event.type === "lesson-completed")).toBe(true));
  });
});
