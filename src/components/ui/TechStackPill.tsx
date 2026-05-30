export function TechStackPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[color-mix(in_srgb,var(--color-accent)_28%,var(--border))] bg-[color-mix(in_srgb,var(--color-accent)_9%,white)] px-2.5 py-1 text-xs font-semibold tracking-wide text-[var(--text)]">
      {label}
    </span>
  );
}
