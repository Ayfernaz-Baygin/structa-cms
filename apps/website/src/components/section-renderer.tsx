import { CtaSection } from '@/components/sections/cta-section';
import { HeroSection } from '@/components/sections/hero-section';
import { ImageTextSection } from '@/components/sections/image-text-section';
import { PostsSection } from '@/components/sections/posts-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { ServicesSection } from '@/components/sections/services-section';
import { TextSection } from '@/components/sections/text-section';
import type {
  CtaSectionData,
  HeroSectionData,
  ImageTextSectionData,
  ListSectionData,
  PageSection,
  TextSectionData,
} from '@/lib/api';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function asOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function toListData(raw: Record<string, unknown>): ListSectionData {
  return {
    title: asOptionalString(raw.title),
    limit: asOptionalNumber(raw.limit),
  };
}

export function SectionRenderer({ sections }: { sections: PageSection[] }) {
  return (
    <>
      {sections.map((section) => {
        switch (section.type) {
          case 'HERO': {
            const data: HeroSectionData = {
              title: asString(section.data.title),
              subtitle: asOptionalString(section.data.subtitle),
              imageUrl: asOptionalString(section.data.imageUrl),
              ctaLabel: asOptionalString(section.data.ctaLabel),
              ctaUrl: asOptionalString(section.data.ctaUrl),
            };
            return <HeroSection key={section.id} data={data} />;
          }

          case 'TEXT': {
            const data: TextSectionData = {
              title: asOptionalString(section.data.title),
              body: asString(section.data.body),
            };
            return <TextSection key={section.id} data={data} />;
          }

          case 'IMAGE_TEXT': {
            const position = section.data.imagePosition === 'right' ? 'right' : 'left';
            const data: ImageTextSectionData = {
              title: asOptionalString(section.data.title),
              body: asString(section.data.body),
              imageUrl: asString(section.data.imageUrl),
              imagePosition: position,
            };
            return <ImageTextSection key={section.id} data={data} />;
          }

          case 'SERVICES':
            return <ServicesSection key={section.id} data={toListData(section.data)} />;

          case 'PROJECTS':
            return <ProjectsSection key={section.id} data={toListData(section.data)} />;

          case 'POSTS':
            return <PostsSection key={section.id} data={toListData(section.data)} />;

          case 'CTA': {
            const data: CtaSectionData = {
              title: asString(section.data.title),
              description: asOptionalString(section.data.description),
              buttonLabel: asString(section.data.buttonLabel),
              buttonUrl: asString(section.data.buttonUrl),
              imageUrl: asOptionalString(section.data.imageUrl),
            };
            return <CtaSection key={section.id} data={data} />;
          }

          default:
            return null;
        }
      })}
    </>
  );
}
