import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Container } from '@/components/container';
import { RichText } from '@/components/rich-text';
import { SectionRenderer } from '@/components/section-renderer';
import { getPageBySlug } from '@/lib/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {};
  }

  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
  };
}

export default async function CmsPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  if (page.sections.length > 0) {
    return (
      <article>
        <SectionRenderer sections={page.sections} />
      </article>
    );
  }

  return (
    <Container className="py-16 sm:py-24">
      <article className="mx-auto max-w-2xl">
        <h1 className="font-(family-name:--font-display) text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {page.title}
        </h1>
        <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground/90">
          <RichText text={page.body} />
        </div>
      </article>
    </Container>
  );
}
