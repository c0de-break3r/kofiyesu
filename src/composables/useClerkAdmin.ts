import { computed } from "vue";
import { useAuth, useUser, useClerk } from "@clerk/vue";
import { isClerkAdminUser, isClerkAdminConfigured } from "../lib/clerkAdmin";
import { isClerkConfigured } from "../lib/clerk";

export function useClerkAdmin() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  const signOut = async () => {
    await clerk.value?.signOut({ redirectUrl: "/" });
  };

  const isAdmin = computed(() => isClerkAdminUser(userId.value));

  const canAccessAdmin = computed(
    () => isClerkConfigured && isClerkAdminConfigured && isSignedIn.value && isAdmin.value,
  );

  return {
    isSignedIn,
    isLoaded,
    isAdmin,
    canAccessAdmin,
    isClerkAdminConfigured,
    isClerkConfigured,
    user,
    userId,
    signOut,
  };
}
