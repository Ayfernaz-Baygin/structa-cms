import type { Metadata } from 'next';

import { Container } from '@/components/container';
import { ProjectCard } from '@/components/project-card';
import { SectionHeading } from '@/components/section-heading';
import { getProjects } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Projelerimiz',
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <Container className="py-16 sm:py-24">
      <SectionHeading eyebrow="Portföy" title="Projelerimiz" />

      {projects.length === 0 ? (
        <p className="mt-12 text-sm text-muted">Şu anda yayında bir proje bulunmuyor.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </Container>
  );
}
