import Link from "next/link";
import { Message } from "@/components/locale-provider";

export default function LandingPage() {
  return <main id="main-content" className="page"><h1>CS Atlas</h1><Link href="/home" prefetch={false}><Message k="navigation.home" /></Link></main>;
}
