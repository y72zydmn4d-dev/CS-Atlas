import { ProblemLibrary } from "@/components/problems/problem-library";
import { Message } from "@/components/locale-provider";

export const metadata = { title: "Problems", description: "CS Atlas programming problem library." };

export default function ProblemsPage() {
  return <div className="page"><header className="page-header"><div><p className="kicker"><Message k="problems.kicker" /></p><h1><Message k="problems.title" /></h1><p className="lede"><Message k="problems.lede" /></p></div></header><ProblemLibrary /></div>;
}
