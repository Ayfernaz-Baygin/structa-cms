"use client";

import Image from "next/image";
import { useState } from "react";
import type { ComponentProps } from "react";

type MediaImageProps = Omit<
  ComponentProps<typeof Image>,
  "src" | "alt" | "fill" | "onError"
> & {
  src: string | null | undefined;
  alt: string;
};

/**
 * Fill-mode `next/image` with a shared placeholder for when there's no
 * source, or the upstream media 404s/fails to load — the parent must be
 * `position: relative` (every call site already wraps images that way).
 * Never lets the browser's native broken-image icon or alt text show.
 */
export function MediaImage({ src, alt, ...props }: MediaImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <MediaImagePlaceholder />;
  }

  return (
    <Image src={src} alt={alt} fill onError={() => setFailed(true)} {...props} />
  );
}

function MediaImagePlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center text-muted/50"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-10 w-10"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </div>
  );
}
