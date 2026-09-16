import Link from "@/components/locale-link";

import { Container } from "@/components/container";
import { MediaImage } from "@/components/media-image";
import { Reveal } from "@/components/reveal";
import type { CtaSectionData } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { isSafeHref } from "@/lib/safe-href";

export function CtaSection({ data }: { data: CtaSectionData }) {
  const imageUrl = resolveMediaUrl(data.imageUrl);
  const hasButton = Boolean(data.buttonLabel) && isSafeHref(data.buttonUrl);

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal className="relative isolate overflow-hidden rounded-2xl bg-stone-900 px-6 py-20 text-center sm:px-16 sm:py-24">
          {imageUrl && (
            <MediaImage src={imageUrl} alt="" className="absolute inset-0 object-cover opacity-25" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/40" />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
            <h2 className="font-(family-name:--font-display) text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              {data.title}
            </h2>
            {data.description && (
              <p className="max-w-xl text-base leading-relaxed text-white/70">{data.description}</p>
            )}
            {hasButton && (
              <Link
                href={data.buttonUrl}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-stone-900 transition hover:bg-white/90"
              >
                {data.buttonLabel}
              </Link>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
