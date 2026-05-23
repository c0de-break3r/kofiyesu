import { Link, useLocation, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { isClerkConfigured } from "@/lib/clerk";
import { useTheme } from "@/hooks/useTheme";
import { t } from "@/i18n/en";
import { isClerkAdminUser } from "@/lib/clerkAdmin";
import { useAdminPanel } from "@/hooks/useAdminPanel";

function AdminToggle() {
  const { userId } = useAuth();
  const { open, toggle } = useAdminPanel();
  if (!isClerkAdminUser(userId)) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
        open
          ? "border-[var(--color-accent)] bg-orange-500/10 text-[var(--color-accent)]"
          : "border-[var(--border)] hover:border-[var(--color-accent)]"
      }`}
      aria-label="Admin panel"
    >
      Admin
    </button>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-bold transition hover:border-[var(--color-accent)]"
      aria-label={t("toggle-theme")}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)]/60 bg-[var(--bg)]/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-sm font-black tracking-tight transition hover:text-[var(--color-accent)]"
        >
          Kofi Yesu
        </Link>

        {isHome ? (
          <nav className="hidden items-center gap-8 text-sm font-semibold text-[var(--text-muted)] md:flex">
            <a href="#about" className="transition hover:text-[var(--text)]">
              {t("about")}
            </a>
            <a href="#projects" className="transition hover:text-[var(--text)]">
              {t("projects")}
            </a>
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className="transition hover:text-[var(--text)]"
            >
              {t("chat")}
            </button>
          </nav>
        ) : (
          <Link
            to="/"
            className="hidden text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)] md:inline"
          >
            {t("home")}
          </Link>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {isClerkConfigured ? (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-xs font-bold text-white"
                  >
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
                <AdminToggle />
              </SignedIn>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
