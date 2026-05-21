import { ref, watch, onMounted } from "vue";
import { resources, scheduleResourceLoading } from "../utils/resources";
import gsap from "gsap";

export const preloaderVisible = ref(true);

export const dismissPreloader = () => {
  document.body.classList.remove("is-loading");
  const preloader = document.querySelector(".preloader");
  preloader?.classList.add("preloader-hidden");
  preloaderVisible.value = false;
};

const tryDismiss = (() => {
  let dismissed = false;
  return () => {
    if (dismissed) return;
    dismissed = true;
    try {
      gsap.delayedCall(0.15, dismissPreloader);
    } catch {
      dismissPreloader();
    }
  };
})();

/** Called from index.html fallback before Vue is ready. */
export const forceDismissPreloader = () => {
  tryDismiss();
  dismissPreloader();
};

const syncResourcesProgress = () => {
  if (resources.isReady || resources.toLoad === 0) return 1;
  return resources.loaded / Math.max(resources.toLoad, 1);
};

if (typeof window !== "undefined") {
  window.addEventListener("preloader:force-dismiss", forceDismissPreloader);
}

export const usePreloader = () => {
  const progress = ref(0);
  const resourcesProgress = ref(syncResourcesProgress());

  if (!resources.isReady) {
    resources.on("progress", (newProgress) => {
      resourcesProgress.value = newProgress;
    });
    resources.once("ready", () => {
      resourcesProgress.value = 1;
    });
  }

  onMounted(() => {
    scheduleResourceLoading();
    resourcesProgress.value = syncResourcesProgress();

    if (resources.isReady) {
      resourcesProgress.value = 1;
    }

    window.setTimeout(tryDismiss, 4_000);
    window.addEventListener("pointerdown", tryDismiss, { once: true, passive: true });
  });

  watch(
    resourcesProgress,
    (newProgress) => {
      progress.value = 0.25 + newProgress * 0.75;
    },
    { immediate: true },
  );

  watch(progress, (newProgress) => {
    if (newProgress >= 1) tryDismiss();

    const rect = document.querySelector(".preloader-rect") as HTMLElement | null;
    if (rect) rect.style.transform = `scaleY(${newProgress})`;
  });
};
