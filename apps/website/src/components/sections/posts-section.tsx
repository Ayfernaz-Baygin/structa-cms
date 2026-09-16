import Link from '@/components/locale-link';

import { Container } from '@/components/container';
import { PostCard } from '@/components/post-card';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { getPosts, type ListSectionData } from '@/lib/api';

export async function PostsSection({ data }: { data: ListSectionData }) {
  const posts = await getPosts(data.limit);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading title={data.title ?? 'Blog'} />
          <Link
            href="/blog"
            className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            Tümünü Gör →
          </Link>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Reveal key={post.id} delay={(index % 3) * 80}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
