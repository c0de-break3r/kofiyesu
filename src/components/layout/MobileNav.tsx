import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { profile } from "@/data/profile";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/projects", label: "Projects", end: false },
  { to: "/experience", label: "Experience", end: false },
  { to: "/about", label: "About", end: false },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function MobileNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close the menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="md:hidden">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur">
        <div className="flex h-[var(--height-header)] items-center justify-between px-6">
          <Link
            to="/"
            className="text-sm font-black uppercase tracking-[0.14em] text-[var(--text)]"
          >
            {profile.shortName}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </header>

      {open ? (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-[var(--height-header)] z-40 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4 shadow-[0_20px_40px_-28px_rgba(27,29,33,0.4)]"
        >
          <nav className="flex flex-col" aria-label="Mobile">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-3 text-base font-semibold transition ${
                    isActive
                      ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-deep)]"
                      : "text-[var(--text)] hover:bg-[var(--surface-muted)]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border)] pt-3">
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl px-3 py-3 text-base font-semibold text-[var(--text)] transition hover:bg-[var(--surface-muted)]"
              >
                GitHub
              </a>
              <a
                href={`mailto:${profile.email}`}
                className="rounded-xl bg-[var(--color-accent)] px-3 py-3 text-center text-base font-bold text-white transition hover:bg-[var(--color-accent-deep)]"
              >
                Email me
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
