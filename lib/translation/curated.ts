import type { TranslationProvider, TranslationResult } from "@/lib/translation/types";

export interface TranslationUnit {
  id: string;
  sourceLocale: "en";
  targetLocale: "vi";
  source: string;
  translation: string;
  topicId?: string;
  blockId?: string;
}

export const translationUnits: TranslationUnit[] = [
  { id: "gd-summary", sourceLocale: "en", targetLocale: "vi", topicId: "gradient-descent", source: "Iteratively move parameters opposite the objective gradient to reduce loss.", translation: "Lặp lại việc di chuyển các tham số theo hướng ngược gradient của hàm mục tiêu để giảm mất mát." },
  { id: "lr-summary", sourceLocale: "en", targetLocale: "vi", topicId: "linear-regression", source: "Fit a linear conditional mean by minimizing squared residuals.", translation: "Khớp kỳ vọng có điều kiện tuyến tính bằng cách cực tiểu hóa bình phương phần dư." },
  { id: "complexity-summary", sourceLocale: "en", targetLocale: "vi", topicId: "complexity-analysis", source: "Describe how time and space grow as input size increases using asymptotic bounds.", translation: "Mô tả cách thời gian và bộ nhớ tăng theo kích thước đầu vào bằng các cận tiệm cận." },
  { id: "gd-update", sourceLocale: "en", targetLocale: "vi", topicId: "gradient-descent", blockId: "update-rule", source: "Each iteration evaluates the objective gradient at the current parameters and takes a step in the negative-gradient direction.", translation: "Mỗi vòng lặp tính gradient của hàm mục tiêu tại bộ tham số hiện tại rồi bước theo hướng ngược gradient." },
  { id: "complexity-quote", sourceLocale: "en", targetLocale: "vi", topicId: "complexity-analysis", source: "Complexity is the shape of a cost curve, not a stopwatch reading.", translation: "Độ phức tạp là hình dạng của đường cong chi phí, không phải một con số trên đồng hồ bấm giờ." },
  { id: "linear-causation", sourceLocale: "en", targetLocale: "vi", topicId: "linear-regression", source: "Prediction is not causation", translation: "Dự đoán không đồng nghĩa với quan hệ nhân quả." },
];

const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");

export const CuratedTranslationProvider: TranslationProvider = {
  async canTranslate(source, target) { return source === "en" && target === "vi"; },
  async translate(text, source, target): Promise<TranslationResult | null> {
    if (source !== "en" || target !== "vi") return null;
    const unit = translationUnits.find((item) => normalize(item.source) === normalize(text));
    return unit ? { text: unit.translation, source: "curated" } : null;
  },
};
