import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isClerkConfigured } from "@/lib/clerk";
import { t } from "@/i18n/en";
import { getLenis } from "@/hooks/useScroll";
import { scrollToSectionHash } from "@/hooks/useHashScroll";

type NavSection = "hero" | "about" | "projects" | "chat";

function NavIcon({ children }: { children: ReactNode }) {
  return <span className="h-[18px] w-[18px] [&_svg]:h-full [&_svg]:w-full">{children}</span>;
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

const mobilePillClass =
  "rounded-full bg-white px-2 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.1)]";

function MobileAuthButton() {
  const iconWrap = (children: ReactNode, active = false) => (
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
        active ? "bg-[var(--color-accent)] text-white" : "text-neutral-400"
      }`}
    >
      <NavIcon>{children}</NavIcon>
    </span>
  );

  const labelClass = (active = false) =>
    `text-[11px] font-semibold leading-none ${active ? "text-[var(--color-accent)]" : "text-neutral-400"}`;

  if (!isClerkConfigured) {
    return (
      <Link
        to="/chat"
        className={`flex shrink-0 flex-col items-center gap-1 px-0.5 py-0.5 ${mobilePillClass}`}
        aria-label={t("sign-in")}
      >
        {iconWrap(<IconUser />)}
        <span className={labelClass()}>{t("sign-in")}</span>
      </Link>
    );
  }

  return (
    <div className={`flex shrink-0 flex-col items-center gap-1 px-0.5 py-0.5 ${mobilePillClass}`}>
      <SignedOut>
        <SignInButton mode="modal">
          <button
            type="button"
            className="flex flex-col items-center gap-1 border-0 bg-transparent p-0 font-[inherit]"
            aria-label={t("sign-in")}
          >
            {iconWrap(<IconUser />)}
            <span className={labelClass()}>{t("sign-in")}</span>
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-10 w-10",
            },
          }}
        />
        <span className={labelClass()}>Account</span>
      </SignedIn>
    </div>
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
      className="flex min-w-0 flex-1 flex-col items-center gap-1 border-0 bg-transparent px-0.5 py-0.5 font-[inherit]"
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          active ? "bg-[var(--color-accent)] text-white" : "text-neutral-400"
        }`}
      >
        <NavIcon>
          <Icon />
        </NavIcon>
      </span>
      <span
        className={`text-[11px] font-semibold leading-none ${
          active ? "text-[var(--color-accent)]" : "text-neutral-400"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<NavSection | null>("hero");

  const isHome = location.pathname === "/";
  const isProjectRoute = location.pathname.startsWith("/project/");

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

  if (isProjectRoute) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-[calc(12px+env(safe-area-inset-bottom,0px))] z-[90] flex items-end justify-center gap-3 px-4 md:hidden"
      aria-label="Mobile navigation"
    >
      <nav className={`flex min-w-0 flex-1 items-center justify-around ${mobilePillClass}`}>
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
