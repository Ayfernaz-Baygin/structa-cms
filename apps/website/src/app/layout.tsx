import { getLocale } from "@/lib/locale";
import { LocaleProvider } from "@/components/locale-link";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMenu, getSettings } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

// Content is CMS-driven and can change at any time — always render fresh
// from the live API rather than serving a stale statically-generated page.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => null);
  const faviconUrl = resolveMediaUrl(settings?.faviconUrl);

  return {
    title: {
      default: settings?.siteName ?? "Structa",
      template: `%s | ${settings?.siteName ?? "Structa"}`,
    },
    description: settings?.siteDescription ?? undefined,
    icons: faviconUrl ? { icon: faviconUrl } : undefined,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const settings = await getSettings();
  const [headerMenu, footerMenu] = await Promise.all([
    getMenu("HEADER"),
    getMenu("FOOTER"),
  ]);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LocaleProvider locale={locale}>
          <SiteHeader settings={settings} menu={headerMenu} locale={locale} />
          <main className="flex-1">{children}</main>
          <SiteFooter settings={settings} menu={footerMenu} />
        </LocaleProvider>
      </body>
    </html>
  );
}
