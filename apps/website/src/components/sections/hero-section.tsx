import Image from "next/image";
import Link from "@/components/locale-link";

import type { HeroSectionData } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { isSafeHref } from "@/lib/safe-href";

export function HeroSection({ data }: { data: HeroSectionData }) {
  const imageUrl = resolveMediaUrl(data.imageUrl);
  const hasCta = Boolean(data.ctaLabel) && isSafeHref(data.ctaUrl);

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 sm:py-28">
        <h1 className="max-w-3xl font-(family-name:--font-display) text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          {data.title}
        </h1>
        {data.subtitle && (
          <p className="max-w-2xl text-lg leading-relaxed text-muted">
            {data.subtitle}
          </p>
        )}

        {imageUrl && (
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-stone-100">
            <Image
              src={imageUrl}
              alt={data.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        {hasCta && (
          <Link
            href={data.ctaUrl!}
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
          >
            {data.ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
