import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { StudioWorkspace } from "@/components/studio/studio-workspace";
import { requireStudioEnabled } from "@/lib/studio/guard.server";
import { getStudioCurriculum, getStudioLesson, getStudioOverview, getStudioSubjects } from "@/lib/studio/loaders.server";
import "./studio.css";
import { liveExistingLessonService } from "@/lib/studio/live-save.server";

export const runtime = "nodejs";
export const metadata: Metadata = { title: "Content Studio", robots: { index: false, follow: false } };

export default async function StudioPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Check before any async/streaming boundary or canonical content read.
  requireStudioEnabled();
  await connection();
  const { subject, lesson } = await searchParams;
  if ((subject !== undefined && typeof subject !== "string") || (lesson !== undefined && typeof lesson !== "string") || (lesson !== undefined && !subject)) notFound();
  const [overview, subjects] = await Promise.all([getStudioOverview(), getStudioSubjects()]);
  const curriculum = subject !== undefined ? await getStudioCurriculum(subject) : null;
  if (subject !== undefined && !curriculum) notFound();
  let inspection = subject && lesson !== undefined ? await getStudioLesson(subject, lesson) : null;
  if (lesson !== undefined && !inspection) notFound();
  if (inspection) inspection = await (await liveExistingLessonService()).load(inspection.lesson.subjectId, inspection.lesson.id);
  return <StudioWorkspace overview={overview} subjects={subjects} curriculum={curriculum} inspection={inspection} />;
}
