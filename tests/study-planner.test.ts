import { describe, expect, it } from "vitest";
import { aggregateLearningActivity, deriveGoalProgress, isLearningEvent, isLearningGoal, isStudyPlan } from "@/lib/domain/learning";

describe("local goals and study plans", () => {
  it("derives a goal from unique matching evidence rather than a stored percentage", () => {
    const goal = {
      id: "goal-1",
      title: "Finish two lessons",
      metric: "lessons-completed" as const,
      targetCount: 2,
      conceptIds: ["topic:arrays"],
      status: "active" as const,
      createdAt: "2026-09-30T00:00:00.000Z",
      updatedAt: "2026-09-30T00:00:00.000Z",
    };
    const progress = deriveGoalProgress(goal, [
      { id: "one", type: "lesson-completed" as const, conceptId: "topic:arrays", source: "browser-local" as const, occurredAt: "2026-09-30T00:00:00.000Z", target: { type: "lesson" as const, id: "lesson:arrays" } },
      { id: "two", type: "lesson-completed" as const, conceptId: "topic:arrays", source: "browser-local" as const, occurredAt: "2026-09-30T01:00:00.000Z", target: { type: "lesson" as const, id: "lesson:arrays" } },
      { id: "three", type: "lesson-completed" as const, conceptId: "topic:strings", source: "browser-local" as const, occurredAt: "2026-09-30T02:00:00.000Z", target: { type: "lesson" as const, id: "lesson:strings" } },
    ]);
    expect(progress).toMatchObject({ completedCount: 1, targetCount: 2, percent: 50, isComplete: false });
  });

  it("keeps additive v1 events readable while validating new plan records", () => {
    expect(isLearningEvent({ id: "old-event", type: "exercise-solved", conceptId: "topic:arrays", source: "browser-local", occurredAt: "2026-09-30T00:00:00.000Z" })).toBe(true);
    expect(isLearningGoal({ id: "goal", title: "Practice", metric: "exercises-solved", targetCount: 3, conceptIds: [], status: "active", createdAt: "2026-09-30T00:00:00.000Z", updatedAt: "2026-09-30T00:00:00.000Z" })).toBe(true);
    expect(isStudyPlan({ id: "plan", title: "Arrays", timezone: "Asia/Ho_Chi_Minh", status: "active", createdAt: "2026-09-30T00:00:00.000Z", updatedAt: "2026-09-30T00:00:00.000Z", items: [{ id: "item", title: "Arrays", href: "/learn/arrays", conceptId: "topic:arrays", target: { type: "lesson", id: "lesson:arrays" }, scheduledFor: "2026-10-01" }] })).toBe(true);
  });

  it("rejects malformed plan targets and non-canonical goal shapes", () => {
    expect(isLearningGoal({ id: "goal", title: "", metric: "exercises-solved", targetCount: 0, conceptIds: [], status: "active", createdAt: "no", updatedAt: "no" })).toBe(false);
    expect(isStudyPlan({ id: "plan", title: "Plan", timezone: "UTC", status: "active", createdAt: "now", updatedAt: "now", items: [{ id: "item", title: "Item", href: "/", conceptId: "topic:arrays", target: { type: "unknown", id: "item" } }] })).toBe(false);
  });

  it("scopes recurring goals and activity aggregation to the selected timezone", () => {
    const recurring = { id: "weekly", title: "Weekly practice", metric: "exercises-solved" as const, targetCount: 2, conceptIds: [], recurrence: "weekly" as const, timezone: "Asia/Ho_Chi_Minh", status: "active" as const, createdAt: "2026-09-01T00:00:00.000Z", updatedAt: "2026-09-01T00:00:00.000Z" };
    const events = [
      { id: "old", type: "exercise-solved" as const, conceptId: "topic:arrays", source: "browser-local" as const, occurredAt: "2026-09-27T12:00:00.000Z", target: { type: "exercise" as const, id: "old" } },
      { id: "new", type: "exercise-solved" as const, conceptId: "topic:arrays", source: "browser-local" as const, occurredAt: "2026-09-28T18:00:00.000Z", target: { type: "exercise" as const, id: "new" } },
    ];
    expect(deriveGoalProgress(recurring, events, new Date("2026-09-30T00:00:00.000Z"))).toMatchObject({ completedCount: 1, percent: 50 });
    expect(aggregateLearningActivity(events, "Asia/Ho_Chi_Minh").map((day) => day.date)).toEqual(["2026-09-29", "2026-09-27"]);
  });
});
