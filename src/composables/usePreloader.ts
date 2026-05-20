import { ref, watch, onMounted } from "vue";
import { resources, scheduleResourceLoading } from "../utils/resources";
import gsap from "gsap";

export const preloaderVisible = ref(true);

const dismissPreloader = () => {
  document.body.classList.remove("is-loading");
  const preloader = document.querySelector(".preloader");
  preloader?.classList.add("preloader-hidden");
  preloaderVisible.value = false;
};

export const usePreloader = () => {
  const progress = ref(0);
  const resourcesProgress = ref(0);
  let dismissed = false;

  const tryDismiss = () => {
    if (dismissed) return;
    dismissed = true;
    gsap.delayedCall(0.15, dismissPreloader);
  };

  resourcesProgress.value = resources.isReady ? 1 : resources.loaded / Math.max(resources.toLoad, 1);

  if (!resources.isReady) {
    resources.on("progress", (newProgress) => {
      resourcesProgress.value = newProgress;
    });
    resources.on("ready", () => {
      resourcesProgress.value = 1;
    });
  }

  onMounted(() => {
    scheduleResourceLoading();

    if (resources.isReady) {
      resourcesProgress.value = 1;
    }

    // Never block the UI for more than a few seconds (slow networks, blocked assets).
    window.setTimeout(tryDismiss, 4_000);

    const onInteract = () => tryDismiss();
    window.addEventListener("pointerdown", onInteract, { once: true, passive: true });
  });

  watch(
    resourcesProgress,
    (newProgress) => {
      progress.value = 0.25 + newProgress * 0.75;
    },
    { immediate: true },
  );

  watch(progress, (newProgress) => {
    if (newProgress >= 1) {
      tryDismiss();
    }

    const rect = document.querySelector(".preloader-rect") as HTMLElement | null;
    if (rect) rect.style.transform = `scaleY(${newProgress})`;
  });
};
