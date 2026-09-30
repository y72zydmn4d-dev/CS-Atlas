import type { MessageKey } from "@/i18n/get-message";

export type CapabilityId = "home" | "learn" | "practice" | "explore" | "library" | "progress" | "ai" | "profile" | "settings";
export type CapabilityIcon = "home" | "book" | "code" | "compass" | "folder" | "chart" | "sparkles" | "user" | "settings";

export interface Capability {
  id: CapabilityId;
  href: string;
  label: MessageKey;
  icon: CapabilityIcon;
  aliases: string[];
}

export const capabilities: Capability[] = [
  { id: "home", href: "/home", label: "navigation.home", icon: "home", aliases: [] },
  { id: "learn", href: "/learn", label: "navigation.learn", icon: "book", aliases: ["/topics", "/algorithms", "/techniques", "/domains"] },
  { id: "practice", href: "/problems", label: "navigation.practice", icon: "code", aliases: ["/practice", "/exercises"] },
  { id: "explore", href: "/explore", label: "navigation.explore", icon: "compass", aliases: ["/atlas", "/roadmaps", "/mind-maps"] },
  { id: "library", href: "/library", label: "navigation.library", icon: "folder", aliases: [] },
  { id: "progress", href: "/progress", label: "navigation.progress", icon: "chart", aliases: ["/bookmarks"] },
  { id: "ai", href: "/assistant", label: "navigation.ai", icon: "sparkles", aliases: [] },
  { id: "profile", href: "/profile", label: "navigation.profile", icon: "user", aliases: [] },
  { id: "settings", href: "/settings", label: "navigation.settings", icon: "settings", aliases: [] },
];

export function capabilityForPath(pathname: string): Capability {
  const candidates = capabilities.flatMap((capability) => [capability.href, ...capability.aliases].map((path) => ({ capability, path })));
  return candidates
    .filter(({ path }) => path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`))
    .sort((left, right) => right.path.length - left.path.length)[0]?.capability ?? capabilities[0];
}
