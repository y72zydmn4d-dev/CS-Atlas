import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import LandingPage from "@/app/page";
import { LocaleProvider } from "@/components/locale-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { storage } from "@/lib/storage";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
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
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Sign in is not available yet.");
  });
  it("switches explanatory account modes without credential collection or fake authentication", () => {
    const { container } = landing();
    fireEvent.click(screen.getByRole("tab", { name: "Create account" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Account creation is not available yet.");
    expect(screen.getByRole("tab", { name: "Create account" })).toHaveAttribute("aria-selected", "true");
    expect(container.querySelector("input, form")).toBeNull();
    expect(screen.queryByRole("button", { name: /Google|GitHub|Apple|Continue$/ })).not.toBeInTheDocument();
  });
  it("places functional guest entry and local-data information before unavailable account modes", () => {
    landing();
    const guest = screen.getByRole("link", { name:/Continue as guest/ });
    const tabs = screen.getByRole("tablist", { name:"Account options" });
    expect(guest.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const disclosure = guest.closest("section")?.querySelector("details");
    expect(disclosure?.compareDocumentPosition(tabs) && disclosure.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText(/No account sync or cloud backup/)).toBeInTheDocument();
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
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Đăng nhập hiện chưa khả dụng.");
    expect(storage.loadProgress()).toEqual({ python: "in-progress" });
  });
  it("keeps the selected account tab as the entry tab stop when unactivated focus leaves", () => {
    landing();
    const signIn = screen.getByRole("tab", { name: "Sign in" });
    const create = screen.getByRole("tab", { name: "Create account" });
    signIn.focus();
    fireEvent.keyDown(signIn,{ key:"End" });
    expect(create).toHaveFocus();
    fireEvent.blur(create,{ relatedTarget:screen.getByRole("link", { name:/Continue as guest/ }) });
    expect(signIn).toHaveAttribute("tabindex","0");
    expect(create).toHaveAttribute("tabindex","-1");
  });
  it("reuses working locale/theme preferences without changing learning data", () => {
    landing();
    fireEvent.click(screen.getByRole("button", { name: "VI" }));
    expect(screen.getByRole("heading", { level:1 })).toHaveTextContent("Hiểu những mối liên hệ.");
    expect(storage.loadLocale()).toBe("vi");
    fireEvent.click(screen.getByRole("button", { name: "Giao diện tối" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(storage.loadTheme()).toBe("dark");
  });
});
