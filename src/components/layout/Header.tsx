import { Link, NavLink, useLocation } from "react-router-dom";
import { profile } from "@/data/profile";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/projects", label: "Projects", end: false },
  { to: "/experience", label: "Experience", end: false },
  { to: "/about", label: "About", end: false },
];

export function Header() {
  const location = useLocation();
  const isProjectRoute = location.pathname.startsWith("/project/");

  return (
    <header className="fixed inset-x-0 top-0 z-50 hidden border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] backdrop-blur md:block">
      <div className="mx-auto flex h-[var(--height-header)] max-w-6xl items-center justify-between px-6">
        <Link
          to="/"
          className="text-sm font-black uppercase tracking-[0.14em] text-[var(--text)]"
        >
          {profile.shortName}
        </Link>

        {!isProjectRoute ? (
          <nav className="flex items-center gap-1 text-sm font-semibold">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 transition ${
                    isActive
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        ) : (
          <Link
            to="/projects"
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            All projects
          </Link>
        )}
      </div>
    </header>
  );
}
