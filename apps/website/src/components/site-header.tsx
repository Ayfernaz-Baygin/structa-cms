"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Link from "@/components/locale-link";
import type { Menu, SiteSettings } from "@/lib/api";
import type { Locale } from "@/lib/locale";
import { localePath } from "@/lib/locale-path";
import { resolveMediaUrl } from "@/lib/media";

import { MobileNav } from "./mobile-nav";

function isHomeRoute(pathname: string) {
  return /^\/(tr|en)?\/?$/.test(pathname);
}

export function SiteHeader({
  settings,
  menu,
  locale,
}: {
  settings: SiteSettings;
  menu: Menu | null;
  locale: Locale;
}) {
  const pathname = usePathname();
  const floating = isHomeRoute(pathname);
  const [scrolled, setScrolled] = useState(false);

  // Homepage-only: the header starts as a transparent glass overlay on the
  // hero, then becomes a compact opaque bar once the hero has fully scrolled
  // past — tracked via the zero-height #explore marker that sits right at
  // the hero/content boundary (see page.tsx).
  useEffect(() => {
    if (!floating) {
      const updateScrolled = () => setScrolled(window.scrollY > 32);

      updateScrolled();
      window.addEventListener("scroll", updateScrolled, { passive: true });
      return () => window.removeEventListener("scroll", updateScrolled);
    }

    const target = document.getElementById("explore");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [floating]);

  const items = menu?.items ?? [];
  const logoUrl = resolveMediaUrl(settings.logoUrl);
  const siteName = settings.siteName ?? "Structa";

  if (floating) {
    return (
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-300 ${
          scrolled
            ? "border-border bg-surface/90 shadow-sm backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
            scrolled ? "h-16" : "h-24"
          }`}
        >
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={siteName}
                width={36}
                height={36}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <span
                className={`font-(family-name:--font-display) text-xl font-semibold tracking-tight transition-colors duration-300 ${
                  scrolled ? "text-foreground" : "text-white"
                }`}
              >
                {siteName}
              </span>
            )}
          </Link>

          <nav
            className={`hidden items-center transition-all duration-300 md:flex ${
              scrolled ? "gap-7" : "gap-1 rounded-full border border-white/25 bg-white/10 p-1.5 backdrop-blur-lg"
            }`}
          >
            {items.map((item) =>
              scrolled ? (
                <CompactNavItem key={item.id} item={item} locale={locale} pathname={pathname} />
              ) : (
                <FloatingNavItem key={item.id} item={item} locale={locale} pathname={pathname} />
              ),
            )}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} floating={!scrolled} />
            <div className="md:hidden">
              <MobileNav items={items} floating={!scrolled} />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b border-border bg-surface/80 shadow-sm backdrop-blur-xl transition-all duration-300 ${
        scrolled ? "bg-surface/90" : ""
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
          scrolled ? "h-16" : "h-24"
        }`}
      >
        <Link href="/" className="flex shrink-0 items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={siteName}
              width={40}
              height={40}
              className={`w-auto object-contain transition-all duration-300 ${scrolled ? "h-9" : "h-10"}`}
            />
          ) : (
            <span className={`font-(family-name:--font-display) font-semibold tracking-tight text-foreground transition-all duration-300 ${scrolled ? "text-xl" : "text-2xl"}`}>
              {siteName}
            </span>
          )}
        </Link>

        <nav
          className={`hidden items-center transition-all duration-300 md:flex ${
            scrolled
              ? "gap-7"
              : "gap-1 rounded-full border border-white/70 bg-white/45 p-1.5 shadow-sm backdrop-blur-xl"
          }`}
        >
          {items.map((item) => (
            scrolled ? (
              <CompactNavItem key={item.id} item={item} locale={locale} pathname={pathname} />
            ) : (
              <GlassNavItem key={item.id} item={item} locale={locale} pathname={pathname} />
            )
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher locale={locale} />
          <div className="md:hidden">
            <MobileNav items={items} />
          </div>
        </div>
      </div>
    </header>
  );
}

function LanguageSwitcher({
  locale,
  floating = false,
}: {
  locale: Locale;
  floating?: boolean;
}) {
  return (
    <nav
      aria-label="Language"
      className={`flex items-center rounded-full p-0.5 text-xs font-semibold ${
        floating
          ? "border border-white/25 bg-white/10 backdrop-blur-lg"
          : "border border-border"
      }`}
    >
      {(["tr", "en"] as const).map((language) => (
        <Link
          key={language}
          href={`/${language}`}
          hrefLang={language}
          aria-current={locale === language ? "true" : undefined}
          className={`rounded-full px-2.5 py-1 uppercase tracking-wide transition ${
            locale === language
              ? floating
                ? "bg-white text-stone-900"
                : "bg-foreground text-background"
              : floating
                ? "text-white/70 hover:text-white"
                : "text-muted hover:text-foreground"
          }`}
        >
          {language}
        </Link>
      ))}
    </nav>
  );
}

function GlassNavItem({
  item,
  locale,
  pathname,
}: {
  item: Menu["items"][number];
  locale: Locale;
  pathname: string;
}) {
  const hasChildren = item.children.length > 0;
  const itemPath = localePath(item.url, locale);
  const isActive = pathname === itemPath || pathname.startsWith(`${itemPath}/`);

  return (
    <div className="group relative">
      <Link
        href={item.url}
        target={item.target === "BLANK" ? "_blank" : undefined}
        rel={item.target === "BLANK" ? "noopener noreferrer" : undefined}
        className={`flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${
          isActive
            ? "bg-white/90 text-foreground shadow-sm"
            : "text-foreground/65 hover:bg-white/60 hover:text-foreground"
        }`}
      >
        {item.label}
        {hasChildren && (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 opacity-60">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </Link>

      {hasChildren && (
        <div className="invisible absolute left-1/2 top-full z-10 min-w-52 -translate-x-1/2 translate-y-2 rounded-xl border border-border bg-surface p-2 opacity-0 shadow-xl shadow-black/6 transition duration-200 group-hover:visible group-hover:translate-y-3 group-hover:opacity-100">
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={child.url}
              target={child.target === "BLANK" ? "_blank" : undefined}
              rel={child.target === "BLANK" ? "noopener noreferrer" : undefined}
              className="block rounded-lg px-3 py-2.5 text-sm text-foreground/75 transition hover:bg-black/3 hover:text-foreground"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FloatingNavItem({
  item,
  locale,
  pathname,
}: {
  item: Menu["items"][number];
  locale: Locale;
  pathname: string;
}) {
  const hasChildren = item.children.length > 0;
  const isActive = localePath(item.url, locale) === pathname;

  return (
    <div className="group relative">
      <Link
        href={item.url}
        target={item.target === "BLANK" ? "_blank" : undefined}
        rel={item.target === "BLANK" ? "noopener noreferrer" : undefined}
        className={`flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${
          isActive ? "bg-white/20 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
        }`}
      >
        {item.label}
        {hasChildren && (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 opacity-70">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </Link>

      {hasChildren && (
        <div className="invisible absolute left-1/2 top-full z-10 min-w-52 -translate-x-1/2 translate-y-3 rounded-xl border border-white/40 bg-white/95 p-2 opacity-0 shadow-xl backdrop-blur-xl transition duration-200 group-hover:visible group-hover:translate-y-4 group-hover:opacity-100">
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={child.url}
              target={child.target === "BLANK" ? "_blank" : undefined}
              rel={child.target === "BLANK" ? "noopener noreferrer" : undefined}
              className="block rounded-lg px-3 py-2.5 text-sm text-foreground/80 transition hover:bg-black/5 hover:text-foreground"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** Compact dark-on-light navigation used after the header has collapsed. */
function CompactNavItem({
  item,
  locale,
  pathname,
}: {
  item: Menu["items"][number];
  locale: Locale;
  pathname: string;
}) {
  const hasChildren = item.children.length > 0;
  const isActive = localePath(item.url, locale) === pathname;

  return (
    <div className="group relative">
      <Link
        href={item.url}
        target={item.target === "BLANK" ? "_blank" : undefined}
        rel={item.target === "BLANK" ? "noopener noreferrer" : undefined}
        className={`flex items-center gap-1 py-2 text-[13px] font-medium uppercase tracking-[0.12em] transition ${
          isActive ? "text-foreground" : "text-foreground/70 hover:text-foreground"
        }`}
      >
        {item.label}
        {hasChildren && (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 opacity-60">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </Link>

      {hasChildren && (
        <div className="invisible absolute left-1/2 top-full z-10 min-w-52 -translate-x-1/2 translate-y-2 rounded-xl border border-border bg-surface p-2 opacity-0 shadow-xl shadow-black/6 transition duration-200 group-hover:visible group-hover:translate-y-3 group-hover:opacity-100">
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={child.url}
              target={child.target === "BLANK" ? "_blank" : undefined}
              rel={child.target === "BLANK" ? "noopener noreferrer" : undefined}
              className="block rounded-lg px-3 py-2.5 text-sm text-foreground/75 transition hover:bg-black/3 hover:text-foreground"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
