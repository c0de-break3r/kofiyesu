import { useEffect, useState } from "react";
import { getLenis } from "@/hooks/useScroll";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { t } from "@/i18n/en";

const DISMISS_KEY = "kofiyesu-scroll-cue-seen";

export function ScrollCue() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reducedMotion || sessionStorage.getItem(DISMISS_KEY) === "1") return;

    const timer = window.setTimeout(() => setVisible(true), 1200);
    const dismiss = () => {
      setVisible(false);
      sessionStorage.setItem(DISMISS_KEY, "1");
    };

    const lenis = getLenis();
    lenis?.on("scroll", dismiss);
    window.addEventListener("scroll", dismiss, { passive: true });

    return () => {
      window.clearTimeout(timer);
      lenis?.off("scroll", dismiss);
      window.removeEventListener("scroll", dismiss);
    };
  }, [reducedMotion]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        sessionStorage.setItem(DISMISS_KEY, "1");
        setVisible(false);
        getLenis()?.scrollTo("#about");
        document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
      }}
      className="pointer-events-auto absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-muted)] transition hover:text-[var(--color-accent)] md:hidden"
      aria-label={t("scroll-explore")}
    >
      <span>{t("scroll-explore")}</span>
      <svg
        className="h-5 w-5 animate-bounce"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M12 5v14M6 13l6 6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
