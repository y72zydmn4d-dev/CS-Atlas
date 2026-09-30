import Link from "next/link";
import { Message } from "@/components/locale-provider";
import { capabilities } from "@/lib/capabilities";

const descriptions = { learn:"landing.learnDetail", practice:"landing.practiceDetail", explore:"landing.exploreDetail", library:"landing.libraryDetail" } as const;

export function CapabilityStrip() {
  return <nav className="landing-capability-nav" aria-labelledby="landing-capabilities-label">
    <p id="landing-capabilities-label" className="sr-only"><Message k="landing.capabilities" /></p>
    <ul className="landing-capabilities">{(["learn","practice","explore","library"] as const).map((id) => {
      const capability = capabilities.find((item) => item.id === id);
      if (!capability) throw new Error(`Missing landing capability: ${id}`);
      return <li key={id}><Link href={capability.href} prefetch={false}>
        <span className="landing-capability-title"><strong><Message k={capability.label} /></strong><span aria-hidden="true">↗</span></span>
        <span className="landing-capability-detail"><Message k={descriptions[id]} /></span>
      </Link></li>;
    })}</ul>
  </nav>;
}
