import { Container } from '@/components/container';
import { MediaImage } from '@/components/media-image';
import { RichText } from '@/components/rich-text';
import type { ImageTextSectionData } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

export function ImageTextSection({ data }: { data: ImageTextSectionData }) {
  const imageUrl = resolveMediaUrl(data.imageUrl);
  const imageFirst = data.imagePosition !== 'right';

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className={imageFirst ? 'lg:order-1' : 'lg:order-2'}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-stone-100">
              <MediaImage src={imageUrl} alt={data.title ?? ''} className="object-cover" />
            </div>
          </div>
          <div className={imageFirst ? 'lg:order-2' : 'lg:order-1'}>
            {data.title && (
              <h2 className="font-(family-name:--font-display) text-3xl font-semibold tracking-tight text-foreground">
                {data.title}
              </h2>
            )}
            <div className="mt-4 space-y-4 text-base leading-relaxed text-foreground/90">
              <RichText text={data.body} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
