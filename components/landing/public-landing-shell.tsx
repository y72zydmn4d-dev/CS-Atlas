import type { ReactNode } from "react";
import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import { AuthPanel } from "./auth-panel";
import { CapabilityStrip } from "./capability-strip";

export function PublicLandingShell({ visual }: { visual?: ReactNode }) {
  return <div className="public-landing"><div className="landing-frame">
    <LandingHeader />
    <main id="main-content" className="landing-main">
      <LandingHero />
      <AuthPanel />
      {visual && <div className="landing-visual-region">{visual}</div>}
    </main>
    <CapabilityStrip />
    <footer className="landing-footer"><small>© {new Date().getFullYear()} CS Atlas</small></footer>
  </div></div>;
}
