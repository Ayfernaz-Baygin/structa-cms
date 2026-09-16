import { Container } from '@/components/container';
import { MediaImage } from '@/components/media-image';
import { Reveal } from '@/components/reveal';
import { RichText } from '@/components/rich-text';
import type { ImageTextSectionData } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

export function ImageTextSection({ data }: { data: ImageTextSectionData }) {
  const imageUrl = resolveMediaUrl(data.imageUrl);
  const imageFirst = data.imagePosition !== 'right';

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className={imageFirst ? 'lg:order-1' : 'lg:order-2'}>
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-stone-100">
              <MediaImage src={imageUrl} alt={data.title ?? ''} className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={120} className={imageFirst ? 'lg:order-2' : 'lg:order-1'}>
            {data.title && (
              <h2 className="font-(family-name:--font-display) text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {data.title}
              </h2>
            )}
            <div className="mt-6 space-y-5 text-[17px] leading-[1.85] text-foreground/80">
              <RichText text={data.body} />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
