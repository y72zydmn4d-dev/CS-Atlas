import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProgressDashboard } from "@/components/progress-dashboard";
import { Message } from "@/components/locale-provider";
import { PracticeProgress } from "@/components/practice/practice-progress";
export const metadata={title:"Progress"};
export default function ProgressPage(){return <div className="page"><Breadcrumbs items={[{label:"Home",href:"/"},{label:"Progress"}]}/><header className="page-header"><div><p className="kicker"><Message k="progress.kicker" /></p><h1><Message k="navigation.progress" /></h1><p className="lede"><Message k="progress.lede" /></p></div></header><PracticeProgress/><ProgressDashboard/></div>}
