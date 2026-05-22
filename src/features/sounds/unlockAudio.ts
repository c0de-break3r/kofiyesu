import { Howler } from "howler";

let gestureListenerAttached = false;

/** Resume Web Audio / Howler only after a user gesture (browser policy). */
export const attachAudioUnlockOnGesture = (onUnlock?: () => void) => {
  if (gestureListenerAttached || typeof window === "undefined") return;
  gestureListenerAttached = true;

  Howler.autoUnlock = true;

  const unlock = () => {
    const ctx = Howler.ctx;
    if (ctx?.state === "suspended") {
      void ctx.resume().catch(() => {});
    }
    onUnlock?.();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };

  window.addEventListener("pointerdown", unlock, { once: true, passive: true });
  window.addEventListener("keydown", unlock, { once: true });
};
