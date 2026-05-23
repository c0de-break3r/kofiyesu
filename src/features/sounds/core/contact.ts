import { playSound } from "../utils/sounds";
import { sprites } from "../definitions/sprites";
import { sceneWeights } from "../../../animations/scenes";
import { clamp } from "../../../utils/math";
import { projectVisible } from "@/lib/routeState";
import gsap from "gsap";

const SNORE_INTERVAL = 2.0833332538604736 * 2;

let snoreTimeout: gsap.core.Tween | null = null;
let currentId: number | undefined;

const scheduleNextSnore = () => {
  if (snoreTimeout) {
    snoreTimeout.kill();
  }

  snoreTimeout = gsap.delayedCall(SNORE_INTERVAL, () => {
    currentId = playSound("snore");
    scheduleNextSnore();
  });
};

let ambientStarted = false;

export const startContactAmbient = () => {
  if (ambientStarted) return;
  ambientStarted = true;
  scheduleNextSnore();
};

export const tick = () => {
  const volume = projectVisible.value ? 0 : clamp(sceneWeights.contact * 0.5, 0, 1);
  sprites.contact.howl.volume(volume);
};

export const stopSnoreRepetition = () => {
  ambientStarted = false;
  if (snoreTimeout) {
    snoreTimeout.kill();
    snoreTimeout = null;
  }
  if (currentId) {
    sprites.contact.howl.stop(currentId);
    currentId = undefined;
  }
};
