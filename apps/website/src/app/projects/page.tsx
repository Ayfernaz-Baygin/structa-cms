import type { Metadata } from 'next';

import { Container } from '@/components/container';
import { ProjectCard } from '@/components/project-card';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { getProjects } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Projelerimiz',
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <Container size="wide" className="py-20 sm:py-28">
      <SectionHeading title="Projelerimiz" />

      {projects.length === 0 ? (
        <p className="mt-12 text-sm text-muted">Şu anda yayında bir proje bulunmuyor.</p>
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      )}
    </Container>
  );
}
