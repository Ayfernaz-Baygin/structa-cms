import { Container } from '@/components/container';
import { PostCard } from '@/components/post-card';
import { SectionHeading } from '@/components/section-heading';
import { getPosts, type ListSectionData } from '@/lib/api';

export async function PostsSection({ data }: { data: ListSectionData }) {
  const posts = await getPosts(data.limit);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading title={data.title ?? 'Blog'} />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </Container>
    </section>
  );
}
