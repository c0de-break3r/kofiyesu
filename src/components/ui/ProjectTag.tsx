import { tagDisplayLabel } from "@/lib/normalizeProjectTags";

export function ProjectTag({ tag }: { tag: string }) {
  const label = tagDisplayLabel(tag);
  if (!label) return null;

  return (
    <span className="rounded-md border border-transparent bg-[color-mix(in_srgb,var(--color-accent)_12%,white)] px-2 py-0.5 text-xs font-bold text-[var(--color-accent-deep)]">
      {label}
    </span>
  );
}
