import { onMounted, onUnmounted, ref, watch } from "vue";
import gsap from "gsap";
import { lerp } from "../../../utils/math";
import { Howler } from "howler";
import { isFeatureEnabled } from "../../../utils/features";
import { tick as contactTick } from "../core/contact";
import { stopSnoreRepetition, startContactAmbient } from "../core/contact";
import { tick as roomTick } from "../core/room";
import { sounds } from "../definitions/sounds";
import { getSoundsHowl } from "../utils/sounds";

import type { SoundKey } from "../types";
import { howlerUnlocked, soundsEnabled } from "../soundState";

export { howlerUnlocked, soundsEnabled };

Howler.volume(0);

export const useHowler = () => {
  const enabledVolume = ref<number>(0);

  const handleUnlocked = () => {
    howlerUnlocked.value = true;

    const storeItem = localStorage.getItem("portfolio-soundsEnabled");
    if (storeItem) {
      soundsEnabled.value = storeItem === "true";
    } else {
      soundsEnabled.value = true;
      localStorage.setItem("portfolio-soundsEnabled", "true");
    }

    if (soundsEnabled.value) {
      startContactAmbient();
    }
  };

  const tick = () => {
    if (!howlerUnlocked.value) {
      if (Howler.ctx.state !== "running") return;
      handleUnlocked();
    } else {
      contactTick();
      roomTick();

      const currentVolume = Howler.volume();
      if (currentVolume > 0.99 && enabledVolume.value === 1) {
        return;
      }
      const speed = enabledVolume.value === 1 ? 0.01 : 0.05;
      Howler.volume(lerp(currentVolume, enabledVolume.value, speed));
    }
  };

  const handleVisibilityChange = () => {
    Howler.mute(document.visibilityState === "hidden");
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.code === "KeyM") {
      soundsEnabled.value = !soundsEnabled.value;
    }
  };

  watch(soundsEnabled, (newVal) => {
    if (!isFeatureEnabled("sounds")) return;
    enabledVolume.value = newVal ? 1 : 0;
    localStorage.setItem("portfolio-soundsEnabled", newVal.toString());

    if (!howlerUnlocked.value) return;

    if (newVal) {
      startContactAmbient();
    } else {
      stopSnoreRepetition();
    }
  });

  const loadAllSounds = () => {
    for (const sound of Object.keys(sounds) as SoundKey[]) {
      const howl = getSoundsHowl(sound);
      if (howl) {
        howl.load();
      }
    }
  };

  onMounted(() => {
    if (!isFeatureEnabled("sounds")) return;
    Howler.volume(0);

    if (howlerUnlocked.value) {
      soundsEnabled.value = localStorage.getItem("portfolio-soundsEnabled") === "true";
    }

    gsap.ticker.add(tick);
    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleKeyPress);

    loadAllSounds();
  });

  onUnmounted(() => {
    if (!isFeatureEnabled("sounds")) return;
    gsap.ticker.remove(tick);
    window.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("keydown", handleKeyPress);
    stopSnoreRepetition();
  });
};
