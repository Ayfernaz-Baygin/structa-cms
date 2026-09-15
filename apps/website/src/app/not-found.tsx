import Link from "@/components/locale-link";

import { Container } from "@/components/container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">
        404
      </p>
      <h1 className="font-(family-name:--font-display) text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Aradığınız sayfa bulunamadı
      </h1>
      <p className="max-w-md text-base text-muted">
        Bu sayfa kaldırılmış, taşınmış ya da hiç yayınlanmamış olabilir.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
      >
        Ana Sayfaya Dön
      </Link>
    </Container>
  );
}
