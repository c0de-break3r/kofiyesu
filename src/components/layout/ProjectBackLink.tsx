import { Link } from "react-router-dom";
import { t } from "@/i18n/en";

export function ProjectBackLink({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/#projects"
      className={`inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text)] shadow-sm transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden>
        <path
          d="M15 6l-6 6 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {t("back-to-work")}
    </Link>
  );
}
