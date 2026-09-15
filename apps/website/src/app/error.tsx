"use client";

import Link from "@/components/locale-link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">
        Bir şeyler ters gitti
      </p>
      <h1 className="font-(family-name:--font-display) text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        İçerik şu anda yüklenemiyor
      </h1>
      <p className="text-base text-muted">
        Sunucuya ulaşırken bir sorun oluştu. Lütfen birkaç saniye sonra tekrar
        deneyin.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
        >
          Tekrar Dene
        </button>
        <Link
          href="/"
          className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-black/[.03]"
        >
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
