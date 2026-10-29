import { FiBriefcase, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { profile } from "@/data/profile";
import { ThemeToggleButton } from "@/components/ui/ThemeToggleButton";

/**
 * The row of circular quick links (Proof of work, GitHub, LinkedIn, Email,
 * theme toggle). Shared by the hero and the footer so both stay identical.
 */
export function QuickLinks({
  className = "",
  workHref = "#work",
}: {
  className?: string;
  /** Where the "Proof of work" link points. Use "/#work" off the home page. */
  workHref?: string;
}) {
  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-2.5 ${className}`}
      aria-label="Quick links"
    >
      <a
        href={workHref}
        className="icon-btn icon-btn--outline"
        aria-label="Proof of work"
        title="Proof of work"
      >
        <FiBriefcase aria-hidden />
      </a>
      <a
        href={profile.github}
        target="_blank"
        rel="noreferrer"
        className="icon-btn icon-btn--outline"
        aria-label="GitHub"
        title="GitHub"
      >
        <FiGithub aria-hidden />
      </a>
      <a
        href={profile.linkedin}
        target="_blank"
        rel="noreferrer"
        className="icon-btn icon-btn--outline"
        aria-label="LinkedIn"
        title="LinkedIn"
      >
        <FiLinkedin aria-hidden />
      </a>
      <a
        href={`mailto:${profile.email}`}
        className="icon-btn icon-btn--outline"
        aria-label="Email"
        title="Email"
      >
        <FiMail aria-hidden />
      </a>
      <ThemeToggleButton className="icon-btn--outline" />
    </nav>
  );
}
