import { beforeEach, describe, expect, it, vi } from "vitest";
import { browserPreferences } from "@/lib/storage/preferences";
import { storage } from "@/lib/storage";

beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
describe("preference-only storage leaf", () => {
  it("shares legacy keys and encoding with the full storage facade", () => {
    storage.saveTheme("light"); storage.saveLocale("vi");
    expect(browserPreferences.loadTheme()).toBe("light");
    expect(browserPreferences.loadLocale()).toBe("vi");
    browserPreferences.saveTheme("dark"); browserPreferences.saveLocale("en");
    expect(storage.loadTheme()).toBe("dark");
    expect(storage.loadLocale()).toBe("en");
    expect(localStorage.getItem("cs-atlas.theme.v1")).toBe("dark");
    expect(localStorage.getItem("cs-atlas.locale.v1")).toBe("en");
  });
  it("retains safe defaults when storage is corrupt or restricted", () => {
    localStorage.setItem("cs-atlas.theme.v1","bogus");
    localStorage.setItem("cs-atlas.locale.v1","bogus");
    expect(browserPreferences.loadTheme()).toBeNull();
    expect(browserPreferences.loadLocale()).toBe("en");
    vi.spyOn(Storage.prototype,"getItem").mockImplementation(() => { throw new Error("restricted"); });
    expect(browserPreferences.loadTheme()).toBeNull();
    expect(browserPreferences.loadLocale()).toBe("en");
    vi.spyOn(Storage.prototype,"setItem").mockImplementation(() => { throw new Error("restricted"); });
    expect(() => browserPreferences.saveTheme("dark")).not.toThrow();
    expect(() => browserPreferences.saveLocale("vi")).not.toThrow();
  });
});
