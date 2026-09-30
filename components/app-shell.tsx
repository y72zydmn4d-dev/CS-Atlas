"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Braces, ChartNoAxesCombined, Compass, FolderKanban, Home, Menu, Moon, PanelLeftClose, PanelLeftOpen, Search, Settings, Sparkles, Sun, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { capabilities, capabilityForPath, type CapabilityIcon } from "@/lib/capabilities";
import { SearchDialog } from "@/components/search-dialog";
import { useTheme } from "@/components/theme-provider";
import { AmbientBackground } from "@/components/ambient-background";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/locale-provider";
import { useWorkspacePreferences } from "@/components/workspace-preferences-provider";
import { routePresentationForPath } from "@/lib/routes";

const icons: Record<CapabilityIcon, typeof Home> = {
  home: Home,
  book: BookOpen,
  code: Braces,
  compass: Compass,
  folder: FolderKanban,
  chart: ChartNoAxesCombined,
  sparkles: Sparkles,
  user: UserRound,
  settings: Settings,
};

const primaryCapabilities = capabilities.filter((capability) => capability.id !== "profile" && capability.id !== "settings");

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeNavigation = useCallback(() => { setMobileOpen(false); requestAnimationFrame(() => menuButtonRef.current?.focus()); }, []);
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const { sidebarCollapsed: collapsed, toggleSidebar } = useWorkspacePreferences();
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setMobileOpen(false); setSearchOpen(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 901px)");
    const closeOnDesktop = () => { if (wide.matches) setMobileOpen(false); };
    wide.addEventListener("change", closeOnDesktop);
    return () => wide.removeEventListener("change", closeOnDesktop);
  }, []);
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
      }
      if (event.key !== "Tab") return;
      const sidebar = document.getElementById("primary-sidebar");
      const focusable = Array.from(sidebar?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []).filter((element) => element.getClientRects().length > 0);
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", handleKeyDown); };
  }, [mobileOpen]);
  const activeCapability = capabilityForPath(pathname);
  const routePresentation = routePresentationForPath(pathname);
  return (
    <div className={cn("app-frame workspace-frame", collapsed && "sidebar-collapsed")}>
      <AmbientBackground />
      <a className="skip-link" href="#main-content">{t("navigation.skip")}</a>
      <header className="mobile-header" inert={mobileOpen}>
        <button ref={menuButtonRef} className="icon-button" onClick={() => setMobileOpen(true)} aria-label={t("navigation.open")} aria-expanded={mobileOpen} aria-controls="primary-sidebar"><Menu /></button>
        <Link className="brand compact" href="/home"><span className="brand-mark">CA</span><strong>CS Atlas</strong></Link>
        <button className="icon-button" onClick={() => setSearchOpen(true)} aria-label={t("actions.searchAtlas")}><Search /></button>
      </header>
      {mobileOpen && <button className="sidebar-scrim" onClick={closeNavigation} aria-label={t("navigation.close")} tabIndex={-1} />}
      <aside id="primary-sidebar" className={cn("sidebar", mobileOpen && "open")} role={mobileOpen ? "dialog" : undefined} aria-modal={mobileOpen || undefined} aria-label={t("navigation.explore")}>
        <div className="sidebar-top">
          <Link className="brand" href="/home" aria-label="CS Atlas" onClick={() => setMobileOpen(false)}><span className="brand-mark">CA</span><span className="brand-label"><strong>CS Atlas</strong><small>{t("app.knowledgeNavigator")}</small></span></Link>
          <button ref={closeButtonRef} className="icon-button mobile-only" onClick={() => { setMobileOpen(false); menuButtonRef.current?.focus(); }} aria-label={t("navigation.close")}><X /></button>
        </div>
        <button className="search-trigger" onClick={() => setSearchOpen(true)}><Search size={17} /><span>{t("actions.searchAtlas")}</span><kbd>⌘ K</kbd></button>
        <nav className="nav-groups" aria-label={t("navigation.explore")}>
          <div className="nav-group">
            {primaryCapabilities.map((capability) => {
              const Icon = icons[capability.icon];
              return <Link key={capability.id} href={capability.href} title={t(capability.label)} aria-label={t(capability.label)} aria-current={activeCapability.id === capability.id ? "page" : undefined} onClick={() => setMobileOpen(false)} className={cn("nav-link", activeCapability.id === capability.id && "active")}><Icon size={18} /><span>{t(capability.label)}</span></Link>;
            })}
          </div>
        </nav>
        <div className="sidebar-bottom">
          <Link className={cn("nav-link", activeCapability.id === "profile" && "active")} href="/profile" title={t("navigation.profile")} aria-label={t("navigation.profile")} onClick={() => setMobileOpen(false)}><UserRound size={18} /><span>{t("navigation.profile")}</span></Link>
          <Link className={cn("nav-link", activeCapability.id === "settings" && "active")} href="/settings" title={t("navigation.settings")} aria-label={t("navigation.settings")} onClick={() => setMobileOpen(false)}><Settings size={18} /><span>{t("navigation.settings")}</span></Link>
          <button className="nav-link sidebar-toggle" onClick={toggleSidebar} title={t(collapsed ? "workspace.expand" : "workspace.collapse")} aria-label={t(collapsed ? "workspace.expand" : "workspace.collapse")} aria-expanded={!collapsed}>{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}<span>{t("workspace.collapse")}</span></button>
        </div>
      </aside>
      <div className="workspace-body" inert={mobileOpen}>
        <header className="workspace-topbar">
          <span className="workspace-context">CS Atlas <span>/</span> {routePresentation ? t(routePresentation.label) : t(activeCapability.label)}</span>
          <button className="command-button" onClick={() => setSearchOpen(true)}><Search size={16} /><span>{t("actions.searchAtlas")}</span><kbd>⌘ / Ctrl K</kbd></button>
          <div className="workspace-tools"><LanguageSwitcher /><button className="icon-button" onClick={toggle} aria-label={t(theme === "dark" ? "theme.light" : "theme.dark")} title={t(theme === "dark" ? "theme.light" : "theme.dark")}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button></div>
        </header>
        <main id="main-content" className="main-content"><div key={pathname} className="route-stage">{children}</div></main>
      </div>
      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </div>
  );
}
