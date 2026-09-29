import { Breadcrumbs } from "@/components/breadcrumbs";
import { AtlasAssistant } from "@/components/atlas-assistant";
import { resolveConcept } from "@/content/concepts/registry";

export const metadata = { title: "AI Assistant" };
export const dynamic = "force-dynamic";

export default async function AssistantPage({ searchParams }: { searchParams: Promise<{ concept?: string }> }) {
  const { concept: requestedConcept } = await searchParams;
  const concept = requestedConcept ? resolveConcept(requestedConcept) : null;
  return <div className="page narrow"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "AI Assistant" }]} /><AtlasAssistant configured={Boolean(process.env.GEMINI_API_KEY)} contextConceptId={concept?.id} contextLabel={concept?.name.en} /></div>;
}
