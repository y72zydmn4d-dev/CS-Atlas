import "server-only";

import { lookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { LIBRARY_CONFIG } from "@/lib/library/config";
import { assertSafePreviewUrl, getProviderPreview, isPublicIpv4, mergePreview, parseHtmlPreview } from "@/lib/library/link-preview";
import type { LinkPreviewResult } from "@/lib/library/link-preview";

interface HtmlResponse { status: number; location?: string; contentType?: string; html: string }
type HtmlLoader = (url: URL) => Promise<HtmlResponse>;

export async function resolvePublicIpv4(hostname: string): Promise<string> {
  if (/^\d+(\.\d+){3}$/.test(hostname)) return hostname;
  const addresses = await lookup(hostname, { all: true, family: 4, verbatim: true });
  if (!addresses.length || addresses.some((entry) => !isPublicIpv4(entry.address))) throw new Error("unsafe-address");
  return addresses[0].address;
}

/** Connect to the checked IP, while preserving the original Host and TLS SNI. */
export async function loadRemoteHtml(url: URL): Promise<HtmlResponse> {
  const address = await resolvePublicIpv4(url.hostname);
  if (!isPublicIpv4(address)) throw new Error("unsafe-address");
  return new Promise((resolve, reject) => {
    const transport = url.protocol === "https:" ? https : http;
    let settled = false;
    const timer: { current?: ReturnType<typeof setTimeout> } = {};
    const finish = (error?: Error, value?: HtmlResponse) => { if (settled) return; settled = true; if (timer.current) clearTimeout(timer.current); if (error) reject(error); else resolve(value!); };
    const request = transport.request({ hostname: address, port: url.port || (url.protocol === "https:" ? 443 : 80), path: `${url.pathname}${url.search}`, method: "GET", servername: url.hostname, headers: { Host: url.host, Accept: "text/html,application/xhtml+xml", "User-Agent": "CSAtlasLinkPreview/1.0" }, timeout: LIBRARY_CONFIG.previewTimeoutMs, maxHeaderSize: 16_384 }, (response) => {
      const status = response.statusCode ?? 0;
      const location = response.headers.location;
      const contentType = response.headers["content-type"];
      if (status >= 300 && status < 400) { response.destroy(); finish(undefined, { status, location, html: "" }); return; }
      if (status < 200 || status >= 300) { response.destroy(); finish(new Error("http-error")); return; }
      if (!/^(text\/html|application\/xhtml\+xml)\b/i.test(contentType ?? "")) { response.destroy(); finish(new Error("not-html")); return; }
      const length = Number(response.headers["content-length"] ?? 0);
      if (length > LIBRARY_CONFIG.previewHtmlBytes) { response.destroy(); finish(new Error("response-too-large")); return; }
      const chunks: Buffer[] = []; let size = 0;
      response.on("data", (chunk: Buffer) => { size += chunk.length; if (size > LIBRARY_CONFIG.previewHtmlBytes) { response.destroy(); finish(new Error("response-too-large")); return; } chunks.push(chunk); });
      response.on("end", () => finish(undefined, { status, contentType, html: Buffer.concat(chunks).toString("utf8") }));
      response.on("error", (error) => finish(error));
    });
    request.on("timeout", () => request.destroy(new Error("timeout")));
    request.on("error", (error) => finish(error));
    timer.current = setTimeout(() => request.destroy(new Error("timeout")), LIBRARY_CONFIG.previewTimeoutMs);
    request.end();
  });
}

export async function fetchLinkPreview(url: string, loader: HtmlLoader = loadRemoteHtml): Promise<LinkPreviewResult> {
  let current = assertSafePreviewUrl(url);
  const provider = getProviderPreview(current.toString());
  const visited = new Set<string>();
  for (let redirects = 0; redirects <= LIBRARY_CONFIG.previewMaxRedirects; redirects++) {
    if (visited.has(current.toString())) throw new Error("redirect-loop");
    visited.add(current.toString());
    const response = await loader(current);
    if (response.status >= 300 && response.status < 400) {
      if (!response.location || redirects === LIBRARY_CONFIG.previewMaxRedirects) throw new Error("too-many-redirects");
      current = assertSafePreviewUrl(new URL(response.location, current).toString());
      continue;
    }
    if (response.status !== 200) throw new Error("http-error");
    const extracted = parseHtmlPreview(response.html, current.toString());
    return { preview: mergePreview({}, { ...extracted, fetchedAt: new Date().toISOString() }, provider) };
  }
  throw new Error("too-many-redirects");
}
