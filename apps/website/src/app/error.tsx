"use client";

import { useEffect } from "react";

import { Button } from "@/components/button";

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
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-5 px-4 py-24 text-center">
      <h1 className="font-(family-name:--font-display) text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        İçerik şu anda yüklenemiyor
      </h1>
      <p className="text-base leading-relaxed text-muted">
        Sunucuya ulaşırken bir sorun oluştu. Lütfen birkaç saniye sonra tekrar
        deneyin.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-sm font-semibold tracking-wide text-accent-foreground transition duration-300 hover:bg-accent-strong"
        >
          Tekrar Dene
        </button>
        <Button href="/" variant="outline">
          Ana Sayfa
        </Button>
      </div>
    </div>
  );
}
