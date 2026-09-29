import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { AtlasProvider } from "@/components/atlas-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { LearningDashboard } from "@/components/workspace-home";
import { AtlasWorkspace } from "@/components/atlas/atlas-workspace";
import { AppShell } from "@/components/app-shell";
import { storage } from "@/lib/storage";
import type { ReactNode } from "react";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next/dynamic", () => ({ default: () => function CanvasPlaceholder() { return <div data-testid="lazy-canvas" />; } }));
vi.mock("@/components/library/library-resources", () => ({ LibraryResources: () => <section>Linked library resources</section> }));
vi.mock("@/components/search-dialog", () => ({ SearchDialog: ({ open }: { open: boolean }) => open ? <div role="dialog">Search</div> : null }));
function Providers({ children }: { children: ReactNode }) { return <ThemeProvider><LocaleProvider><AtlasProvider>{children}</AtlasProvider></LocaleProvider></ThemeProvider>; }
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});

describe("workspace interactions", () => {
  it("starts small screens in the readable list without loading the canvas", async () => {
    vi.stubGlobal("matchMedia", vi.fn((query: string) => ({ matches: query === "(max-width: 650px)", addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    render(<Providers><AtlasWorkspace /></Providers>);
    await waitFor(() => expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true"));
    expect(screen.queryByTestId("lazy-canvas")).not.toBeInTheDocument();
  });
  it("renders genuine active work and newest bookmarks", async () => {
    storage.saveProgress({ python: "in-progress" });
    storage.saveBookmarks([{ id: "python", title: "Python", type: "topic", href: "/topics/python", context: "Programming", createdAt: 2 }]);
    render(<Providers><LearningDashboard /></Providers>);
    await waitFor(() => expect(screen.getByRole("heading", { name: "Your next step" })).toBeInTheDocument());
    expect(screen.getByRole("link", { name: /Python.*Continue learning/ })).toHaveAttribute("href", "/topics/python");
    expect(screen.getByRole("link", { name: "Python" })).toHaveAttribute("href", "/topics/python");
  });
  it("supports list selection, bilingual search and progress updates without the canvas", async () => {
    render(<Providers><AtlasWorkspace /></Providers>);
    fireEvent.click(screen.getByRole("button", { name: "List" }));
    fireEvent.click(screen.getByRole("button", { name: /Domain\s*Programming/ }));
    const inspector = screen.getByRole("complementary", { name: "Inspect Programming" });
    expect(within(inspector).getByRole("link", { name: "Open full page" })).toHaveAttribute("href", "/domains/programming");
    fireEvent.change(screen.getByRole("textbox", { name: "Find a field or topic…" }), { target: { value: "do phuc tap" } });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Find a field or topic…" }), { key: "Enter" });
    expect(screen.getByRole("heading", { name: "Complexity Analysis" })).toHaveFocus();
    fireEvent.change(screen.getByRole("combobox", { name: "Learning status" }), { target: { value: "in-progress" } });
    await waitFor(() => expect(storage.loadProgress()["complexity-analysis"]).toBe("in-progress"));
    fireEvent.click(screen.getByRole("button", { name: "Close details" }));
    expect(screen.getByRole("textbox", { name: "Find a field or topic…" })).toHaveFocus();
  });
  it("persists sidebar collapse, opens command search and returns mobile focus", async () => {
    const { container, unmount } = render(<Providers><AppShell><p>Content</p></AppShell></Providers>);
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(storage.loadSidebarCollapsed()).toBe(true);
    expect(container.querySelector(".workspace-frame")).toHaveClass("sidebar-collapsed");
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(screen.getByRole("dialog", { name: "" })).toHaveTextContent("Search");
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    await waitFor(() => expect(within(screen.getByRole("dialog", { name: "Explore" })).getByRole("button", { name: "Close navigation" })).toHaveFocus());
    expect(container.querySelector(".workspace-body")).toHaveAttribute("inert");
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(screen.getByRole("button", { name: "Open navigation" })).toHaveFocus());
    unmount();
    render(<Providers><AppShell><p>Content</p></AppShell></Providers>);
    await waitFor(() => expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument());
  });
});
