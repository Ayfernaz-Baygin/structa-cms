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
    <Container className="py-20 sm:py-28">
      <article className="mx-auto max-w-2xl">
        <h1 className="font-(family-name:--font-display) text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          {page.title}
        </h1>
        <div className="mt-10 space-y-5 text-[17px] leading-[1.85] text-foreground/80">
          <RichText text={page.body} />
        </div>
      </article>
    </Container>
  );
}
