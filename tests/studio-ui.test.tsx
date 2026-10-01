import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { StudioWorkspace } from "@/components/studio/studio-workspace";
import { LessonInspector } from "@/components/studio/lesson-inspector";
import { LocaleProvider, useI18n } from "@/components/locale-provider";
import { getStudioCurriculum, getStudioLesson, getStudioOverview, getStudioSubjects } from "@/lib/studio/loaders.server";
import { renderWithLocale } from "@/tests/test-utils";

beforeEach(() => { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true"); localStorage.clear(); });
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

async function renderWorkspace(subject?: string, lesson?: string) {
  const [overview, subjects] = await Promise.all([getStudioOverview(), getStudioSubjects()]);
  return renderWithLocale(<StudioWorkspace overview={overview} subjects={subjects} curriculum={subject ? await getStudioCurriculum(subject) : null} inspection={subject && lesson ? await getStudioLesson(subject, lesson) : null} />);
}

describe("Studio read-only workspace", () => {
  it("shows real health, selection guidance and no pretend authoring actions", async () => {
    await renderWorkspace();
    expect(screen.getByRole("heading", { level: 1, name: "CS Atlas Content Studio" })).toBeVisible();
    expect(screen.getByText("428")).toBeVisible();
    expect(screen.getByText("419")).toBeVisible();
    expect(screen.getByText(/Validation: not scanned/)).toBeVisible();
    expect(screen.getByText(/Select a subject/)).toBeVisible();
    expect(screen.getByText(/Select a lesson to load/)).toBeVisible();
    expect(screen.queryByRole("button", { name: /save|create|reorder|validate|preview/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Python PARTIAL/ })).toHaveAttribute("href", "/studio?subject=python");
  });

  it("filters subject metadata by search and canonical status", async () => {
    await renderWorkspace();
    const subjects = screen.getByRole("navigation", { name: "Subject explorer" });
    expect(within(subjects).getAllByRole("link")).toHaveLength(13);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search subjects" }), { target: { value: "java" } });
    expect(within(subjects).getAllByRole("link")).toHaveLength(2);
    fireEvent.change(screen.getByRole("combobox", { name: "Subject status" }), { target: { value: "PARTIAL" } });
    expect(within(subjects).queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText("No subjects match these filters.")).toBeVisible();
  });

  it("filters selected curriculum by status, section and bilingual metadata; preserves canonical routes", async () => {
    await renderWorkspace("python", "learn:python:introduction");
    const curriculum = screen.getByRole("navigation", { name: "Curriculum explorer" });
    expect(within(curriculum).getByRole("link", { name: /Introduction COMPLETE/ })).toHaveAttribute("aria-current", "page");
    fireEvent.change(screen.getByRole("combobox", { name: "Lesson status" }), { target: { value: "COMPLETE" } });
    expect(screen.getByText("5 matching lessons")).toBeVisible();
    const section = (await getStudioCurriculum("python"))?.sections[0];
    expect(section).toBeDefined();
    fireEvent.change(screen.getByRole("combobox", { name: "Section" }), { target: { value: section?.id } });
    expect(within(curriculum).getAllByRole("link")).toHaveLength(1);
    const link = within(curriculum).getByRole("link");
    expect(new URL(link.getAttribute("href") ?? "", "https://atlas.test").searchParams.get("lesson")).toBe("learn:python:introduction");
    fireEvent.change(screen.getByRole("searchbox", { name: "Search lessons or sections" }), { target: { value: "missing lesson" } });
    expect(screen.getByText("No lessons match these filters.")).toBeVisible();
  });

  it("retains immutable canonical source details without recording progress", async () => {
    localStorage.setItem("studio-test-learning-evidence", "untouched");
    const inspection = await getStudioLesson("dsa", "learn:dsa:arrays");
    if (!inspection?.content) throw new Error("Expected canonical fixture body");
    const { container } = renderWithLocale(<LessonInspector inspection={inspection} />);
    expect(screen.getByText("learn:dsa:arrays")).toBeVisible();
    expect(screen.getByText("exercise:array-linear-scan")).toBeVisible();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
    expect(localStorage.getItem("studio-test-learning-evidence")).toBe("untouched");
    expect(localStorage.length).toBe(1);
  });

  it("shows actual skeleton absence and localized interface, without pretending copied text is translated", async () => {
    // Use the existing provider's locale setter rather than assume its storage key.
    const props = { overview: await getStudioOverview(), subjects: await getStudioSubjects(), curriculum: await getStudioCurriculum("java"), inspection: await getStudioLesson("java", "learn:java:interfaces") };
    const { rerender } = renderWithLocale(<StudioWorkspace {...props} />);
    expect(screen.getByText(/No authored body exists/)).toBeVisible();
    expect(screen.getByText(/declares English-only/)).toBeVisible();
    function Vietnamese() {
      const { setLocale } = useI18n();
      return <><button onClick={() => setLocale("vi")}>Use Vietnamese</button><StudioWorkspace {...props} /></>;
    }
    rerender(<LocaleProvider><Vietnamese /></LocaleProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Use Vietnamese" }));
    expect(screen.getByRole("heading", { name: "Soạn bản nháp bài học" })).toBeVisible();
    expect(screen.getByText(/Chưa có nội dung được biên soạn/)).toBeVisible();
  });
});
