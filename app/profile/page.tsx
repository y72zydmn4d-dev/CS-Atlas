import { LocalProfile } from "@/components/profile/local-profile";
import { Message } from "@/components/locale-provider";
import { metadataForRoute } from "@/lib/routes";

export const metadata = metadataForRoute("profile");

export default function ProfilePage() {
  return <div className="page narrow"><header className="page-header"><div><p className="kicker"><Message k="profile.kicker" /></p><h1><Message k="profile.title" /></h1><p className="lede"><Message k="profile.lede" /></p></div></header><LocalProfile /></div>;
}
