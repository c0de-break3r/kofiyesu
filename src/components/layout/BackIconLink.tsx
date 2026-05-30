import { Link } from "react-router-dom";

export function BackIconLink({
  to,
  ariaLabel,
  className = "",
}: {
  to: string;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--text)] shadow-sm transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden>
        <path
          d="M15 6l-6 6 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
