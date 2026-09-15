import Image from 'next/image';
import Link from 'next/link';

import type { Post } from '@/lib/api';
import { formatAuthorName, formatDate } from '@/lib/format';
import { resolveMediaUrl } from '@/lib/media';

export function PostCard({ post }: { post: Post }) {
  const coverUrl = resolveMediaUrl(post.coverImage);
  const date = formatDate(post.publishedAt);
  const author = formatAuthorName(post.author);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:shadow-lg hover:shadow-black/5"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={post.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted">
            {post.title}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-accent">
          {post.category?.name && <span>{post.category.name}</span>}
          {post.category?.name && date && <span className="text-muted">·</span>}
          {date && <span className="text-muted normal-case tracking-normal">{date}</span>}
        </div>
        <h3 className="font-(family-name:--font-display) text-lg font-semibold text-foreground">
          {post.title}
        </h3>
        {post.excerpt && <p className="line-clamp-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>}
        {author && <span className="mt-auto pt-2 text-xs text-muted">{author}</span>}
      </div>
    </Link>
  );
}
