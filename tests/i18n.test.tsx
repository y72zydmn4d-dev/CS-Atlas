import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Message } from "@/components/locale-provider";
import { domains, searchIndex, topicById, topics } from "@/content";
import { domainTranslationsVi, topicTranslationsVi } from "@/content/translations/vi";
import { getMessage } from "@/i18n/get-message";
import { localizeTopic } from "@/i18n/content";
import { searchContent } from "@/lib/search";
import { storage } from "@/lib/storage";
import { renderWithLocale } from "@/tests/test-utils";

describe("localized messages and persistence", () => {
  beforeEach(() => { window.localStorage.clear(); document.documentElement.lang = "en"; });

  it("looks up and interpolates messages", () => {
    expect(getMessage("vi", "search.bestMatches", { count: 3 })).toBe("3 kết quả phù hợp nhất");
    expect(getMessage("en", "visualizer.step", { current: 2, total: 5 })).toBe("Step 2 / 5");
  });

  it("validates stored locales and falls back from corrupted data", () => {
    window.localStorage.setItem("cs-atlas.locale.v1", "fr");
    expect(storage.loadLocale()).toBe("en");
    window.localStorage.setItem("cs-atlas.locale.v1", "vi");
    expect(storage.loadLocale()).toBe("vi");
  });

  it("switches interface text, storage, and the document language", async () => {
    renderWithLocale(<><LanguageSwitcher /><p><Message k="navigation.home" /></p></>);
    fireEvent.click(screen.getByRole("button", { name: "VI" }));
    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
    expect(window.localStorage.getItem("cs-atlas.locale.v1")).toBe("vi");
    await waitFor(() => expect(document.documentElement.lang).toBe("vi"));
  });

  it("respects a persisted locale after hydration", async () => {
    storage.saveLocale("vi");
    renderWithLocale(<Message k="navigation.domains" />);
    await waitFor(() => expect(screen.getByText("Lĩnh vực")).toBeInTheDocument());
  });
});

describe("Vietnamese educational content", () => {
  it("covers every domain and topic with localized metadata", () => {
    expect(Object.keys(domainTranslationsVi)).toHaveLength(domains.length);
    expect(Object.keys(topicTranslationsVi)).toHaveLength(topics.length);
    for (const topic of topics) {
      expect(topicTranslationsVi[topic.id]?.title).toBeTruthy();
      expect(topicTranslationsVi[topic.id]?.summary.length).toBeGreaterThan(20);
    }
  });

  it.each(["complexity-analysis", "gradient-descent", "linear-regression"])("marks %s as a complete reference translation", (id) => {
    const translation = topicTranslationsVi[id];
    expect(translation.status).toBe("complete");
    expect(translation.content?.length).toBeGreaterThanOrEqual(12);
    expect(translation.glossary?.length).toBeGreaterThanOrEqual(3);
  });

  it("preserves formulas and source code between languages", () => {
    for (const id of ["complexity-analysis", "gradient-descent", "linear-regression"]) {
      const source = topicById.get(id)!;
      const translated = localizeTopic(source, "vi");
      const sourceFormulas = source.content.flatMap((block) => block.type === "formula" ? [block.expression] : []);
      const translatedFormulas = translated.content.flatMap((block) => block.type === "formula" ? [block.expression] : []);
      const sourceCode = source.content.flatMap((block) => block.type === "code" ? [block.code] : []);
      const translatedCode = translated.content.flatMap((block) => block.type === "code" ? [block.code] : []);
      expect(translatedFormulas).toEqual(sourceFormulas);
      expect(translatedCode).toEqual(sourceCode);
    }
  });
});

describe("bilingual search", () => {
  it.each([
    ["bảng băm", "hash-tables"],
    ["hạ dốc", "gradient-descent"],
    ["hồi quy tuyến tính", "linear-regression"],
  ])("finds %s", (query, expectedId) => {
    expect(searchContent(query, searchIndex).some((item) => item.id === expectedId)).toBe(true);
  });

  it("normalizes Vietnamese đ consistently", () => {
    expect(searchContent("do phuc tap", searchIndex).some((item) => item.id === "complexity-analysis")).toBe(true);
    expect(searchContent("độ phức tạp", searchIndex).some((item) => item.id === "complexity-analysis")).toBe(true);
  });
});
