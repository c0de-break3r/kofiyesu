import { type MouseEvent, type PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { isClerkConfigured } from "@/lib/clerk";
import { social } from "@/content/social";
import { getLenis } from "@/hooks/useScroll";
import { scrollToSectionHash } from "@/hooks/useHashScroll";
import { t } from "@/i18n/en";

const mailLink = social.find((s) => s.name === "mail")?.url ?? "mailto:hello@kofiyesu.com";

function DesktopAuthActions() {
  const { isLoaded } = useAuth();
  const signInClass =
    "glass-surface rounded-full px-4 py-2 text-sm font-bold text-[var(--text)] transition hover:bg-white/50 hover:border-white/70 hover:text-[var(--color-accent)]";

  if (!isClerkConfigured) {
    return (
      <a href={mailLink} className={signInClass}>
        {t("get-in-touch")}
      </a>
    );
  }

  if (!isLoaded) {
    return <span className="inline-block h-9 w-9 shrink-0 rounded-full bg-white/30" aria-hidden />;
  }

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className={signInClass}>
            {t("sign-in")}
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9 ring-0",
              userButtonTrigger: "focus:shadow-none shadow-none ring-0",
            },
          }}
        />
      </SignedIn>
    </>
  );
}

function NavLink({
  href,
  children,
  onClick,
}: PropsWithChildren<{
  href: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}>) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-white/60 hover:text-[var(--color-accent)]"
    >
      {children}
    </a>
  );
}

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  const handleHomeClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isHome) return;
    e.preventDefault();
    getLenis()?.scrollTo(0, { immediate: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSectionClick = (section: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isHome) return;
    e.preventDefault();
    scrollToSectionHash(section);
  };

  const handleNavSectionClick = (section: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (isHome) {
      handleSectionClick(section)(e);
      return;
    }
    e.preventDefault();
    navigate(section === "hero" ? "/" : `/#${section}`);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 hidden bg-transparent md:block">
      <div className="relative mx-auto flex max-w-6xl items-center justify-end bg-transparent px-6 py-4">
        <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-8 text-sm font-semibold">
          <NavLink href="/" onClick={isHome ? handleHomeClick : undefined}>
            {t("home")}
          </NavLink>
          <NavLink href={isHome ? "#about" : "/#about"} onClick={handleNavSectionClick("about")}>
            {t("about")}
          </NavLink>
          <NavLink href={isHome ? "#projects" : "/#projects"} onClick={handleNavSectionClick("projects")}>
            {t("projects")}
          </NavLink>
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-white/60 hover:text-[var(--color-accent)]"
          >
            {t("chat")}
          </button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <DesktopAuthActions />
        </div>
      </div>
    </header>
  );
}
