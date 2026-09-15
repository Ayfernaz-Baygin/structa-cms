import Link from 'next/link';

import type { Menu, SiteSettings } from '@/lib/api';

function SocialLink({ href, label }: { href: string | null; label: string }) {
  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white"
    >
      {label}
    </a>
  );
}

export function SiteFooter({ settings, menu }: { settings: SiteSettings; menu: Menu | null }) {
  const items = menu?.items ?? [];
  const year = new Date().getFullYear();
  const siteName = settings.siteName ?? 'Structa';

  const hasSocial =
    settings.instagramUrl ||
    settings.facebookUrl ||
    settings.linkedinUrl ||
    settings.youtubeUrl ||
    settings.xUrl;

  return (
    <footer className="mt-24 border-t border-white/10 bg-stone-900 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-(family-name:--font-display) text-xl font-semibold">{siteName}</p>
          {settings.footerText && (
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">{settings.footerText}</p>
          )}
          {hasSocial && (
            <div className="mt-5 flex flex-wrap gap-2">
              <SocialLink href={settings.instagramUrl} label="Instagram" />
              <SocialLink href={settings.facebookUrl} label="Facebook" />
              <SocialLink href={settings.linkedinUrl} label="LinkedIn" />
              <SocialLink href={settings.youtubeUrl} label="YouTube" />
              <SocialLink href={settings.xUrl} label="X" />
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/40">Bağlantılar</p>
            <nav className="mt-4 flex flex-col gap-2">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.target === 'BLANK' ? '_blank' : undefined}
                  rel={item.target === 'BLANK' ? 'noopener noreferrer' : undefined}
                  className="text-sm text-white/70 transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {(settings.email || settings.phone || settings.address) && (
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/40">İletişim</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-white/70">
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="transition hover:text-white">
                  {settings.email}
                </a>
              )}
              {settings.phone && (
                <a href={`tel:${settings.phone}`} className="transition hover:text-white">
                  {settings.phone}
                </a>
              )}
              {settings.address && <p className="whitespace-pre-line">{settings.address}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/40 sm:px-6">
        © {year} {siteName}. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
