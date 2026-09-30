import { WorkspaceHomePage } from "@/components/home/workspace-home-page";
import { metadataForRoute } from "@/lib/routes";

export const metadata = metadataForRoute("home");

export default function HomePage() {
  return <WorkspaceHomePage />;
}
