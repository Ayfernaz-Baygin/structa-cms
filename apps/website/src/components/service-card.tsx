import Link from "@/components/locale-link";
import { MediaImage } from "@/components/media-image";

import type { Service } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";

export function ServiceCard({ service, index }: { service: Service; index?: number }) {
  const coverUrl = resolveMediaUrl(service.coverImage);

  return (
    <Link href={`/services/${service.slug}`} className="group flex flex-col">
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-xl bg-stone-100">
        <MediaImage
          src={coverUrl}
          alt={service.title}
          className="object-cover transition duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <div className="mt-6 flex items-start justify-between gap-4 border-t border-border pt-5">
        <div className="min-w-0">
          {typeof index === "number" && (
            <span className="text-xs font-semibold tracking-wide text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          <h3 className="mt-1.5 font-(family-name:--font-display) text-xl font-semibold text-foreground">
            {service.title}
          </h3>
          {service.shortDescription && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
              {service.shortDescription}
            </p>
          )}
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="mt-1.5 h-5 w-5 shrink-0 text-muted transition duration-300 group-hover:translate-x-1 group-hover:text-accent"
        >
          <path d="M7 17 17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}
