import type { Metadata } from "next";
import "./globals.css";
import "./practice.css";
import "./workspace.css";
import "./landing.css";
import { RouteShell } from "@/components/route-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";

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
        <ThemeProvider><LocaleProvider><RouteShell>{children}</RouteShell></LocaleProvider></ThemeProvider>
      </body>
    </html>
  );
}
