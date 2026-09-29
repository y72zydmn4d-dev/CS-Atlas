import { notFound } from "next/navigation";
import { practiceById } from "@/content/practice/problems";
import { PracticeWorkspace } from "@/components/practice/practice-workspace";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ problem: string }> }) {
  const { problem: id } = await params;
  const problem = practiceById.get(id);
  return { title: problem?.title.en ?? "Problem", description: problem?.summary.en };
}

export default async function ProblemPage({ params }: { params: Promise<{ problem: string }> }) {
  const { problem: id } = await params;
  const problem = practiceById.get(id);
  if (!problem) notFound();
  return <div className="page practice-page"><PracticeWorkspace key={`${problem.id}:${problem.version}`} problem={problem} aiConfigured={Boolean(process.env.GEMINI_API_KEY)} /></div>;
}
