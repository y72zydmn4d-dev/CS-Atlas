import type { Metadata } from "next";
import type { CapabilityId } from "@/lib/capabilities";
import type { MessageKey } from "@/i18n/get-message";

export type RouteId = "home" | "learn" | "exercises" | "problems" | "practice" | "explore" | "atlas" | "roadmaps" | "mindMaps" | "library" | "libraryImport" | "progress" | "bookmarks" | "assistant" | "profile" | "settings" | "domains" | "algorithms" | "techniques" | "projects" | "search";

export interface RoutePresentation {
  id: RouteId;
  path: string;
  capability: CapabilityId;
  label: MessageKey;
  title: string;
  description?: string;
}

export const routePresentations: RoutePresentation[] = [
  { id: "home", path: "/", capability: "home", label: "navigation.home", title: "CS Atlas" },
  { id: "learn", path: "/learn", capability: "learn", label: "navigation.learn", title: "Learn", description: "Structured CS Atlas lessons connected to canonical concepts." },
  { id: "exercises", path: "/exercises", capability: "practice", label: "exercise.title", title: "Exercises", description: "Short exercises connected to CS Atlas lessons and concepts." },
  { id: "problems", path: "/problems", capability: "practice", label: "problems.title", title: "Problems", description: "CS Atlas programming problem library." },
  { id: "practice", path: "/practice", capability: "practice", label: "navigation.practice", title: "Practice & Judge", description: "Solve connected CS and ML problems with local public-test feedback." },
  { id: "explore", path: "/explore", capability: "explore", label: "navigation.explore", title: "Explore", description: "Explore CS Atlas through roadmaps, mind maps, and the knowledge graph." },
  { id: "atlas", path: "/atlas", capability: "explore", label: "explore.atlas", title: "Knowledge Atlas" },
  { id: "roadmaps", path: "/roadmaps", capability: "explore", label: "navigation.roadmaps", title: "Roadmaps" },
  { id: "mindMaps", path: "/mind-maps", capability: "explore", label: "navigation.mindMaps", title: "Mind Maps" },
  { id: "library", path: "/library", capability: "library", label: "navigation.library", title: "Library", description: "Local-first learning documents connected to CS Atlas." },
  { id: "libraryImport", path: "/library/import", capability: "library", label: "library.importTitle", title: "Add to Library" },
  { id: "progress", path: "/progress", capability: "progress", label: "navigation.progress", title: "Progress" },
  { id: "bookmarks", path: "/bookmarks", capability: "progress", label: "navigation.bookmarks", title: "Bookmarks" },
  { id: "assistant", path: "/assistant", capability: "ai", label: "navigation.assistant", title: "AI Assistant" },
  { id: "profile", path: "/profile", capability: "profile", label: "navigation.profile", title: "Profile", description: "Private local CS Atlas learning profile." },
  { id: "settings", path: "/settings", capability: "settings", label: "navigation.settings", title: "Settings" },
  { id: "domains", path: "/domains", capability: "learn", label: "navigation.domains", title: "Domains" },
  { id: "algorithms", path: "/algorithms", capability: "learn", label: "navigation.algorithms", title: "Algorithm Encyclopedia" },
  { id: "techniques", path: "/techniques", capability: "learn", label: "navigation.techniques", title: "Techniques" },
  { id: "projects", path: "/projects", capability: "learn", label: "navigation.projects", title: "Projects" },
  { id: "search", path: "/search", capability: "home", label: "actions.searchAtlas", title: "Search" },
];

export function routePresentation(id: RouteId) {
  const route = routePresentations.find((item) => item.id === id);
  if (!route) throw new Error(`Unknown route presentation: ${id}`);
  return route;
}

export function routePresentationForPath(pathname: string) {
  return routePresentations
    .filter((route) => route.path === "/" ? pathname === "/" : pathname === route.path || pathname.startsWith(`${route.path}/`))
    .sort((left, right) => right.path.length - left.path.length)[0] ?? null;
}

export function metadataForRoute(id: RouteId): Metadata {
  const route = routePresentation(id);
  return { title: route.title, description: route.description };
}

const breadcrumbAliases: Record<string, MessageKey> = {
  Home: "navigation.home", Domains: "navigation.domains", Algorithms: "navigation.algorithms", Techniques: "navigation.techniques", Projects: "navigation.projects", Syllabus: "common.syllabus", Roadmap: "common.roadmap", Roadmaps: "navigation.roadmaps", "Mind Maps": "navigation.mindMaps", "Mind Map": "common.mindMap", "Mind map": "common.mindMap", Library: "navigation.library", Import: "library.importTitle", Settings: "navigation.settings", "AI Assistant": "navigation.assistant",
};

export function breadcrumbMessageKey(label: string) {
  return breadcrumbAliases[label];
}
