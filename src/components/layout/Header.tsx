import { type MouseEvent, type PropsWithChildren } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { isClerkConfigured } from "@/lib/clerk";
import { social } from "@/content/social";
import { useHeaderScroll } from "@/hooks/useHeaderScroll";
import { getLenis } from "@/hooks/useScroll";
import { scrollToSectionHash } from "@/hooks/useHashScroll";
import { Logo } from "@/components/layout/Logo";
import { t } from "@/i18n/en";

const mailLink = social.find((s) => s.name === "mail")?.url ?? "mailto:hello@kofiyesu.com";

function DesktopAuthActions() {
  const { isLoaded } = useAuth();
  const signInClass =
    "rounded-full px-4 py-2 text-sm font-bold text-[var(--text)] transition hover:bg-white/50 hover:text-[var(--color-accent)]";

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
  const scrolledPastHero = useHeaderScroll(isHome);

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

  const showLogo = !isHome || scrolledPastHero;

  return (
    <header className="fixed inset-x-0 top-0 z-50 hidden md:block transition-all duration-300">
      <div
        className={`mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4 transition-all duration-300 ${
          isHome && !scrolledPastHero ? "bg-transparent" : "bg-white/95 backdrop-blur-xl"
        }`}
      >
        <Link
          to="/"
          className={`flex items-center gap-3 justify-self-start transition hover:opacity-90 ${
            showLogo ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <Logo size={40} />
          <span className="text-sm font-black tracking-tight text-[var(--text)]">Kofi Yesu</span>
        </Link>

        <nav className="flex items-center justify-self-center gap-8 text-sm font-semibold">
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

        <div className="flex items-center gap-2 sm:gap-3 justify-self-end">
          <DesktopAuthActions />
        </div>
      </div>
    </header>
  );
}
