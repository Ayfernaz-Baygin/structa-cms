import Link from 'next/link';
import Image from 'next/image';

import type { Menu, SiteSettings } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

import { MobileNav } from './mobile-nav';

export function SiteHeader({ settings, menu }: { settings: SiteSettings; menu: Menu | null }) {
  const items = menu?.items ?? [];
  const logoUrl = resolveMediaUrl(settings.logoUrl);
  const siteName = settings.siteName ?? 'Structa';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={siteName}
              width={40}
              height={40}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <span className="font-(family-name:--font-display) text-xl font-semibold tracking-tight text-foreground">
              {siteName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <DesktopNavItem key={item.id} item={item} />
          ))}
        </nav>

        <div className="md:hidden">
          <MobileNav items={items} />
        </div>
      </div>
    </header>
  );
}

function DesktopNavItem({ item }: { item: Menu['items'][number] }) {
  const hasChildren = item.children.length > 0;

  return (
    <div className="group relative">
      <Link
        href={item.url}
        target={item.target === 'BLANK' ? '_blank' : undefined}
        rel={item.target === 'BLANK' ? 'noopener noreferrer' : undefined}
        className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-black/[.03] hover:text-foreground"
      >
        {item.label}
        {hasChildren && (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 opacity-60">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </Link>

      {hasChildren && (
        <div className="invisible absolute left-0 top-full z-10 min-w-48 translate-y-1 rounded-xl border border-border bg-surface p-1.5 opacity-0 shadow-lg shadow-black/5 transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={child.url}
              target={child.target === 'BLANK' ? '_blank' : undefined}
              rel={child.target === 'BLANK' ? 'noopener noreferrer' : undefined}
              className="block rounded-lg px-3 py-2 text-sm text-foreground/80 transition hover:bg-black/[.04] hover:text-foreground"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
