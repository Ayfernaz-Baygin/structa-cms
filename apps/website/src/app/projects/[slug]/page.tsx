import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Container } from '@/components/container';
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
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-stone-100">
          <Image src={coverUrl} alt={project.title} fill priority className="object-cover" />
        </div>
      )}

      <Container className="py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_280px]">
          <div>
            <h1 className="font-(family-name:--font-display) text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {project.title}
            </h1>
            {project.shortDescription && (
              <p className="mt-4 text-lg leading-relaxed text-muted">{project.shortDescription}</p>
            )}
            <div className="mt-10 space-y-4 text-base leading-relaxed text-foreground/90">
              <RichText text={project.description} />
            </div>

            {project.images.length > 0 && (
              <div className="mt-14">
                <h2 className="font-(family-name:--font-display) text-2xl font-semibold text-foreground">
                  Galeri
                </h2>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {project.images.map((image) => {
                    const imageUrl = resolveMediaUrl(image.imageUrl);
                    if (!imageUrl) return null;

                    return (
                      <div
                        key={image.id}
                        className="relative aspect-square overflow-hidden rounded-xl bg-stone-100"
                      >
                        <Image
                          src={imageUrl}
                          alt={image.altText ?? project.title}
                          fill
                          className="object-cover transition duration-300 hover:scale-105"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {facts.length > 0 && (
            <aside className="h-fit rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Proje Bilgileri</h2>
              <dl className="mt-4 space-y-4">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">{fact.label}</dt>
                    <dd className="mt-1 text-sm font-medium text-foreground">{fact.value}</dd>
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
