import Link from "@/components/locale-link";
import { MediaImage } from "@/components/media-image";

import type { Service } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";

export function ServiceCard({ service }: { service: Service }) {
  const coverUrl = resolveMediaUrl(service.coverImage);

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:shadow-lg hover:shadow-black/5"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <MediaImage
          src={coverUrl}
          alt={service.title}
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-(family-name:--font-display) text-lg font-semibold text-foreground">
          {service.title}
        </h3>
        {service.shortDescription && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {service.shortDescription}
          </p>
        )}
        <span className="mt-auto pt-2 text-sm font-medium text-accent">
          Detayları Gör →
        </span>
      </div>
    </Link>
  );
}
