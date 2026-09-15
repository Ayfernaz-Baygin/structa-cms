import Image from "next/image";
import Link from "@/components/locale-link";

import { Container } from "@/components/container";
import type { CtaSectionData } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { isSafeHref } from "@/lib/safe-href";

export function CtaSection({ data }: { data: CtaSectionData }) {
  const imageUrl = resolveMediaUrl(data.imageUrl);
  const hasButton = Boolean(data.buttonLabel) && isSafeHref(data.buttonUrl);

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-stone-900 px-6 py-16 text-center text-white sm:px-16">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt=""
              fill
              className="absolute inset-0 object-cover opacity-20"
            />
          )}
          <div className="relative flex flex-col items-center gap-6">
            <h2 className="font-(family-name:--font-display) text-3xl font-semibold tracking-tight sm:text-4xl">
              {data.title}
            </h2>
            {data.description && (
              <p className="max-w-xl text-base leading-relaxed text-white/70">
                {data.description}
              </p>
            )}
            {hasButton && (
              <Link
                href={data.buttonUrl}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-900 transition hover:opacity-90"
              >
                {data.buttonLabel}
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
