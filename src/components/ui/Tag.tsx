import { tagLabels, type TagVariant } from "@/lib/tagVariants";

export function Tag({ variant }: { variant: TagVariant }) {
  return (
    <span className="rounded-md border border-transparent bg-[color-mix(in_srgb,var(--color-accent)_12%,white)] px-2 py-0.5 text-xs font-bold text-[var(--color-accent-deep)]">
      {tagLabels[variant]}
    </span>
  );
}
