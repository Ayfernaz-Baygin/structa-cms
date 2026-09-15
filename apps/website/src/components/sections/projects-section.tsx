import { Container } from '@/components/container';
import { ProjectCard } from '@/components/project-card';
import { SectionHeading } from '@/components/section-heading';
import { getProjects, type ListSectionData } from '@/lib/api';

export async function ProjectsSection({ data }: { data: ListSectionData }) {
  const projects = await getProjects(data.limit);

  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading title={data.title ?? 'Projelerimiz'} />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </Container>
    </section>
  );
}
