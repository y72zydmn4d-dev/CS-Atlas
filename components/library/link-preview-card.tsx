"use client";
/* eslint-disable @next/next/no-img-element -- User-saved remote domains cannot be enumerated safely for Next's image optimizer. */

import { ExternalLink, Globe2, Link2 } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/locale-provider";
import { assertSafePreviewUrl, getProviderPreview } from "@/lib/library/link-preview";
import type { LibraryItem } from "@/lib/library/types";

function imageSource(value?: string): string | undefined {
  if (!value) return undefined;
  try { return assertSafePreviewUrl(value).toString(); } catch { return undefined; }
}

export function LinkPreviewCard({ item, compact = false }: { item: LibraryItem; compact?: boolean }) {
  const { t, locale } = useI18n();
  const [imageFailure, setImageFailure] = useState<string | null>(null);
  const [faviconFailed, setFaviconFailed] = useState(false);
  const provider = getProviderPreview(item.url ?? "");
  const preview = item.linkPreview;
  const image = preview?.suppressImage ? undefined : imageSource(preview?.imageUrl ?? provider.imageUrl);
  const imageFailed = imageFailure === image;
  const favicon = imageSource(preview?.faviconUrl);
  const hostname = item.url ? new URL(item.url).hostname.replace(/^www\./, "") : "";
  const site = preview?.siteName || item.sourceName || provider.siteName || hostname;
  const title = item.title || preview?.title || hostname;
  const description = item.description || preview?.description;
  const isLoading = preview?.status === "loading";
  return <div className={`rich-link-preview${compact ? " compact" : ""}`}>
    <div className={`rich-link-image${image && !imageFailed ? " has-image" : ""}`}>
      {image && !imageFailed ? /* Remote, user-saved domains cannot use a wildcard Next image optimizer. */ <img src={image} alt={t("library.previewImageAlt", { title })} loading="lazy" referrerPolicy="no-referrer" onError={() => setImageFailure(image)} /> : <div className="rich-link-fallback"><Globe2 aria-hidden="true" /><span>{site}</span><small>{imageFailed ? t("library.imageUnavailable") : isLoading ? t("library.previewLoading") : t("library.noImagePreview")}</small></div>}
    </div>
    <div className="rich-link-copy"><div className="rich-link-site">{favicon && !faviconFailed ? /* Arbitrary favicons are loaded directly with no referrer. */ <img src={favicon} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFaviconFailed(true)} /> : <Link2 aria-hidden="true" size={16} />}<span>{site}</span>{provider.providerLabel && provider.providerLabel !== site && <span className="chip">{provider.providerLabel}</span>}</div>
      {!compact && <><h2>{title}</h2>{description && <p>{description}</p>}<span className="rich-link-domain">{hostname}</span>{preview?.publishedAt && !Number.isNaN(Date.parse(preview.publishedAt)) && <time dateTime={preview.publishedAt} className="rich-link-domain">{t("library.publishedAt", { date: new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { dateStyle: "medium" }).format(new Date(preview.publishedAt)) })}</time>}</>}
      {!compact && <><a className="rich-link-url" href={item.url} target="_blank" rel="noopener noreferrer">{item.url}<ExternalLink size={14} aria-hidden="true" /></a><p className="rich-link-status" aria-live="polite">{preview?.status === "failed" ? t("library.previewUnavailable") : preview?.status === "manual" ? t("library.previewManual") : preview?.status === "ready" ? t("library.previewReady") : t("library.previewPartial")}</p></>}
    </div>
  </div>;
}
