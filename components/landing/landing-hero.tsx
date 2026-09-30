import { Message } from "@/components/locale-provider";

export function LandingHero() {
  return <section className="landing-hero" aria-labelledby="landing-title">
    <p className="landing-eyebrow"><Message k="landing.eyebrow" /></p>
    <div className="landing-intro">
      <h1 id="landing-title"><Message k="landing.headline" /></h1>
      <p className="landing-support"><Message k="landing.support" /></p>
    </div>
  </section>;
}
