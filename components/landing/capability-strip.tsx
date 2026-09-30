import { Message } from "@/components/locale-provider";

export function CapabilityStrip() {
  return <ul className="landing-capabilities">
    <li><strong><Message k="navigation.learn" /></strong><span><Message k="landing.learnDetail" /></span></li>
    <li><strong><Message k="navigation.practice" /></strong><span><Message k="landing.practiceDetail" /></span></li>
    <li><strong><Message k="navigation.explore" /></strong><span><Message k="landing.exploreDetail" /></span></li>
    <li><strong><Message k="navigation.library" /></strong><span><Message k="landing.libraryDetail" /></span></li>
  </ul>;
}
