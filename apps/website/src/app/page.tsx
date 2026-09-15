import type { Metadata } from 'next';
import Link from 'next/link';

import { CmsPageContent } from '@/components/cms-page-content';
import { Container } from '@/components/container';
import { PostCard } from '@/components/post-card';
import { ProjectCard } from '@/components/project-card';
import { SectionHeading } from '@/components/section-heading';
import { ServiceCard } from '@/components/service-card';
import { getPageBySlug, getPosts, getProjects, getServices, getSettings } from '@/lib/api';

async function resolveHomePage() {
  const settings = await getSettings();

  if (!settings.homePage) {
    return null;
  }

  // Falls back to the default homepage below when the selected Page is a
  // draft or has been deleted (getPageBySlug only returns PUBLISHED pages).
  return getPageBySlug(settings.homePage.slug);
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await resolveHomePage();

  if (!page) {
    return {};
  }

  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
  };
}

export default async function HomePage() {
  const homePage = await resolveHomePage();

  if (homePage) {
    return <CmsPageContent page={homePage} />;
  }

  const [settings, services, projects, posts] = await Promise.all([
    getSettings(),
    getServices(6),
    getProjects(6),
    getPosts(3),
  ]);

  return (
    <>
      <section className="border-b border-border bg-surface">
        <Container className="flex flex-col items-start gap-6 py-24 sm:py-32">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            {settings.siteName ?? 'Structa'}
          </p>
          <h1 className="max-w-3xl font-(family-name:--font-display) text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
            {settings.siteDescription ?? 'Mekanları anlamlı, kalıcı tasarımlara dönüştürüyoruz.'}
          </h1>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/projects"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
            >
              Projelerimizi İnceleyin
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-black/[.03]"
            >
              Hizmetlerimiz
            </Link>
          </div>
        </Container>
      </section>

      {services.length > 0 && (
        <section className="py-20 sm:py-28">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow="Neler Yapıyoruz" title="Hizmetlerimiz" />
              <Link href="/services" className="text-sm font-semibold text-accent hover:underline">
                Tümünü Gör →
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {projects.length > 0 && (
        <section className="bg-surface py-20 sm:py-28">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow="Portföy" title="Seçili Projeler" />
              <Link href="/projects" className="text-sm font-semibold text-accent hover:underline">
                Tümünü Gör →
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="py-20 sm:py-28">
        <Container className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-stone-900 px-6 py-16 text-center text-white sm:px-16">
          <h2 className="font-(family-name:--font-display) text-3xl font-semibold tracking-tight sm:text-4xl">
            {settings.siteName ?? 'Structa'} ile projenizi hayata geçirelim.
          </h2>
          {settings.siteDescription && (
            <p className="max-w-xl text-base leading-relaxed text-white/70">{settings.siteDescription}</p>
          )}
          {settings.email && (
            <a
              href={`mailto:${settings.email}`}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-900 transition hover:opacity-90"
            >
              Bize Ulaşın
            </a>
          )}
        </Container>
      </section>

      {posts.length > 0 && (
        <section className="bg-surface py-20 sm:py-28">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow="Güncel" title="Blogdan Son Yazılar" />
              <Link href="/blog" className="text-sm font-semibold text-accent hover:underline">
                Tümünü Gör →
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
