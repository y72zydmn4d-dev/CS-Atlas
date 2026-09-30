import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LearnLayout from "@/app/learn/layout";
import { LocaleProvider } from "@/components/locale-provider";
import { getActiveLearnSubjectSlug } from "@/components/learn/learn-subject-bar";
import { learnSubjectsForNavigation } from "@/content/learn/registry";

const navigationState = vi.hoisted(() => ({ pathname: "/learn" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigationState.pathname }));

function Providers({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
beforeEach(() => { navigationState.pathname = "/learn"; });

describe("Learn subject navigation", () => {
  it("renders every SubjectManifest in configured navigation order", () => {
    render(<Providers><LearnLayout><div>Learn catalog</div></LearnLayout></Providers>);
    const nav = screen.getByRole("navigation", { name: "Learn subjects" });
    const subjectLinks = Array.from(nav.querySelectorAll<HTMLAnchorElement>(".learn-subject-bar-scroll a"));
    expect(subjectLinks.map((link) => link.textContent)).toEqual([
      "HTML", "CSS", "JavaScript", "SQL", "Python", "Java", "C", "C++", "Data Structures & Algorithms", "NumPy", "Pandas", "Machine Learning", "PyTorch",
    ]);
    expect(learnSubjectsForNavigation.map((subject) => subject.navigationOrder)).toEqual([...learnSubjectsForNavigation].map((subject) => subject.navigationOrder).sort((left, right) => left - right));
    expect(subjectLinks).toHaveLength(learnSubjectsForNavigation.length);
  });

  it("keeps the subject active on home, lesson, and subject-surface routes", () => {
    navigationState.pathname = "/learn/python/introduction";
    const { rerender } = render(<Providers><LearnLayout><div>Lesson</div></LearnLayout></Providers>);
    const python = screen.getByRole("link", { name: "Python" });
    expect(python).toHaveAttribute("href", "/learn/python");
    expect(python).toHaveAttribute("aria-current", "page");

    navigationState.pathname = "/learn/cpp/reference";
    rerender(<Providers><LearnLayout><div>Reference</div></LearnLayout></Providers>);
    expect(screen.getByRole("link", { name: "C++" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("navigation", { name: "Learn subjects" })).toBeInTheDocument();
  });

  it("supports arrow-key navigation across subject links", () => {
    render(<Providers><LearnLayout><div>Learn catalog</div></LearnLayout></Providers>);
    const nav = screen.getByRole("navigation", { name: "Learn subjects" });
    const html = within(nav).getByRole("link", { name: "HTML" });
    html.focus();
    fireEvent.keyDown(html, { key: "ArrowRight" });
    expect(within(nav).getByRole("link", { name: "CSS" })).toHaveFocus();
  });

  it("resolves active subjects without changing canonical routes", () => {
    const items = learnSubjectsForNavigation.map(({ id, slug, title, category, status, navigationOrder }) => ({ id, slug, title, category, status, navigationOrder }));
    expect(getActiveLearnSubjectSlug("/learn/python/lists", items)).toBe("python");
    expect(getActiveLearnSubjectSlug("/learn/dsa", items)).toBe("dsa");
    expect(getActiveLearnSubjectSlug("/learn", items)).toBeUndefined();
    expect(items.find((subject) => subject.id === "cpp")?.slug).toBe("cpp");
  });
});
