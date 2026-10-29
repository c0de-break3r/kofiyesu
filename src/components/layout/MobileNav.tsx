import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { profile } from "@/data/profile";
import { ThemeToggleButton } from "@/components/ui/ThemeToggleButton";
import { useScrolled } from "@/hooks/useScrolled";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/projects", label: "Projects", end: false },
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
  const scrolled = useScrolled();

  // Close the menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Home relies on the hero quick-links (incl. the theme toggle) — no menu bar.
  if (location.pathname === "/") return null;

  return (
    <div className="md:hidden">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="flex h-[var(--height-header)] items-center px-4">
          <div
            className={`pointer-events-auto flex w-full items-center justify-between rounded-3xl px-5 transition-all duration-300 ${
              scrolled
                ? "bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] shadow-[0_12px_32px_-20px_rgba(0,0,0,0.5)] backdrop-blur"
                : "bg-transparent"
            }`}
          >
            <ThemeToggleButton />

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="icon-btn"
            >
              <MenuIcon open={open} />
            </button>
          </div>
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
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl px-3 py-3 text-base font-semibold text-[var(--text)] transition hover:bg-[var(--surface-muted)]"
              >
                LinkedIn
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
