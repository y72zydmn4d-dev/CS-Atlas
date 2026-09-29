import { ExerciseCatalog } from "@/components/exercises/exercise-catalog";
import { Message } from "@/components/locale-provider";
import { metadataForRoute } from "@/lib/routes";

export const metadata = metadataForRoute("exercises");

export default function ExercisesPage() {
  return <div className="page"><header className="page-header"><div><p className="kicker"><Message k="exercise.kicker" /></p><h1><Message k="exercise.title" /></h1><p className="lede"><Message k="exercise.lede" /></p></div></header><ExerciseCatalog /></div>;
}
