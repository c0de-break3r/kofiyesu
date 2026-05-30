import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_DAYS = 14;

export type PwaInstallState = "hidden" | "prompt" | "ios";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (Number.isNaN(dismissedAt)) return false;
    return Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function usePwaInstall() {
  const [state, setState] = useState<PwaInstallState>("hidden");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setState("hidden");
  }, []);

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if (isIos()) {
      const iosTimer = window.setTimeout(() => setState("ios"), 8000);
      return () => {
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        window.clearTimeout(iosTimer);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  useEffect(() => {
    if (!deferred || isStandalone() || wasDismissedRecently() || isIos()) return;
    const timer = window.setTimeout(() => setState("prompt"), 5000);
    return () => window.clearTimeout(timer);
  }, [deferred]);

  const install = useCallback(async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") {
        setState("hidden");
        setDeferred(null);
      }
    } finally {
      setInstalling(false);
    }
  }, [deferred]);

  return {
    state,
    installing,
    dismiss,
    install,
  };
}
