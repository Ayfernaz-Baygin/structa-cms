import Link from "@/components/locale-link";
import { MediaImage } from "@/components/media-image";

import type { Project } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";

export function ProjectCard({
  project,
  size = "default",
}: {
  project: Project;
  size?: "default" | "large";
}) {
  const coverUrl = resolveMediaUrl(project.coverImage);
  const meta = [project.category?.name, project.location].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative flex w-full overflow-hidden rounded-xl bg-stone-900"
    >
      <div
        className={`relative w-full overflow-hidden ${size === "large" ? "aspect-16/10" : "aspect-4/5"}`}
      >
        <MediaImage
          src={coverUrl}
          alt={project.title}
          className="object-cover transition duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent transition duration-300 group-hover:from-black/90" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
        {meta && (
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70">{meta}</p>
        )}
        <h3
          className={`mt-2 font-(family-name:--font-display) font-semibold leading-tight text-white ${
            size === "large" ? "text-3xl sm:text-4xl" : "text-2xl"
          }`}
        >
          {project.title}
        </h3>
        {project.clientName && (
          <p className="mt-1 text-sm text-white/60">{project.clientName}</p>
        )}
      </div>
    </Link>
  );
}
