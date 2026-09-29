import { Binary, Blocks, BrainCircuit, ChartNoAxesCombined, Languages, Network, ScanEye, Sigma, Sparkles, Terminal } from "lucide-react";

const icons = { Binary, Blocks, BrainCircuit, ChartNoAxesCombined, Languages, Network, ScanEye, Sigma, Sparkles, Terminal };
export function DomainIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = icons[name as keyof typeof icons] ?? Blocks;
  return <Icon size={size} aria-hidden />;
}
