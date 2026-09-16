import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Container } from '@/components/container';
import { MediaImage } from '@/components/media-image';
import { RichText } from '@/components/rich-text';
import { getServiceBySlug } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {};
  }

  return {
    title: service.seoTitle ?? service.title,
    description: service.seoDescription ?? service.shortDescription ?? undefined,
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const coverUrl = resolveMediaUrl(service.coverImage);

  return (
    <article>
      {coverUrl && (
        <div className="relative aspect-21/9 w-full overflow-hidden bg-stone-100">
          <MediaImage src={coverUrl} alt={service.title} priority className="object-cover" />
        </div>
      )}

      <Container className="py-20 sm:py-28">
        <h1 className="max-w-3xl font-(family-name:--font-display) text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
          {service.title}
        </h1>
        {service.shortDescription && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{service.shortDescription}</p>
        )}
        <div className="mt-12 max-w-2xl space-y-5 text-[17px] leading-[1.85] text-foreground/80">
          <RichText text={service.description} />
        </div>
      </Container>
    </article>
  );
}
