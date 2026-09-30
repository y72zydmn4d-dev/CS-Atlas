import { LearnSubjectBar, type LearnSubjectNavigationItem } from "@/components/learn/learn-subject-bar";
import { learnSubjectsForNavigation } from "@/content/learn/registry";

const subjectNavigation: LearnSubjectNavigationItem[] = learnSubjectsForNavigation.map(({ id, slug, title, category, status, navigationOrder }) => ({
  id,
  slug,
  title,
  category,
  status,
  navigationOrder,
}));

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <div className="learn-route-shell"><LearnSubjectBar subjects={subjectNavigation} />{children}</div>;
}
