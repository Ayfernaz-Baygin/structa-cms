import type { Metadata } from 'next';

import { Container } from '@/components/container';
import { PostCard } from '@/components/post-card';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { getPosts } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Blog',
};

export default async function BlogPage() {
  const posts = await getPosts();
  const [featuredPost, ...restPosts] = posts;

  return (
    <Container className="py-20 sm:py-28">
      <SectionHeading title="Blog" />

      {posts.length === 0 ? (
        <p className="mt-12 text-sm text-muted">Şu anda yayında bir yazı bulunmuyor.</p>
      ) : (
        <>
          <Reveal className="mt-14">
            <PostCard post={featuredPost} featured />
          </Reveal>

          {restPosts.length > 0 && (
            <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 border-t border-border pt-16 sm:grid-cols-2 lg:grid-cols-3">
              {restPosts.map((post, index) => (
                <Reveal key={post.id} delay={(index % 3) * 80}>
                  <PostCard post={post} />
                </Reveal>
              ))}
            </div>
          )}
        </>
      )}
    </Container>
  );
}
