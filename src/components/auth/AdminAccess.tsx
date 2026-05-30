import { useEffect, useRef } from "react";
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

  if (!isClerkConfigured || !isLoaded || !isSignedIn || !isClerkAdminUser(userId)) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-lg font-black shadow-lg transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] md:bottom-6"
      aria-label={open ? "Close admin panel" : "Open admin CMS"}
      title="Admin CMS"
    >
      ✎
    </button>
  );
}
