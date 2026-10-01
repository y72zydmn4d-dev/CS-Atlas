"use client";

import type { ComponentProps } from "react";
import { useStudioDraft } from "@/components/studio/studio-draft-session";

/** Guarded document links; modified clicks keep the current draft in this tab. */
export function StudioLink({ href, onClick, ...props }: Omit<ComponentProps<"a">, "href"> & { href: string }) {
  const { requestNavigation } = useStudioDraft();
  return <a {...props} href={href} onClick={(event) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || props.target === "_blank" || props.download !== undefined) return;
    const target = new URL(href, window.location.href);
    const current = new URL(window.location.href);
    if (target.pathname === current.pathname && target.search === current.search) return;
    if (requestNavigation(href)) event.preventDefault();
  }} />;
}
