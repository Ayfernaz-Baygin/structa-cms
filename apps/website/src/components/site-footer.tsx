import Link from "@/components/locale-link";

import { Container } from "@/components/container";
import type { Menu, SiteSettings } from "@/lib/api";

function SocialLink({ href, label }: { href: string | null; label: string }) {
  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-white/60 underline-offset-4 transition hover:text-white hover:underline"
    >
      {label}
    </a>
  );
}

export function SiteFooter({
  settings,
  menu,
}: {
  settings: SiteSettings;
  menu: Menu | null;
}) {
  const items = menu?.items ?? [];
  const year = new Date().getFullYear();
  const siteName = settings.siteName ?? "Structa";

  const hasSocial =
    settings.instagramUrl ||
    settings.facebookUrl ||
    settings.linkedinUrl ||
    settings.youtubeUrl ||
    settings.xUrl;

  return (
    <footer className="mt-28 bg-stone-900 text-white">
      <Container className="grid grid-cols-1 gap-14 py-20 sm:py-24 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-(family-name:--font-display) text-3xl font-semibold tracking-tight">
            {siteName}
          </p>
          {settings.footerText && (
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              {settings.footerText}
            </p>
          )}
          {hasSocial && (
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Bağlantılar
            </p>
            <nav className="mt-5 flex flex-col gap-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.target === "BLANK" ? "_blank" : undefined}
                  rel={
                    item.target === "BLANK" ? "noopener noreferrer" : undefined
                  }
                  className="w-fit text-sm text-white/70 underline-offset-4 transition hover:text-white hover:underline"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {(settings.email || settings.phone || settings.address) && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              İletişim
            </p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/70">
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="w-fit underline-offset-4 transition hover:text-white hover:underline"
                >
                  {settings.email}
                </a>
              )}
              {settings.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="w-fit underline-offset-4 transition hover:text-white hover:underline"
                >
                  {settings.phone}
                </a>
              )}
              {settings.address && (
                <p className="whitespace-pre-line leading-relaxed">{settings.address}</p>
              )}
            </div>
          </div>
        )}
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/40 sm:flex-row">
          <span>
            © {year} {siteName}. Tüm hakları saklıdır.
          </span>
        </Container>
      </div>
    </footer>
  );
}
