"use client";

import { Menu } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/locale-provider";
import { SubjectCurriculumSidebar, type LearnSubjectView } from "@/components/learn/subject-curriculum-sidebar";
import type { SubjectManifest } from "@/lib/domain/learn-platform";

function focusOnNextFrame(target: React.RefObject<HTMLElement | null>) {
  if (typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(() => target.current?.focus());
  else target.current?.focus();
}

export function LearnSubjectWorkspace({
  subject,
  activeLessonId,
  activeView,
  children,
  rightRail,
}: {
  subject: SubjectManifest;
  activeLessonId?: string;
  activeView?: LearnSubjectView;
  children: React.ReactNode;
  rightRail?: React.ReactNode;
}) {
  const { locale } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    focusOnNextFrame(triggerRef);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const desktop = typeof window.matchMedia === "function" ? window.matchMedia("(min-width: 901px)") : undefined;
    const closeOnDesktop = () => { if (desktop?.matches) setDrawerOpen(false); };
    window.addEventListener("keydown", handleKeyDown);
    desktop?.addEventListener("change", closeOnDesktop);
    focusOnNextFrame(closeButtonRef);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      desktop?.removeEventListener("change", closeOnDesktop);
    };
  }, [closeDrawer, drawerOpen]);

  return <div className={`learn-workspace-shell ${rightRail ? "has-rail" : ""}`}>
    <button ref={triggerRef} className="learn-curriculum-trigger button-secondary" type="button" aria-expanded={drawerOpen} aria-controls="learn-curriculum-panel" onClick={() => setDrawerOpen(true)}><Menu size={16} />{locale === "vi" ? "Chương trình" : "Curriculum"}</button>
    {drawerOpen && <button className="learn-drawer-backdrop" type="button" aria-label={locale === "vi" ? "Đóng chương trình" : "Close curriculum"} onClick={closeDrawer} />}
    <SubjectCurriculumSidebar subject={subject} activeLessonId={activeLessonId} activeView={activeView} open={drawerOpen} onClose={() => { if (drawerOpen) closeDrawer(); }} panelRef={panelRef} closeButtonRef={closeButtonRef} />
    <main className="learn-workspace-main" inert={drawerOpen}>{children}</main>
    {rightRail && <aside className="learn-workspace-rail" aria-label={locale === "vi" ? "Công cụ học" : "Learning tools"} inert={drawerOpen}>{rightRail}</aside>}
  </div>;
}
