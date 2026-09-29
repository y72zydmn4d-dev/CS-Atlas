import { canonicalizeUrl } from "@/lib/library/validation";
import type { LinkPreviewMetadata } from "@/lib/library/types";

export interface LinkPreviewResult { preview: LinkPreviewMetadata; errorCode?: string }
export interface LinkPreviewService { fetch(url: string): Promise<LinkPreviewResult> }

export function isPublicIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b, c] = parts;
  return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0 || (b === 0 && c === 2))) ||
    (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113));
}

/** Conservative: IPv6 is refused until the fetcher can safely classify every special range. */
export function assertSafePreviewUrl(value: string): URL {
  const canonical = canonicalizeUrl(value);
  if (!canonical) throw new Error("invalid-url");
  const url = new URL(canonical);
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (url.username || url.password || (url.port && url.port !== "80" && url.port !== "443") ||
    !host.includes(".") || host === "localhost" || /\.(localhost|local|internal|lan|home|test|invalid)$/.test(host) ||
    host.includes(":") || (/^\d+(\.\d+){3}$/.test(host) && !isPublicIpv4(host))) throw new Error("unsafe-host");
  return url;
}

export function getProviderPreview(value: string): Partial<LinkPreviewMetadata> {
  let url: URL;
  try { url = assertSafePreviewUrl(value); } catch { return {}; }
  const host = url.hostname.toLowerCase();
  if (host === "youtu.be" || host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
    const id = host === "youtu.be" ? url.pathname.slice(1) : url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/") ? url.pathname.split("/")[2] : null;
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return { provider: "youtube", providerLabel: "YouTube", siteName: "YouTube", imageUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
    if (url.searchParams.has("list") && /^[a-zA-Z0-9_-]+$/.test(url.searchParams.get("list") ?? "")) return { provider: "youtube", providerLabel: "YouTube", siteName: "YouTube" };
  }
  if (host === "github.com" || host === "www.github.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) return { provider: "github", providerLabel: `${parts[0]}/${parts[1]}`, siteName: "GitHub" };
  }
  return { provider: "website", siteName: host.replace(/^www\./, "") };
}

function decodeHtml(value: string): string {
  const named: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#")) { const point = entity[1]?.toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10); return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match; }
    return named[entity.toLowerCase()] ?? match;
  }).replace(/\s+/g, " ").trim();
}

function parseAttributes(tag: string): Map<string, string> {
  const attrs = new Map<string, string>();
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) attrs.set(match[1].toLowerCase(), decodeHtml(match[2] ?? match[3] ?? match[4]));
  return attrs;
}

export function parseHtmlPreview(html: string, pageUrl: string): Partial<LinkPreviewMetadata> {
  const head = html.split(/<\/head\s*>/i)[0].slice(0, 512_000).replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  const metas = new Map<string, string>();
  for (const tag of head.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = parseAttributes(tag);
    const key = (attrs.get("property") ?? attrs.get("name"))?.toLowerCase();
    if (key && attrs.get("content") && !metas.has(key)) metas.set(key, attrs.get("content")!);
  }
  const resolveImage = (value?: string) => {
    if (!value) return undefined;
    try { return assertSafePreviewUrl(new URL(value, pageUrl).toString()).toString(); } catch { return undefined; }
  };
  const titleTag = head.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
  let faviconHref: string | undefined;
  let rawCanonical: string | undefined;
  for (const tag of head.match(/<link\b[^>]*>/gi) ?? []) {
    const attrs = parseAttributes(tag);
    const rel = attrs.get("rel")?.toLowerCase().split(/\s+/) ?? [];
    if (!faviconHref && rel.includes("icon")) faviconHref = attrs.get("href");
    if (!rawCanonical && rel.includes("canonical")) rawCanonical = attrs.get("href");
  }
  let canonicalUrl: string | undefined;
  try { if (rawCanonical) canonicalUrl = assertSafePreviewUrl(new URL(rawCanonical, pageUrl).toString()).toString(); } catch { /* keep original */ }
  return {
    title: (metas.get("og:title") ?? metas.get("twitter:title") ?? (titleTag ? decodeHtml(titleTag[1]) : undefined))?.slice(0, 300),
    description: (metas.get("og:description") ?? metas.get("twitter:description") ?? metas.get("description"))?.slice(0, 1_000),
    siteName: metas.get("og:site_name")?.slice(0, 120),
    imageUrl: resolveImage(metas.get("og:image")) ?? resolveImage(metas.get("twitter:image")),
    faviconUrl: resolveImage(faviconHref),
    author: (metas.get("article:author") ?? metas.get("author"))?.slice(0, 200),
    publishedAt: metas.get("article:published_time")?.slice(0, 100),
    canonicalUrl,
  };
}

export function mergePreview(manual: Partial<LinkPreviewMetadata>, fetched: Partial<LinkPreviewMetadata>, provider: Partial<LinkPreviewMetadata>): LinkPreviewMetadata {
  const choose = (key: Exclude<keyof LinkPreviewMetadata, "status" | "suppressImage">) => manual[key] || fetched[key] || provider[key];
  return {
    status: manual.status === "manual" ? "manual" : fetched.title || fetched.imageUrl || fetched.description ? "ready" : "partial",
    title: choose("title"), description: choose("description"), siteName: choose("siteName"),
    imageUrl: choose("imageUrl"), faviconUrl: choose("faviconUrl"), author: choose("author"),
    manualImageUrl: manual.suppressImage ? undefined : manual.imageUrl ?? fetched.manualImageUrl,
    suppressImage: manual.suppressImage,
    publishedAt: choose("publishedAt"), canonicalUrl: choose("canonicalUrl"),
    provider: provider.provider, providerLabel: provider.providerLabel,
    fetchedAt: fetched.fetchedAt,
  };
}

export class LocalLinkPreviewService implements LinkPreviewService {
  async fetch(url: string): Promise<LinkPreviewResult> {
    assertSafePreviewUrl(url);
    const response = await fetch("/api/library/link-preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
    const data = await response.json() as LinkPreviewResult;
    if (!response.ok) throw new Error(data.errorCode ?? "preview-failed");
    return data;
  }
}

export const linkPreviewService: LinkPreviewService = new LocalLinkPreviewService();
