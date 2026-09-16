import { Container } from '@/components/container';
import { Reveal } from '@/components/reveal';
import { RichText } from '@/components/rich-text';
import type { TextSectionData } from '@/lib/api';

export function TextSection({ data }: { data: TextSectionData }) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal className="mx-auto max-w-2xl">
          {data.title && (
            <h2 className="font-(family-name:--font-display) text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {data.title}
            </h2>
          )}
          <div className="mt-6 space-y-5 text-[17px] leading-[1.85] text-foreground/80">
            <RichText text={data.body} />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
