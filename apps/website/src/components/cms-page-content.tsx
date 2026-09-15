import { Container } from '@/components/container';
import { RichText } from '@/components/rich-text';
import { SectionRenderer } from '@/components/section-renderer';
import type { Page } from '@/lib/api';

/**
 * Renders a CMS Page's own content: Page Builder sections when present,
 * otherwise its legacy plain-text body. Shared by the CMS "/[slug]" route
 * and the homepage when a Page is selected as the site's homepage.
 */
export function CmsPageContent({ page }: { page: Page }) {
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
