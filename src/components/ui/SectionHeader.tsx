import type { ReactNode } from "react";

/**
 * Consistent section header for the one-page home: an optional mono
 * "01 — TITLE" eyebrow over a large display heading, with an optional
 * trailing link slot.
 */
export function SectionHeader({
  index,
  title,
  intro,
  trailing,
}: {
  /** Optional zero-padded section number shown before the dashed label, e.g. "01". */
  index?: string;
  title: string;
  /** Optional one-line intro under the heading. */
  intro?: string;
  /** Optional trailing element (e.g. a "view all →" link), aligned right. */
  trailing?: ReactNode;
}) {
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14">
      <div className="max-w-xl">
        {index ? (
          <p className="font-mono text-xs tracking-[0.28em] text-[var(--color-accent)] uppercase">
            {index} — {title}
          </p>
        ) : null}
        <h2 className="text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl md:text-5xl" style={index ? { marginTop: "0.75rem" } : undefined}>
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
