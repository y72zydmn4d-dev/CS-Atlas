"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const query = "(min-width: 1280px) and (prefers-reduced-motion: no-preference)";
function subscribe(callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
export function useLandingMotion(blocked: boolean) {
  const eligible = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [element, setElement] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!eligible) return;
    const onVisibility = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false));
    if (element) observer?.observe(element);
    return () => { document.removeEventListener("visibilitychange", onVisibility); observer?.disconnect(); };
  }, [eligible, element]);
  return { setElement, eligible, enabled, setEnabled, paused: blocked || !eligible || !visible || !documentVisible };
}
