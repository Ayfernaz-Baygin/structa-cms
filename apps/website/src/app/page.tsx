import type { Metadata } from "next";
import Link from "@/components/locale-link";

import { Button } from "@/components/button";
import { CmsPageContent } from "@/components/cms-page-content";
import { Container } from "@/components/container";
import { MediaImage } from "@/components/media-image";
import { PostCard } from "@/components/post-card";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import {
  getPageBySlug,
  getPosts,
  getProjects,
  getServices,
  getSettings,
} from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";

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

  const heroProject = projects[0];
  const heroImageUrl = resolveMediaUrl(heroProject?.coverImage);

  return (
    <>
      {heroImageUrl ? (
        <section className="relative flex min-h-screen items-end overflow-hidden bg-stone-900">
          <MediaImage
            src={heroImageUrl}
            alt=""
            priority
            className="animate-hero-zoom object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/10" />
          <Container className="relative w-full py-16 sm:py-20 lg:py-24">
            <div className="max-w-3xl">
              <h1 className="animate-fade-up font-(family-name:--font-display) text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                {settings.siteDescription ??
                  "Mekanları anlamlı, kalıcı tasarımlara dönüştürüyoruz."}
              </h1>
              <div className="mt-7 flex animate-fade-up flex-wrap gap-3 [animation-delay:150ms]">
                <Button href="/projects" variant="inverted">
                  Projelerimizi İnceleyin
                </Button>
                <Button href="/services" variant="outlineLight">
                  Hizmetlerimiz
                </Button>
              </div>
            </div>
          </Container>
          <a
            href="#explore"
            aria-label="Aşağı kaydır"
            className="absolute bottom-8 right-6 z-10 flex h-14 w-14 animate-bounce-slow items-center justify-center rounded-full border border-white/40 text-white transition hover:border-white hover:bg-white/10 sm:right-10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0-6-6m6 6 6-6" />
            </svg>
          </a>
        </section>
      ) : (
        <section className="border-b border-border bg-surface pt-24 sm:pt-28 lg:flex lg:min-h-screen lg:items-center lg:pt-32">
          <Container className="w-full py-20 sm:py-28 lg:py-0">
            <div className="flex max-w-2xl animate-fade-up flex-col items-start gap-6">
              <h1 className="font-(family-name:--font-display) text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-6xl xl:text-7xl">
                {settings.siteDescription ??
                  "Mekanları anlamlı, kalıcı tasarımlara dönüştürüyoruz."}
              </h1>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button href="/projects" variant="filled">
                  Projelerimizi İnceleyin
                </Button>
                <Button href="/services" variant="outline">
                  Hizmetlerimiz
                </Button>
              </div>
            </div>
          </Container>
        </section>
      )}

      <div id="explore" />

      {services.length > 0 && (
        <section className="py-20 sm:py-28">
          <Container>
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading title="Hizmetlerimiz" />
              <Link
                href="/services"
                className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                Tümünü Gör →
              </Link>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <Reveal key={service.id} delay={(index % 3) * 80}>
                  <ServiceCard service={service} index={index} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {projects.length > 0 && (
        <section className="bg-surface py-20 sm:py-28">
          <Container>
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading title="Seçili Projeler" />
              <Link
                href="/projects"
                className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                Tümünü Gör →
              </Link>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <Reveal
                  key={project.id}
                  delay={(index % 3) * 80}
                  className={index === 0 ? "sm:col-span-2 lg:col-span-2" : ""}
                >
                  <ProjectCard project={project} size={index === 0 ? "large" : "default"} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="py-20 sm:py-28">
        <Container>
          <Reveal className="relative isolate overflow-hidden rounded-2xl bg-stone-900 px-6 py-20 text-center sm:px-16 sm:py-24">
            <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
              <h2 className="font-(family-name:--font-display) text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                {settings.siteName ?? "Structa"} ile projenizi hayata geçirelim.
              </h2>
              {settings.siteDescription && (
                <p className="max-w-xl text-base leading-relaxed text-white/70">
                  {settings.siteDescription}
                </p>
              )}
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-stone-900 transition hover:bg-white/90"
                >
                  Bize Ulaşın
                </a>
              )}
            </div>
          </Reveal>
        </Container>
      </section>

      {posts.length > 0 && (
        <section className="bg-surface py-20 sm:py-28">
          <Container>
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading title="Blogdan Son Yazılar" />
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
      )}
    </>
  );
}
