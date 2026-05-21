import { ref } from "vue";
import { isClerkConfigured } from "./clerk";

/** True once `@clerk/vue` plugin is registered (or Clerk is disabled). */
export const clerkReady = ref(!isClerkConfigured);

export function markClerkReady() {
  clerkReady.value = true;
}
