import type { ReactNode } from "react";

/**
 * Consistent section header for the one-page home: a mono "01 — EXPERIENCE"
 * eyebrow over a large display heading, with an optional trailing link slot.
 */
export function SectionHeader({
  index,
  title,
  intro,
  trailing,
}: {
  /** Zero-padded section number shown before the dashed label, e.g. "01". */
  index: string;
  title: string;
  /** Optional one-line intro under the heading. */
  intro?: string;
  /** Optional trailing element (e.g. a "view all →" link), aligned right. */
  trailing?: ReactNode;
}) {
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14">
      <div className="max-w-xl">
        <p className="font-mono text-xs tracking-[0.28em] text-[var(--color-accent)] uppercase">
          {index} — {title}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl md:text-5xl">
          {title}
        </h2>
        {intro ? (
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{intro}</p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </header>
  );
}
