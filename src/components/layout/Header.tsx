import { type MouseEvent, type PropsWithChildren } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { isClerkConfigured } from "@/lib/clerk";
import { social } from "@/content/social";
import { useHeaderScroll } from "@/hooks/useHeaderScroll";
import { getLenis } from "@/hooks/useScroll";
import { scrollToSectionHash } from "@/hooks/useHashScroll";
import { Logo } from "@/components/layout/Logo";
import { t } from "@/i18n/en";

const mailLink = social.find((s) => s.name === "mail")?.url ?? "mailto:hello@kofiyesu.dev";

function DesktopAuthActions() {
  const signInClass =
    "glass-surface rounded-full px-4 py-2 text-sm font-bold text-[var(--text)] transition hover:bg-white/50 hover:border-white/70";

  if (!isClerkConfigured) {
    return (
      <a href={mailLink} className={signInClass}>
        {t("get-in-touch")}
      </a>
    );
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
        <div className="glass-surface rounded-full p-1">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
                userButtonTrigger: "focus:shadow-none",
              },
            }}
          />
        </div>
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

  const pillMode = isHome && scrolledPastHero;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 hidden md:block transition-all duration-300 ${
        pillMode ? "pt-4" : ""
      }`}
    >
      <div className={pillMode ? "flex justify-center px-4" : ""}>
      <div
        className={`transition-all duration-300 ${
          pillMode
            ? "flex max-w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-white/95 px-3 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl"
            : `mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4 ${
                isHome
                  ? "border-b border-transparent bg-transparent"
                  : "border-b border-[var(--border)] bg-white/95 backdrop-blur-xl"
              }`
        }`}
      >
        <Link
          to="/"
          className={`flex items-center gap-3 transition hover:opacity-90 ${
            pillMode ? "pr-2" : "justify-self-start"
          } ${isHome && !scrolledPastHero ? "pointer-events-none opacity-0" : "opacity-100"}`}
        >
          <Logo size={pillMode ? 32 : 40} />
          <span className="text-sm font-black tracking-tight text-[var(--text)]">Kofi Yesu</span>
        </Link>

        {isHome ? (
          <nav
            className={`flex items-center gap-1 ${pillMode ? "" : "justify-self-center gap-8 text-sm font-semibold"}`}
          >
            <NavLink href="/" onClick={handleHomeClick}>
              {t("home")}
            </NavLink>
            <NavLink href="#about" onClick={handleSectionClick("about")}>
              {t("about")}
            </NavLink>
            <NavLink href="#projects" onClick={handleSectionClick("projects")}>
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
        ) : (
          <Link
            to="/"
            className={`text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--color-accent)] ${
              pillMode ? "" : "justify-self-center"
            }`}
          >
            {t("home")}
          </Link>
        )}

        <div className={`flex items-center gap-2 sm:gap-3 ${pillMode ? "pl-2" : "justify-self-end"}`}>
          <DesktopAuthActions />
        </div>
      </div>
      </div>
    </header>
  );
}
