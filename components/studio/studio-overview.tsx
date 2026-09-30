import { Message } from "@/components/locale-provider";
import { learnContentStatuses } from "@/lib/domain/learn-platform";
import type { StudioOverview as StudioOverviewData } from "@/lib/studio/types";

export function StudioOverview({ overview }: { overview: StudioOverviewData }) {
  return <section className="studio-overview" aria-labelledby="studio-health-title">
    <h2 id="studio-health-title"><Message k="studio.overview" /></h2>
    <div className="studio-health-row">
      <dl className="studio-totals">
        <div><dt><Message k="studio.subjects" /></dt><dd>{overview.subjectCount}</dd></div>
        <div><dt><Message k="studio.sections" /></dt><dd>{overview.sectionCount}</dd></div>
        <div><dt><Message k="studio.lessons" /></dt><dd>{overview.lessonCount}</dd></div>
      </dl>
      <div className="studio-health-statuses"><p><Message k="studio.declared" /></p><dl>{[...learnContentStatuses].reverse().map((status) => <div key={status}><dt className="studio-status" data-status={status}>{status}</dt><dd>{overview.lessonStatuses[status]}</dd></div>)}</dl></div>
    </div>
    <p><Message k="studio.bodySources" values={{ count: overview.declaredBodySourceCount }} /></p>
    <p><Message k="studio.validation" /></p>
  </section>;
}
