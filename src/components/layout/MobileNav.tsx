import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { t } from "@/i18n/en";
import { getLenis } from "@/hooks/useScroll";

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
        d="M12 3C7.03 3 3 6.58 3 11c0 2.03.9 3.88 2.4 5.28L4 21l5.05-1.35A9.8 9.8 0 0 0 12 19c4.97 0 9-3.58 9-8s-4.03-8-9-8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const scrollItems: { id: Exclude<NavSection, "chat" | "hero">; icon: typeof IconAbout; labelKey: "about" | "projects" }[] = [
  { id: "about", icon: IconAbout, labelKey: "about" },
  { id: "projects", icon: IconProjects, labelKey: "projects" },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<NavSection | null>("hero");

  const isChatRoute = location.pathname.startsWith("/chat");
  const isProjectRoute = location.pathname.startsWith("/project/");
  const isHome = location.pathname === "/";
  const hidden = isProjectRoute;

  const scrollToSection = (section: NavSection) => {
    setActiveSection(section);
    const lenis = getLenis();
    const target = section === "hero" ? 0 : `#${section}`;

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
      setActiveSection("chat");
      return;
    }

    if (!isHome) {
      navigate("/");
      window.setTimeout(() => scrollToSection(section), 50);
      return;
    }

    scrollToSection(section);
  };

  useEffect(() => {
    if (isChatRoute) {
      setActiveSection("chat");
      return;
    }

    if (!isHome) {
      setActiveSection(null);
      return;
    }

    const sections: { id: Exclude<NavSection, "chat">; trigger: string }[] = [
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
  }, [isChatRoute, isHome, location.pathname]);

  if (hidden) return null;

  return (
    <div
      className="fixed bottom-[calc(12px+env(safe-area-inset-bottom,0px))] left-1/2 z-[90] flex w-[calc(100%-24px)] max-w-[420px] -translate-x-1/2 items-center justify-center md:hidden"
      aria-label="Mobile navigation"
    >
      <nav className="flex w-full items-center justify-around gap-0.5 rounded-full border border-white/10 bg-[rgba(15,20,25,0.88)] px-2 py-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl [data-theme=light]:border-[rgba(26,29,33,0.08)] [data-theme=light]:bg-[rgba(255,255,255,0.92)] [data-theme=light]:shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
        <button
          type="button"
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full border-0 bg-transparent px-1 py-2 font-[inherit] text-[10px] font-semibold tracking-wide transition ${
            activeSection === "hero"
              ? "bg-white/12 text-white [data-theme=light]:text-[var(--text)]"
              : "text-white/55 [data-theme=light]:text-[rgba(26,29,33,0.45)]"
          }`}
          onClick={() => scrollTo("hero")}
          aria-label={t("home")}
          aria-current={activeSection === "hero" ? "page" : undefined}
        >
          <NavIcon>
            <IconHome />
          </NavIcon>
          <span>{t("home")}</span>
        </button>

        {scrollItems.map(({ id, icon: Icon, labelKey }) => (
          <button
            key={id}
            type="button"
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full border-0 bg-transparent px-1 py-2 font-[inherit] text-[10px] font-semibold tracking-wide transition ${
              activeSection === id
                ? "bg-white/12 text-white [data-theme=light]:text-[var(--text)]"
                : "text-white/55 [data-theme=light]:text-[rgba(26,29,33,0.45)]"
            }`}
            onClick={() => scrollTo(id)}
            aria-label={t(labelKey)}
            aria-current={activeSection === id ? "page" : undefined}
          >
            <NavIcon>
              <Icon />
            </NavIcon>
            <span>{t(labelKey)}</span>
          </button>
        ))}

        <button
          type="button"
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full border-0 bg-transparent px-1 py-2 font-[inherit] text-[10px] font-semibold tracking-wide transition ${
            activeSection === "chat"
              ? "bg-white/12 text-white [data-theme=light]:text-[var(--text)]"
              : "text-white/55 [data-theme=light]:text-[rgba(26,29,33,0.45)]"
          }`}
          onClick={() => scrollTo("chat")}
          aria-label={t("chat")}
          aria-current={activeSection === "chat" ? "page" : undefined}
        >
          <NavIcon>
            <IconChat />
          </NavIcon>
          <span>{t("chat")}</span>
        </button>
      </nav>
    </div>
  );
}
