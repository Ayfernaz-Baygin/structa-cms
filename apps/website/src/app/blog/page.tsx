import type { Metadata } from 'next';

import { Container } from '@/components/container';
import { PostCard } from '@/components/post-card';
import { SectionHeading } from '@/components/section-heading';
import { getPosts } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Blog',
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <Container className="py-16 sm:py-24">
      <SectionHeading eyebrow="Güncel" title="Blog" />

      {posts.length === 0 ? (
        <p className="mt-12 text-sm text-muted">Şu anda yayında bir yazı bulunmuyor.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </Container>
  );
}
