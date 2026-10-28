/**
 * A framed card that presents a list of technologies as a tidy label + pill set.
 * Reused on the project detail (Technology stack), experience (Tools & tech),
 * and about (Technologies) pages for a consistent premium look.
 */
export function TechStackCard({
  label = "Technology stack",
  technologies,
  className = "",
}: {
  label?: string;
  technologies: readonly string[];
  className?: string;
}) {
  if (!technologies.length) return null;

  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 ${className}`}
    >
      {label ? (
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
          />
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {label}
          </span>
        </div>
      ) : null}
      <ul
        className={`${label ? "mt-4" : ""} flex flex-wrap gap-2`}
      >
        {technologies.map((tech) => (
          <li
            key={tech}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text)]"
          >
            {tech}
          </li>
        ))}
      </ul>
    </div>
  );
}
