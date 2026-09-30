import { PublicLandingShell } from "@/components/landing/public-landing-shell";
import { KnowledgeAtlasVisual } from "@/components/landing/knowledge-atlas-visual";
import { knowledgePreview } from "@/content/landing/knowledge-preview";
import { buildLandingProjection } from "@/lib/concepts/landing-projection";
import { conceptGraphService } from "@/lib/concepts/service";
import { metadataForRoute } from "@/lib/routes";

export const metadata = { ...metadataForRoute("landing"), title: { absolute: "CS Atlas" } };

export default function LandingPage() {
  const projection = buildLandingProjection(conceptGraphService, knowledgePreview);
  return <PublicLandingShell visual={<KnowledgeAtlasVisual projection={projection} />} />;
}
