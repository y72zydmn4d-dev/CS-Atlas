import Link from "next/link";
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

/** Structural inspection, not a second learner renderer or draft preview. */
export function LessonInspector({ inspection }: { inspection: StudioLessonInspection | null }) {
  const lesson = inspection?.lesson;
  const content = inspection?.content;
  return <section className="studio-panel studio-inspector" aria-labelledby="studio-inspector-title">
    <header className="studio-panel-header">
      <h2 id="studio-inspector-title"><Message k="studio.inspector" /></h2>
      {lesson && inspection && <div className="studio-inspector-heading">
        <h3><StudioText value={lesson.title} /></h3>
        <Link href={inspection.learnerHref} className="studio-text-link"><Message k="studio.openLearner" /> →</Link>
      </div>}
    </header>
    {!lesson || !inspection ? <p className="studio-empty"><Message k="studio.chooseLesson" /></p> : <div className="studio-inspector-content">
      <p><StudioText value={lesson.description} /></p>
      {lesson.translationStatus === "english-only" && <p className="studio-notice"><Message k="studio.englishOnly" /></p>}
      <h3><Message k="studio.metadata" /></h3>
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
      <h3><Message k="studio.body" /></h3>
      {!content ? <p className="studio-notice"><Message k="studio.noBody" /></p> : <>
        <p className="studio-body-meta"><Message k="studio.bodyVersion" values={{ version: content.version, date: content.reviewedAt, count: content.blocks.length }} /></p>
        <h4><Message k="studio.summary" /></h4><p><StudioText value={content.summary} /></p>
        <h4><Message k="studio.blocks" /></h4><p className="studio-body-meta"><Message k="studio.notPreview" /></p>
        <ol className="studio-block-list">{content.blocks.map((block) => <li key={block.id}>
          <details className="studio-block"><summary><strong>{block.type}</strong><code>{block.id}</code></summary><pre>{JSON.stringify(block, null, 2)}</pre></details>
        </li>)}</ol>
      </>}
    </div>}
  </section>;
}
