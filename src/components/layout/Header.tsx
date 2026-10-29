import { Link, NavLink, useLocation } from "react-router-dom";
import { ThemeToggleButton } from "@/components/ui/ThemeToggleButton";
import { useScrolled } from "@/hooks/useScrolled";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/projects", label: "Projects", end: false },
  { to: "/about", label: "About", end: false },
];

export function Header() {
  const location = useLocation();
  const isProjectRoute = location.pathname.startsWith("/project/");
  const scrolled = useScrolled();

  // Home relies on the hero quick-links (incl. the theme toggle) — no navbar.
  if (location.pathname === "/") return null;

  const island = `pointer-events-auto flex w-full items-center justify-between rounded-3xl px-6 transition-all duration-300 ${
    scrolled
      ? "bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] shadow-[0_12px_32px_-20px_rgba(0,0,0,0.5)] backdrop-blur"
      : "bg-transparent"
  }`;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden md:block">
      <div className="mx-auto flex h-[var(--height-header)] max-w-6xl items-center px-4">
        <div className={island}>
          <ThemeToggleButton />

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
      </div>
    </header>
  );
}
