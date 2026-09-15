import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Container } from '@/components/container';
import { MediaImage } from '@/components/media-image';
import { RichText } from '@/components/rich-text';
import { getPostBySlug } from '@/lib/api';
import { formatAuthorName, formatDate } from '@/lib/format';
import { resolveMediaUrl } from '@/lib/media';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const coverUrl = resolveMediaUrl(post.coverImage);
  const date = formatDate(post.publishedAt);
  const author = formatAuthorName(post.author);

  return (
    <article>
      {coverUrl && (
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-stone-100">
          <MediaImage src={coverUrl} alt={post.title} priority className="object-cover" />
        </div>
      )}

      <Container className="py-16 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-accent">
            {post.category?.name && <span>{post.category.name}</span>}
            {post.category?.name && date && <span className="text-muted">·</span>}
            {date && <span className="text-muted normal-case tracking-normal">{date}</span>}
          </div>
          <h1 className="mt-3 font-(family-name:--font-display) text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {post.title}
          </h1>
          {author && <p className="mt-4 text-sm text-muted">Yazar: {author}</p>}

          <div className="mt-10 space-y-4 text-base leading-relaxed text-foreground/90">
            <RichText text={post.content} />
          </div>
        </div>
      </Container>
    </article>
  );
}
