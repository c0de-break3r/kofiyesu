import { ref, watch } from "vue";
import { useAuth } from "@clerk/vue";
import { isClerkAdminUser } from "../lib/clerkAdmin";
import { path } from "./useRouteObserver";
import { useRouter } from "./useRouter";

/** After Clerk sign-in, send admin users to /admin instead of the client site. */
export function useClerkAdminRedirect() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();
  const wasSignedIn = ref(false);
  const hasInitialized = ref(false);

  watch(
    [isLoaded, isSignedIn, userId, path],
    () => {
      if (!isLoaded.value) return;

      const signedIn = Boolean(isSignedIn.value);

      if (!hasInitialized.value) {
        hasInitialized.value = true;
        wasSignedIn.value = signedIn;
        return;
      }

      const justSignedIn = signedIn && !wasSignedIn.value;
      wasSignedIn.value = signedIn;

      if (!justSignedIn || !isClerkAdminUser(userId.value)) return;
      if (path.value.startsWith("/admin")) return;

      router.replace("/admin");
    },
    { immediate: true },
  );
}
