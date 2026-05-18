import { ref } from "vue";

/** Shared sound gate state — keep this file free of imports from sounds/utils or core. */
export const howlerUnlocked = ref(false);
export const soundsEnabled = ref(false);
