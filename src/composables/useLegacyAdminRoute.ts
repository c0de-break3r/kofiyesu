import { watch } from "vue";
import { path } from "./useRouteObserver";
import { useRouter } from "./useRouter";
import { useClerkAdmin } from "./useClerkAdmin";
import { useAdminPanel } from "./useAdminPanel";

/** Legacy /admin URLs redirect home; admins can open the inline panel from the header. */
export function useLegacyAdminRoute() {
  const router = useRouter();
  const { canAccessAdmin, isLoaded } = useClerkAdmin();
  const { open } = useAdminPanel();

  watch(
    [path, isLoaded, canAccessAdmin],
    () => {
      if (!path.value.startsWith("/admin")) return;

      router.replace("/");

      if (isLoaded.value && canAccessAdmin.value) {
        open();
      }
    },
    { immediate: true },
  );
}
