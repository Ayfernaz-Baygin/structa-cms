export function SectionHeading({
  title,
  description,
  className,
}: {
  title: string;
  description?: string | null;
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${className ?? ''}`}>
      <h2 className="font-(family-name:--font-display) text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-relaxed text-muted">{description}</p>}
    </div>
  );
}
