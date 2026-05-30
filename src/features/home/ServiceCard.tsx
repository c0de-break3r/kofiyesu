import { useId, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`h-4 w-4 shrink-0 text-[var(--color-accent)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ServiceCard({ name, info }: { name: string; info?: string }) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const detailsId = useId();
  const hasInfo = Boolean(info?.trim());

  return (
    <li
      className={`rounded-xl border bg-[var(--bg-elevated)] px-4 py-3.5 transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        open ? "border-[color-mix(in_srgb,var(--color-accent)_40%,var(--border))] shadow-[0_8px_24px_color-mix(in_srgb,var(--color-accent)_10%,transparent)]" : "border-[var(--border)]"
      }`}
    >
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left md:pointer-events-none md:cursor-default"
        aria-expanded={hasInfo ? open : undefined}
        aria-controls={hasInfo ? detailsId : undefined}
        onClick={() => {
          if (!hasInfo) return;
          setOpen((value) => !value);
        }}
      >
        <p className="text-sm font-bold leading-snug text-[var(--text)]">{name}</p>
        {hasInfo ? <span className="mt-0.5 md:hidden"><Chevron open={open} /></span> : null}
      </button>

      {hasInfo ? (
        <div
          id={detailsId}
          className={`service-card-details max-md:grid ${open ? "service-card-details--open" : ""} ${reducedMotion ? "service-card-details--static" : ""}`}
        >
          <div className="min-h-0 overflow-hidden">
            <p className="pt-2 text-xs leading-relaxed text-[var(--text-muted)]">{info}</p>
          </div>
        </div>
      ) : null}

      {hasInfo ? (
        <p className="mt-1.5 hidden text-xs leading-relaxed text-[var(--text-muted)] md:block">{info}</p>
      ) : null}
    </li>
  );
}
