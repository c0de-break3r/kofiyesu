interface Props {
  items: string[];
}

export function ProjectTechStack({ items }: Props) {
  if (!items.length) return null;

  return (
    <div
      className="mt-5 rounded-xl border-2 border-[var(--color-accent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-accent)_8%,#fff)_0%,color-mix(in_srgb,var(--color-accent)_3%,#fff)_100%)] px-4 py-3.5 shadow-[0_4px_20px_color-mix(in_srgb,var(--color-accent)_12%,transparent)]"
      aria-label="Tech stack"
    >
      <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">
        Tech stack
      </p>
      <p className="mt-2 text-sm font-semibold leading-relaxed tracking-wide text-[var(--text)] sm:text-base">
        {items.join(" · ")}
      </p>
    </div>
  );
}
