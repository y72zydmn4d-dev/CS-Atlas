import type { Metadata } from "next";
import { AtlasWorkspace } from "@/components/atlas/atlas-workspace";
export const metadata: Metadata = { title: "Knowledge Atlas · CS Atlas" };
export default function AtlasPage() { return <AtlasWorkspace />; }
