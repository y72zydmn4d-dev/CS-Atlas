import Link from "next/link";
import { Message } from "@/components/locale-provider";
import { SubjectExplorer } from "@/components/studio/subject-explorer";
import { CurriculumExplorer } from "@/components/studio/curriculum-explorer";
import { LessonInspector } from "@/components/studio/lesson-inspector";
import { StudioOverview } from "@/components/studio/studio-overview";
import { StudioUtilities } from "@/components/studio/studio-utilities";
import type { StudioCurriculum, StudioLessonInspection, StudioOverview as StudioOverviewData, StudioSubjectSummary } from "@/lib/studio/types";

export function StudioWorkspace({ overview, subjects, curriculum, inspection }: {
  overview: StudioOverviewData; subjects: StudioSubjectSummary[];
  curriculum: StudioCurriculum | null; inspection: StudioLessonInspection | null;
}) {
  return <main id="main-content" className="page studio-page">
    <a className="skip-link" href="#studio-explorers"><Message k="navigation.skip" /></a>
    <header className="studio-header">
      <div><Link href="/studio" prefetch={false}><h1>CS Atlas <Message k="studio.title" /></h1></Link><p><Message k="studio.subtitle" /></p></div>
      <div className="studio-header-actions"><span className="studio-read-only"><Message k="studio.readOnly" /></span><StudioUtilities /><Link href="/home" className="studio-text-link"><Message k="navigation.home" /> →</Link></div>
    </header>
    <StudioOverview overview={overview} />
    <p className="studio-mobile-note"><Message k="studio.desktop" /></p>
    <div id="studio-explorers" tabIndex={-1} className="studio-grid">
      <SubjectExplorer subjects={subjects} selectedSubjectId={curriculum?.subject.id} />
      <CurriculumExplorer key={curriculum?.subject.id ?? "none"} curriculum={curriculum} selectedLessonId={inspection?.lesson.id} />
      <LessonInspector inspection={inspection} />
    </div>
    <p className="studio-milestone-note"><Message k="studio.milestone" /></p>
  </main>;
}
