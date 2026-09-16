import { Button } from "@/components/button";
import { Container } from "@/components/container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <h1 className="font-(family-name:--font-display) text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Aradığınız sayfa bulunamadı
      </h1>
      <p className="max-w-md text-base leading-relaxed text-muted">
        Bu sayfa kaldırılmış, taşınmış ya da hiç yayınlanmamış olabilir.
      </p>
      <Button href="/" variant="filled" className="mt-2">
        Ana Sayfaya Dön
      </Button>
    </Container>
  );
}
