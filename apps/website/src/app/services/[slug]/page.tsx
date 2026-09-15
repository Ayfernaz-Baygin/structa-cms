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
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-stone-100">
          <MediaImage src={coverUrl} alt={service.title} priority className="object-cover" />
        </div>
      )}

      <Container className="py-16 sm:py-24">
        <h1 className="font-(family-name:--font-display) text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {service.title}
        </h1>
        {service.shortDescription && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{service.shortDescription}</p>
        )}
        <div className="mt-10 max-w-2xl space-y-4 text-base leading-relaxed text-foreground/90">
          <RichText text={service.description} />
        </div>
      </Container>
    </article>
  );
}
