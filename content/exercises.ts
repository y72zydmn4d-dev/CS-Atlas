import { canonicalConceptIdForTopic } from "@/content/concepts/registry";
import { topicTranslationsVi } from "@/content/translations/vi";
import { topics } from "@/content/topics";
import type { Exercise } from "@/lib/domain/exercises";
import type { ExerciseBlock } from "@/lib/types";

function translatedExercise(block: ExerciseBlock, topicId: string): Exercise {
  const translated = topicTranslationsVi[topicId]?.content?.find((candidate) => candidate.id === block.id);
  const translatedExerciseBlock = translated?.type === "exercise" ? translated : null;
  return {
    id: `exercise:${topicId}:${block.id}`,
    version: 1,
    lessonId: `lesson:${topicId}`,
    conceptIds: [canonicalConceptIdForTopic(topicId), ...block.relatedTopicIds.map(canonicalConceptIdForTopic)],
    mode: block.exerciseType,
    difficulty: block.difficulty,
    title: { en: block.title, vi: translatedExerciseBlock?.title ?? block.title },
    prompt: { en: block.prompt, vi: translatedExerciseBlock?.prompt ?? block.prompt },
    hints: block.hints.map((hint, index) => ({ en: hint, vi: translatedExerciseBlock?.hints[index] ?? hint })),
    estimatedMinutes: block.estimatedMinutes,
    href: `/learn/${topics.find((topic) => topic.id === topicId)?.slug ?? topicId}#${block.id}`,
    assessment: { kind: "self-directed" },
    execution: "none",
  };
}

const adaptedExercises: Exercise[] = topics.flatMap((topic) => topic.content
  .filter((block): block is ExerciseBlock => block.type === "exercise")
  .map((block) => translatedExercise(block, topic.id)));

const nativeExercises: Exercise[] = [
  {
    id: "exercise:binary-search-invariant", version: 1, lessonId: "lesson:searching", conceptIds: [canonicalConceptIdForTopic("searching")], mode: "multiple_choice", difficulty: "easy", estimatedMinutes: 4, href: "/exercises/exercise:binary-search-invariant", execution: "none",
    title: { en: "Binary search interval", vi: "Khoảng tìm kiếm nhị phân" },
    prompt: { en: "A sorted array is searched with a closed interval [low, high]. Which invariant should hold before each iteration?", vi: "Một mảng đã sắp xếp được tìm bằng khoảng đóng [low, high]. Bất biến nào cần đúng trước mỗi vòng lặp?" },
    hints: [{ en: "Think about where a target could still be.", vi: "Hãy nghĩ về nơi phần tử đích vẫn có thể nằm." }],
    assessment: { kind: "multiple-choice", options: [
      { id: "a", text: { en: "The target, if present, is within [low, high].", vi: "Nếu tồn tại, phần tử đích nằm trong [low, high]." } },
      { id: "b", text: { en: "Every element before low is greater than the target.", vi: "Mọi phần tử trước low đều lớn hơn phần tử đích." } },
      { id: "c", text: { en: "The middle index never changes.", vi: "Chỉ số giữa không bao giờ thay đổi." } },
    ], correctOptionId: "a", feedback: { en: "The interval represents exactly the remaining candidates.", vi: "Khoảng biểu diễn chính xác các ứng viên còn lại." } },
  },
  {
    id: "exercise:array-linear-scan", version: 1, lessonId: "lesson:arrays", conceptIds: [canonicalConceptIdForTopic("arrays")], mode: "fill_code", difficulty: "easy", estimatedMinutes: 5, href: "/exercises/exercise:array-linear-scan", execution: "none",
    title: { en: "Linear scan condition", vi: "Điều kiện quét tuyến tính" },
    prompt: { en: "Complete the Python condition that returns the first matching index: `if values[index] ___ target:`", vi: "Hoàn thành điều kiện Python trả về chỉ số khớp đầu tiên: `if values[index] ___ target:`" },
    hints: [{ en: "Equality compares two values.", vi: "Phép bằng so sánh hai giá trị." }],
    assessment: { kind: "exact-answer", acceptedAnswers: ["=="], inputLabel: { en: "Missing operator", vi: "Toán tử còn thiếu" }, feedback: { en: "A linear scan checks equality at each position.", vi: "Quét tuyến tính kiểm tra bằng nhau tại từng vị trí." } },
  },
  {
    id: "exercise:numpy-axis-mean", version: 1, lessonId: "lesson:numpy", conceptIds: [canonicalConceptIdForTopic("numpy")], mode: "numpy", difficulty: "easy", estimatedMinutes: 5, href: "/exercises/exercise:numpy-axis-mean", execution: "none",
    title: { en: "NumPy column mean", vi: "Trung bình cột NumPy" },
    prompt: { en: "For a two-dimensional NumPy array `scores`, write the expression that computes one mean for each column.", vi: "Với mảng NumPy hai chiều `scores`, hãy viết biểu thức tính một giá trị trung bình cho mỗi cột." },
    hints: [{ en: "Columns vary down the first axis.", vi: "Các cột biến thiên theo trục đầu tiên." }],
    assessment: { kind: "exact-answer", acceptedAnswers: ["scores.mean(axis=0)", "np.mean(scores, axis=0)"], inputLabel: { en: "NumPy expression", vi: "Biểu thức NumPy" }, feedback: { en: "Reducing axis 0 leaves one value per column.", vi: "Giảm trục 0 để lại một giá trị cho mỗi cột." } },
  },
  {
    id: "exercise:pandas-filter", version: 1, lessonId: "lesson:pandas", conceptIds: [canonicalConceptIdForTopic("pandas")], mode: "pandas", difficulty: "easy", estimatedMinutes: 5, href: "/exercises/exercise:pandas-filter", execution: "none",
    title: { en: "Pandas boolean filter", vi: "Lọc boolean trong Pandas" },
    prompt: { en: "Complete the expression that keeps rows with a score of at least 80: `frame[frame[\"score\"] ___ 80]`", vi: "Hoàn thành biểu thức giữ các hàng có điểm ít nhất 80: `frame[frame[\"score\"] ___ 80]`" },
    hints: [{ en: "The comparison should include 80.", vi: "Phép so sánh cần bao gồm 80." }],
    assessment: { kind: "exact-answer", acceptedAnswers: [">="], inputLabel: { en: "Missing operator", vi: "Toán tử còn thiếu" }, feedback: { en: "The boolean mask is true for scores at or above the threshold.", vi: "Mặt nạ boolean đúng với điểm bằng hoặc cao hơn ngưỡng." } },
  },
];

export const exercises: Exercise[] = [...adaptedExercises, ...nativeExercises];

export const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
