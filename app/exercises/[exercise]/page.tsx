import { notFound } from "next/navigation";
import { ExerciseWorkspace } from "@/components/exercises/exercise-workspace";
import { exerciseById } from "@/content/exercises";

export async function generateMetadata({ params }: { params: Promise<{ exercise: string }> }) {
  const { exercise: id } = await params;
  const item = exerciseById.get(id);
  return { title: item?.title.en ?? "Exercise", description: item?.prompt.en };
}

export default async function ExercisePage({ params }: { params: Promise<{ exercise: string }> }) {
  const { exercise: id } = await params;
  const exercise = exerciseById.get(id);
  if (!exercise) notFound();
  return <div className="page"><ExerciseWorkspace exercise={exercise} /></div>;
}
