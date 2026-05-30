import { Howler } from "howler";
import { howlerUnlocked } from "./soundState";

let gestureListenerAttached = false;

/** Resume Web Audio / Howler only after a user gesture (browser policy). */
export const attachAudioUnlockOnGesture = (onUnlock?: () => void) => {
  if (gestureListenerAttached || typeof window === "undefined") return;
  gestureListenerAttached = true;

  const unlock = () => {
    const ctx = Howler.ctx;
    if (ctx?.state === "suspended") {
      void ctx.resume().catch(() => {});
    }
    howlerUnlocked.value = true;
    onUnlock?.();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };

  window.addEventListener("pointerdown", unlock, { once: true, passive: true });
  window.addEventListener("keydown", unlock, { once: true });
};
