import Link from "@/components/locale-link";
import { MediaImage } from "@/components/media-image";

import type { HeroSectionData } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { isSafeHref } from "@/lib/safe-href";

export function HeroSection({ data }: { data: HeroSectionData }) {
  const imageUrl = resolveMediaUrl(data.imageUrl);
  const hasCta = Boolean(data.ctaLabel) && isSafeHref(data.ctaUrl);

  if (imageUrl) {
    return (
      <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-stone-900 sm:min-h-[82vh]">
        <MediaImage src={imageUrl} alt={data.title} priority className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/10" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pb-24 lg:px-8">
          <h1 className="max-w-3xl font-(family-name:--font-display) text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-7xl">
            {data.title}
          </h1>
          {data.subtitle && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{data.subtitle}</p>
          )}
          {hasCta && (
            <Link
              href={data.ctaUrl!}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-stone-900 transition hover:bg-white/90"
            >
              {data.ctaLabel}
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <h1 className="max-w-3xl font-(family-name:--font-display) text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-7xl">
          {data.title}
        </h1>
        {data.subtitle && (
          <p className="max-w-xl text-lg leading-relaxed text-muted">{data.subtitle}</p>
        )}
        {hasCta && (
          <Link
            href={data.ctaUrl!}
            className="mt-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-strong"
          >
            {data.ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
