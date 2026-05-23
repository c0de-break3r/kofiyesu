import { tagLabels, type TagVariant } from "@/lib/tagVariants";

export function Tag({ variant }: { variant: TagVariant }) {
  return (
    <span className="rounded-md border border-transparent bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-950 dark:bg-orange-950/40 dark:text-orange-200">
      {tagLabels[variant]}
    </span>
  );
}
