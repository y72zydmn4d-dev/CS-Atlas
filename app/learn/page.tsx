import { LearnHome } from "@/components/learn/learn-home";
import { metadataForRoute } from "@/lib/routes";

export const metadata = metadataForRoute("learn");

export default function LearnPage() {
  return <div className="page"><LearnHome /></div>;
}
