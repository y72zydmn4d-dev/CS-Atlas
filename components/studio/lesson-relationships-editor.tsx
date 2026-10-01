"use client";

import { useI18n } from "@/components/locale-provider";
import { RelationshipPicker } from "@/components/studio/relationship-picker";
import type { LessonManifest } from "@/lib/domain/learn-platform";

export function LessonRelationshipsEditor({ lesson, onChange }: { lesson: LessonManifest; onChange: (lesson: LessonManifest) => void }) {
  const { t } = useI18n();
  return <fieldset className="studio-editor-section"><legend>{t("studio.relationships")}</legend>
    <p className="studio-body-meta">{t("studio.conceptRoles")}</p>
    <RelationshipPicker kind="concepts" label={t("studio.concepts")} ids={lesson.conceptIds} onChange={(conceptIds) => onChange({ ...lesson, conceptIds })} />
    <RelationshipPicker kind="lessons" label={t("studio.prerequisites")} ids={lesson.prerequisiteLessonIds} onChange={(prerequisiteLessonIds) => onChange({ ...lesson, prerequisiteLessonIds })} />
    <RelationshipPicker kind="exercises" label={t("studio.exercises")} ids={lesson.exerciseIds} onChange={(exerciseIds) => onChange({ ...lesson, exerciseIds })} />
    <RelationshipPicker kind="problems" label={t("studio.problems")} ids={lesson.problemIds} onChange={(problemIds) => onChange({ ...lesson, problemIds })} />
    <p className="studio-body-meta">{t("studio.quizBoundary")}</p>
  </fieldset>;
}
