import Link from '@/components/locale-link';

import { Container } from '@/components/container';
import { ProjectCard } from '@/components/project-card';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { getProjects, type ListSectionData } from '@/lib/api';

export async function ProjectsSection({ data }: { data: ListSectionData }) {
  const projects = await getProjects(data.limit);

  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading title={data.title ?? 'Projelerimiz'} />
          <Link
            href="/projects"
            className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            Tümünü Gör →
          </Link>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={(index % 3) * 80}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
