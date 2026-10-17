import { Link } from "react-router-dom";
import { profile } from "@/data/profile";
import { getCurrentYear } from "@/lib/currentYear";

const links = [
  { to: "/projects", label: "Projects" },
  { to: "/experience", label: "Experience" },
  { to: "/about", label: "About" },
];

export function Footer({
  withSocial = true,
  className = "",
}: {
  withSocial?: boolean;
  className?: string;
}) {
  const year = getCurrentYear();

  return (
    <footer
      className={`relative w-full border-t border-[var(--border)] bg-[var(--surface)] px-6 py-12 ${className}`}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        {withSocial ? (
          <nav className="flex flex-wrap justify-center gap-4" aria-label="Footer links">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--color-accent)]"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--color-accent)]"
            >
              GitHub
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--color-accent)]"
            >
              Email
            </a>
          </nav>
        ) : null}
        <p className="text-center text-sm text-[var(--text-muted)]">
          © {year} {profile.name}
        </p>
      </div>
    </footer>
  );
}
