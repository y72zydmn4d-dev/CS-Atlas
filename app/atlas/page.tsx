import { AtlasWorkspace } from "@/components/atlas/atlas-workspace";
import { metadataForRoute } from "@/lib/routes";
export const metadata = metadataForRoute("atlas");
export default function AtlasPage() { return <AtlasWorkspace />; }
