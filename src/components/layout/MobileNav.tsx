import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isClerkConfigured } from "@/lib/clerk";
import { t } from "@/i18n/en";
import { useAdminPanel } from "@/hooks/useAdminPanel";
import { getLenis } from "@/hooks/useScroll";
import { scrollToSectionHash } from "@/hooks/useHashScroll";

type NavSection = "hero" | "about" | "projects" | "chat";

function NavIcon({ children }: { children: ReactNode }) {
  return <span className="h-5 w-5 [&_svg]:h-full [&_svg]:w-full">{children}</span>;
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconAbout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconProjects() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h6l2 2h8v10H4V7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M4 7V5a1 1 0 0 1 1-1h5l2 2h7a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3V6a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const navItems: {
  id: NavSection;
  icon: typeof IconHome;
  labelKey: "home" | "about" | "projects" | "chat";
}[] = [
  { id: "hero", icon: IconHome, labelKey: "home" },
  { id: "about", icon: IconAbout, labelKey: "about" },
  { id: "projects", icon: IconProjects, labelKey: "projects" },
  { id: "chat", icon: IconChat, labelKey: "chat" },
];

const mobilePillBase =
  "glass-surface flex items-center self-stretch rounded-full px-2 py-2";
const mobilePillMain = `${mobilePillBase} min-w-0 flex-1`;

const MOBILE_AUTH_SIZE = "size-[4.25rem]";
const mobileAuthCircle = `glass-surface flex ${MOBILE_AUTH_SIZE} shrink-0 items-center justify-center rounded-full`;

const NAV_ICON_SIZE = "h-11 w-11";

function MobileNavCell({
  active,
  children,
  className = "",
  bareIcon = false,
}: {
  active?: boolean;
  children: ReactNode;
  className?: string;
  bareIcon?: boolean;
}) {
  const iconClass = `flex ${NAV_ICON_SIZE} shrink-0 items-center justify-center rounded-full transition-colors ${
    active && !bareIcon ? "bg-[var(--color-accent)] text-white" : bareIcon ? "" : "text-neutral-400"
  }`;

  return (
    <div className={`flex min-w-[4.25rem] flex-col items-center px-0.5 py-0.5 ${className}`} aria-hidden>
      {bareIcon ? (
        <div className={`flex ${NAV_ICON_SIZE} shrink-0 items-center justify-center`}>{children}</div>
      ) : (
        <span className={iconClass}>
          <NavIcon>{children}</NavIcon>
        </span>
      )}
    </div>
  );
}

function MobileAuthButton() {
  const signInIcon = (
    <span className={`flex ${NAV_ICON_SIZE} items-center justify-center text-neutral-400`}>
      <NavIcon>
        <IconUser />
      </NavIcon>
    </span>
  );

  if (!isClerkConfigured) {
    return (
      <Link to="/chat" className={mobileAuthCircle} aria-label={t("sign-in")}>
        {signInIcon}
      </Link>
    );
  }

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button
            type="button"
            className={`${mobileAuthCircle} border-0 bg-transparent p-0 font-[inherit]`}
            aria-label={t("sign-in")}
          >
            {signInIcon}
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className={mobileAuthCircle} aria-label="Account">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-14 w-14",
                userButtonTrigger: "focus:shadow-none",
              },
            }}
          />
        </div>
      </SignedIn>
    </>
  );
}

function NavItem({
  active,
  label,
  onClick,
  icon: Icon,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  icon: typeof IconHome;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="min-w-0 flex-1 border-0 bg-transparent p-0 font-[inherit]"
    >
      <MobileNavCell active={active} className="mx-auto w-full min-w-0">
        <Icon />
      </MobileNavCell>
    </button>
  );
}

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { open: adminOpen } = useAdminPanel();
  const [activeSection, setActiveSection] = useState<NavSection | null>("hero");

  const isHome = location.pathname === "/";
  const isProjectRoute = location.pathname.startsWith("/project/");
  const isChatRoute = location.pathname.startsWith("/chat");

  const scrollToSection = (section: NavSection) => {
    setActiveSection(section);
    const lenis = getLenis();
    const target = section === "hero" ? 0 : `#${section}`;

    if (section !== "hero") scrollToSectionHash(section);

    if (lenis) {
      lenis.scrollTo(target, { immediate: section === "hero" });
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return;
    }

    if (section === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollTo = (section: NavSection) => {
    if (section === "chat") {
      navigate("/chat");
      return;
    }

    if (!isHome) {
      navigate(section === "hero" ? "/" : `/#${section}`);
      window.setTimeout(() => scrollToSection(section), 50);
      return;
    }

    scrollToSection(section);
  };

  useEffect(() => {
    if (!isHome) {
      setActiveSection(null);
      return;
    }

    const sections: { id: NavSection; trigger: string }[] = [
      { id: "hero", trigger: "#hero" },
      { id: "about", trigger: "#about" },
      { id: "projects", trigger: "#projects" },
    ];

    const observers = sections.map(({ id, trigger }) => {
      const el = document.querySelector(trigger);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
      );
      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, [isHome, location.pathname]);

  if (isProjectRoute || isChatRoute || adminOpen) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-[calc(12px+env(safe-area-inset-bottom,0px))] z-[90] flex items-center justify-center gap-3 px-4 md:hidden"
      aria-label="Mobile navigation"
    >
      <nav className={`${mobilePillMain} justify-around`}>
        {navItems.map(({ id, icon, labelKey }) => (
          <NavItem
            key={id}
            active={id === "chat" ? location.pathname.startsWith("/chat") : activeSection === id}
            label={t(labelKey)}
            icon={icon}
            onClick={() => scrollTo(id)}
          />
        ))}
      </nav>
      <MobileAuthButton />
    </div>
  );
}
