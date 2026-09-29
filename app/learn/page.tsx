import type { Metadata } from "next";
import { LearnCatalog } from "@/components/learn/learn-catalog";
import { Message } from "@/components/locale-provider";

export const metadata: Metadata = { title: "Learn", description: "Structured CS Atlas lessons connected through canonical concepts." };

export default function LearnPage() {
  return <div className="page"><header className="page-header"><div><p className="kicker"><Message k="learn.kicker" /></p><h1><Message k="learn.title" /></h1><p className="lede"><Message k="learn.lede" /></p></div></header><LearnCatalog /></div>;
}
