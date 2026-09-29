import { HardDrive, Keyboard, Languages, MoonStar, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Message } from "@/components/locale-provider";
import { metadataForRoute } from "@/lib/routes";

export const metadata = metadataForRoute("settings");

export default function SettingsPage() {
  return <div className="page narrow"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Settings" }]} /><header className="page-header"><div><p className="kicker"><Message k="settings.kicker" /></p><h1><Message k="settings.title" /></h1><p className="lede"><Message k="settings.lede" /></p></div></header><div className="stack">
    <section className="panel"><div className="panel-header"><div style={{ display: "flex", gap: 12, alignItems: "center" }}><span className="catalog-card-icon"><Languages size={18} /></span><div><h3><Message k="language.label" /></h3><p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}><Message k="settings.languageBody" /></p></div></div><LanguageSwitcher /></div></section>
    <section className="panel"><div className="panel-header"><div style={{ display: "flex", gap: 12, alignItems: "center" }}><span className="catalog-card-icon"><MoonStar size={18} /></span><div><h3><Message k="settings.appearance" /></h3><p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}><Message k="settings.appearanceBody" /></p></div></div><span className="chip"><Message k="settings.lightDark" /></span></div></section>
    <section className="panel"><div className="panel-header"><div style={{ display: "flex", gap: 12, alignItems: "center" }}><span className="catalog-card-icon"><HardDrive size={18} /></span><div><h3><Message k="settings.persistence" /></h3><p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}><Message k="settings.persistenceBody" /></p></div></div><span className="chip"><Message k="settings.thisDevice" /></span></div></section>
    <section className="mini-grid"><div className="mini-card"><Keyboard size={18} style={{ color: "var(--accent)", marginBottom: 8 }} /><strong><Message k="settings.keyboard" /></strong><span><Message k="settings.keyboardBody" /></span></div><div className="mini-card"><ShieldCheck size={18} style={{ color: "var(--success)", marginBottom: 8 }} /><strong><Message k="settings.privacy" /></strong><span><Message k="settings.privacyBody" /></span></div></section>
  </div></div>;
}
