import { Container } from '@/components/container';
import { RichText } from '@/components/rich-text';
import type { TextSectionData } from '@/lib/api';

export function TextSection({ data }: { data: TextSectionData }) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl">
          {data.title && (
            <h2 className="font-(family-name:--font-display) text-3xl font-semibold tracking-tight text-foreground">
              {data.title}
            </h2>
          )}
          <div className="mt-4 space-y-4 text-base leading-relaxed text-foreground/90">
            <RichText text={data.body} />
          </div>
        </div>
      </Container>
    </section>
  );
}
