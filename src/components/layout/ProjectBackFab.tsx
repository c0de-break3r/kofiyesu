import { Link } from "react-router-dom";
import { t } from "@/i18n/en";

export function ProjectBackFab() {
  return (
    <Link
      to="/#projects"
      className="fixed left-4 top-[calc(12px+env(safe-area-inset-top,0px))] z-[80] flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--text)] shadow-[0_4px_24px_rgba(0,0,0,0.12)] transition hover:text-[var(--color-accent)] md:hidden"
      aria-label={t("back-to-work")}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
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
