import { Message } from "@/components/locale-provider";

export default function Loading() {
  return <div className="page route-fallback" role="status" aria-live="polite"><span className="loading-indicator" aria-hidden /><Message k="workspace.loading" /></div>;
}
