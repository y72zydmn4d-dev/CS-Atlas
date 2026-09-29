import { Breadcrumbs } from "@/components/breadcrumbs";
import { AtlasAssistant } from "@/components/atlas-assistant";

export const metadata = { title: "AI Assistant" };
export const dynamic = "force-dynamic";

export default function AssistantPage() {
  return <div className="page narrow"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "AI Assistant" }]} /><AtlasAssistant configured={Boolean(process.env.GEMINI_API_KEY)} /></div>;
}
