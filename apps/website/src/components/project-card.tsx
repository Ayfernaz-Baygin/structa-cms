import Image from 'next/image';
import Link from 'next/link';

import type { Project } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

export function ProjectCard({ project }: { project: Project }) {
  const coverUrl = resolveMediaUrl(project.coverImage);
  const meta = [project.category?.name, project.location].filter(Boolean).join(' · ');

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:shadow-lg hover:shadow-black/5"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={project.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted">
            {project.title}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        {meta && <span className="text-xs font-medium uppercase tracking-wide text-accent">{meta}</span>}
        <h3 className="font-(family-name:--font-display) text-lg font-semibold text-foreground">
          {project.title}
        </h3>
        {project.clientName && <p className="text-sm text-muted">{project.clientName}</p>}
      </div>
    </Link>
  );
}
