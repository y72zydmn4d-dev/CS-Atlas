import type { Metadata } from "next";
import "./globals.css";
import "./practice.css";
import "./workspace.css";
import { AppShell } from "@/components/app-shell";
import { AtlasProvider } from "@/components/atlas-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { SelectionTranslator } from "@/components/selection-translator";
import { WorkspacePreferencesProvider } from "@/components/workspace-preferences-provider";

export const metadata: Metadata = {
  title: { default: "CS Atlas", template: "%s · CS Atlas" },
  description: "An interactive knowledge atlas for computer science and artificial intelligence.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" />
      </head>
      <body>
        <ThemeProvider><LocaleProvider><WorkspacePreferencesProvider><AtlasProvider><AppShell>{children}</AppShell><SelectionTranslator /></AtlasProvider></WorkspacePreferencesProvider></LocaleProvider></ThemeProvider>
      </body>
    </html>
  );
}
