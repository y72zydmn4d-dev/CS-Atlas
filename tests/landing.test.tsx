import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import LandingPage from "@/app/page";
import { LocaleProvider } from "@/components/locale-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { storage } from "@/lib/storage";

afterEach(cleanup);
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
function landing() { return render(<ThemeProvider><LocaleProvider><LandingPage /></LocaleProvider></ThemeProvider>); }

describe("public entry", () => {
  it("renders a serious public identity and a functional guest destination without workspace controls", () => {
    landing();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Understand the connections.");
    expect(screen.getByRole("link", { name: /Continue as guest/ })).toHaveAttribute("href", "/home");
    expect(screen.queryByRole("button", { name: "Search atlas" })).not.toBeInTheDocument();
    expect(screen.getByText("Accounts are not available yet. You can learn as a guest.")).toBeInTheDocument();
  });
  it("switches explanatory account modes without credential collection or fake authentication", () => {
    const { container } = landing();
    fireEvent.click(screen.getByRole("tab", { name: "Create account" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Account creation will be available when accounts launch.");
    expect(screen.getByRole("tab", { name: "Create account" })).toHaveAttribute("aria-selected", "true");
    expect(container.querySelector("input, form")).toBeNull();
    expect(screen.queryByRole("button", { name: /Google|GitHub|Apple|Continue$/ })).not.toBeInTheDocument();
  });
  it("supports manual keyboard tab activation and native local-data disclosure", () => {
    landing();
    const signIn = screen.getByRole("tab", { name: "Sign in" });
    signIn.focus();
    fireEvent.keyDown(signIn, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Create account" })).toHaveFocus();
    expect(signIn).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("tab", { name: "Create account" }));
    fireEvent.keyDown(screen.getByRole("tab", { name: "Create account" }), { key: "Home" });
    expect(signIn).toHaveFocus();
    expect(screen.getAllByText("About local data")[0].closest("details")).not.toHaveAttribute("open");
  });
  it("uses Vietnamese messages and preserves local learning records", async () => {
    storage.saveProgress({ python: "in-progress" });
    storage.saveLocale("vi");
    landing();
    await waitFor(() => expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hiểu những mối liên hệ."));
    expect(screen.getByRole("link", { name: /Tiếp tục với tư cách khách/ })).toHaveAttribute("href", "/home");
    expect(storage.loadProgress()).toEqual({ python: "in-progress" });
  });
});
