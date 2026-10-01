import type { ReactNode } from "react";
import { Message } from "@/components/locale-provider";
import { StudioText } from "@/components/studio/studio-text";
import type { MessageKey } from "@/i18n/get-message";
import type { StudioLessonInspection } from "@/lib/studio/types";

function MetadataEntry({ label, children }: { label: MessageKey; children: ReactNode }) {
  return <div><dt><Message k={label} /></dt><dd>{children}</dd></div>;
}

function LinkedIds({ label, ids }: { label: MessageKey; ids: string[] }) {
  return <MetadataEntry label={label}>{ids.length ? <ul className="studio-id-list">{ids.map((id) => <li key={id}><code>{id}</code></li>)}</ul> : <Message k="studio.none" />}</MetadataEntry>;
}

/** Immutable source details, composed by the server inside the draft editor. */
export function LessonInspector({ inspection }: { inspection: StudioLessonInspection | null }) {
  const lesson = inspection?.lesson;
  return !lesson || !inspection ? null : <div className="studio-inspector-content">
      <dl className="studio-metadata">
        <MetadataEntry label="studio.identity"><code>{lesson.id}</code></MetadataEntry>
        <MetadataEntry label="studio.slug"><code>{lesson.slug}</code></MetadataEntry>
        <MetadataEntry label="studio.sectionFilter"><StudioText value={inspection.section.title} /><small><code>{lesson.sectionId}</code></small></MetadataEntry>
        <MetadataEntry label="studio.status"><span className="studio-status" data-status={lesson.status}>{lesson.status}</span></MetadataEntry>
        <MetadataEntry label="studio.difficulty">{lesson.difficulty}</MetadataEntry>
        <MetadataEntry label="studio.duration"><Message k="studio.minutes" values={{ count: lesson.estimatedMinutes }} /></MetadataEntry>
        <MetadataEntry label="studio.order">{inspection.section.order} / {lesson.order}</MetadataEntry>
        <MetadataEntry label="studio.translation">{lesson.translationStatus}</MetadataEntry>
        <MetadataEntry label="studio.source">{lesson.contentSource ? <code>{lesson.contentSource}</code> : <Message k="studio.noSource" />}</MetadataEntry>
        <LinkedIds label="studio.concepts" ids={lesson.conceptIds} />
        <LinkedIds label="studio.exercises" ids={lesson.exerciseIds} />
        <LinkedIds label="studio.problems" ids={lesson.problemIds} />
        <LinkedIds label="studio.prerequisites" ids={lesson.prerequisiteLessonIds} />
      </dl>
    </div>;
}
