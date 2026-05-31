import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { isClerkConfigured } from "@/lib/clerk";
import { isClerkAdminUser } from "@/lib/clerkAdmin";
import { useAdminPanel } from "@/hooks/useAdminPanel";

/** Opens the admin slide-over when an admin user signs in. */
export function AdminSignInOpenPanel() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { setOpen } = useAdminPanel();
  const wasSignedIn = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isClerkConfigured || !isLoaded) return;

    const justSignedIn = wasSignedIn.current === false && isSignedIn;
    wasSignedIn.current = isSignedIn;

    if (justSignedIn && isClerkAdminUser(userId)) {
      setOpen(true);
    }
  }, [isLoaded, isSignedIn, userId, setOpen]);

  return null;
}

/** Floating control for signed-in admins (mobile-safe above bottom nav). */
export function AdminFab() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { toggle, open } = useAdminPanel();
  const onChat = useLocation().pathname.startsWith("/chat");

  if (!isClerkConfigured || !isLoaded || !isSignedIn || !isClerkAdminUser(userId) || open) {
    return null;
  }

  const bottomClass = onChat
    ? "bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:bottom-[5.5rem]"
    : "bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`glass-surface fixed right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full text-lg font-black shadow-lg transition hover:bg-white/50 hover:border-white/70 hover:text-[var(--color-accent)] ${bottomClass}`}
      aria-label={open ? "Close admin panel" : "Open admin CMS"}
      title="Admin CMS"
    >
      ✎
    </button>
  );
}
