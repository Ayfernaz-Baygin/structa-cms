import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Container } from '@/components/container';
import { MediaImage } from '@/components/media-image';
import { RichText } from '@/components/rich-text';
import { getProjectBySlug } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {};
  }

  return {
    title: project.seoTitle ?? project.title,
    description: project.seoDescription ?? project.shortDescription ?? undefined,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const coverUrl = resolveMediaUrl(project.coverImage);
  const facts = [
    { label: 'Müşteri', value: project.clientName },
    { label: 'Konum', value: project.location },
    { label: 'Kategori', value: project.category?.name },
    {
      label: 'Tarih',
      value: project.projectDate
        ? new Date(project.projectDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
        : null,
    },
  ].filter((fact) => fact.value);

  return (
    <article>
      {coverUrl && (
        <div className="relative aspect-21/9 w-full overflow-hidden bg-stone-100">
          <MediaImage src={coverUrl} alt={project.title} priority className="object-cover" />
        </div>
      )}

      <Container className="py-20 sm:py-28">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_300px]">
          <div>
            <h1 className="max-w-3xl font-(family-name:--font-display) text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              {project.title}
            </h1>
            {project.shortDescription && (
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{project.shortDescription}</p>
            )}
            <div className="mt-12 max-w-2xl space-y-5 text-[17px] leading-[1.85] text-foreground/80">
              <RichText text={project.description} />
            </div>

            {project.images.length > 0 && (
              <div className="mt-16">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Galeri</p>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {project.images.map((image) => {
                    const imageUrl = resolveMediaUrl(image.imageUrl);
                    if (!imageUrl) return null;

                    return (
                      <div
                        key={image.id}
                        className="relative aspect-square overflow-hidden rounded-xl bg-stone-100"
                      >
                        <MediaImage
                          src={imageUrl}
                          alt={image.altText ?? project.title}
                          className="object-cover transition duration-500 ease-out hover:scale-105"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {facts.length > 0 && (
            <aside className="h-fit rounded-2xl border border-border bg-surface p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Proje Bilgileri</p>
              <dl className="mt-5 space-y-5">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">{fact.label}</dt>
                    <dd className="mt-1.5 text-sm font-medium text-foreground">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          )}
        </div>
      </Container>
    </article>
  );
}
