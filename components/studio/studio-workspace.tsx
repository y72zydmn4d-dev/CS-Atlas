import { Message } from "@/components/locale-provider";
import { SubjectExplorer } from "@/components/studio/subject-explorer";
import { CurriculumExplorer } from "@/components/studio/curriculum-explorer";
import { LessonInspector } from "@/components/studio/lesson-inspector";
import { LessonEditor } from "@/components/studio/lesson-editor";
import { StudioDraftSession } from "@/components/studio/studio-draft-session";
import { StudioLink } from "@/components/studio/studio-link";
import { StudioOverview } from "@/components/studio/studio-overview";
import { StudioUtilities } from "@/components/studio/studio-utilities";
import type { StudioCurriculum, StudioLessonInspection, StudioOverview as StudioOverviewData, StudioSubjectSummary } from "@/lib/studio/types";

export function StudioWorkspace({ overview, subjects, curriculum, inspection }: {
  overview: StudioOverviewData; subjects: StudioSubjectSummary[];
  curriculum: StudioCurriculum | null; inspection: StudioLessonInspection | null;
}) {
  return <StudioDraftSession inspection={inspection}><main id="main-content" className="page studio-page">
    <a className="skip-link" href="#studio-explorers"><Message k="navigation.skip" /></a>
    <header className="studio-header">
      <div><StudioLink href="/studio"><h1>CS Atlas <Message k="studio.title" /></h1></StudioLink><p><Message k="studio.subtitle" /></p></div>
      <div className="studio-header-actions"><span className="studio-read-only"><Message k="studio.readOnly" /></span><StudioUtilities /><StudioLink href="/home" className="studio-text-link"><Message k="navigation.home" /> →</StudioLink></div>
    </header>
    <StudioOverview overview={overview} />
    <p className="studio-mobile-note"><Message k="studio.desktop" /></p>
    <div id="studio-explorers" tabIndex={-1} className="studio-grid">
      <SubjectExplorer subjects={subjects} selectedSubjectId={curriculum?.subject.id} />
      <CurriculumExplorer key={curriculum?.subject.id ?? "none"} curriculum={curriculum} selectedLessonId={inspection?.lesson.id} />
      <LessonEditor canonicalDetails={<LessonInspector inspection={inspection} />} learnerHref={inspection?.learnerHref} />
    </div>
    <p className="studio-milestone-note"><Message k="studio.milestone" /></p>
  </main></StudioDraftSession>;
}
