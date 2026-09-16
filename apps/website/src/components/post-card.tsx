import Link from "@/components/locale-link";
import { MediaImage } from "@/components/media-image";

import type { Post } from "@/lib/api";
import { formatAuthorName, formatDate } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media";

function PostMeta({ post, date }: { post: Post; date: string | null }) {
  if (!post.category?.name && !date) return null;

  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
      {post.category?.name && <span>{post.category.name}</span>}
      {post.category?.name && date && <span className="text-muted">·</span>}
      {date && <span className="normal-case tracking-normal text-muted">{date}</span>}
    </div>
  );
}

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const coverUrl = resolveMediaUrl(post.coverImage);
  const date = formatDate(post.publishedAt);
  const author = formatAuthorName(post.author);

  if (featured) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group grid grid-cols-1 items-center gap-6 sm:grid-cols-2 sm:gap-12"
      >
        <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-stone-100">
          <MediaImage
            src={coverUrl}
            alt={post.title}
            priority
            className="object-cover transition duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <div>
          <PostMeta post={post} date={date} />
          <h3 className="mt-4 font-(family-name:--font-display) text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-4 line-clamp-3 text-base leading-relaxed text-muted">{post.excerpt}</p>
          )}
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent transition group-hover:gap-3">
            Devamını Oku <span aria-hidden>→</span>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col">
      <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-stone-100">
        <MediaImage
          src={coverUrl}
          alt={post.title}
          className="object-cover transition duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <div className="mt-5 flex flex-1 flex-col gap-2 border-t border-border pt-5">
        <PostMeta post={post} date={date} />
        <h3 className="font-(family-name:--font-display) text-lg font-semibold text-foreground">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
        )}
        {author && <span className="mt-auto pt-1 text-xs text-muted">{author}</span>}
      </div>
    </Link>
  );
}
