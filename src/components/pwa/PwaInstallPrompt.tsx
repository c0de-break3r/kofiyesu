import { useLocation } from "react-router-dom";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { SITE_SHORT_NAME } from "@/lib/siteMeta";

export function PwaInstallPrompt() {
  const { state, installing, dismiss, install } = usePwaInstall();
  const onChat = useLocation().pathname.startsWith("/chat");

  if (state === "hidden" || onChat) return null;

  const isIos = state === "ios";

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
      className="fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom,0px))] z-[85] px-4 md:inset-x-auto md:bottom-6 md:right-6 md:max-w-sm md:px-0"
    >
      <div className="glass-surface overflow-hidden rounded-2xl border border-white/60 shadow-[0_16px_48px_rgb(0_0_0_0.12)]">
        <div className="flex gap-3 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[22%] bg-[var(--bg)] shadow-sm">
            <img
              src="/meta/icon-192.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-[22%] object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p id="pwa-install-title" className="text-sm font-black leading-snug text-[var(--text)]">
              {isIos ? "Add to Home Screen" : `Install ${SITE_SHORT_NAME}`}
            </p>
            <p id="pwa-install-desc" className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
              {isIos
                ? "Tap Share in Safari, then “Add to Home Screen” for a faster, app-like experience."
                : "Add this portfolio to your home screen for quicker access, offline-ready pages, and a smoother visit."}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-full p-1 text-[var(--text-muted)] transition hover:bg-black/5 hover:text-[var(--text)]"
            aria-label="Dismiss install suggestion"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {!isIos ? (
          <div className="flex gap-2 border-t border-[var(--border)] bg-white/40 px-4 py-3">
            <button
              type="button"
              onClick={dismiss}
              className="flex-1 rounded-full border border-[var(--border)] px-3 py-2 text-xs font-bold text-[var(--text-muted)] transition hover:border-[var(--color-accent)]"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={() => void install()}
              disabled={installing}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--color-accent)] px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--color-accent-deep)] disabled:opacity-60"
            >
              {installing ? "Installing…" : "Install app"}
            </button>
          </div>
        ) : (
          <div className="border-t border-[var(--border)] bg-white/40 px-4 py-3">
            <button
              type="button"
              onClick={dismiss}
              className="w-full rounded-full bg-[var(--color-accent)] px-3 py-2 text-xs font-bold text-white"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
